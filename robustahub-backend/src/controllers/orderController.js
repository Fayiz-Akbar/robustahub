const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { Xendit } = require('xendit-node');

// Inisialisasi Xendit dengan Secret Key dari file .env
const xenditClient = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY });
const { Invoice } = xenditClient;

const createOrder = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { items, courierName, shippingCost } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Keranjang belanja kosong!' });
    }

    // 1. SIMPAN KE DATABASE (Menggunakan Prisma Transaction)
    const newOrder = await prisma.$transaction(async (tx) => {
      let totalAmount = shippingCost ? parseInt(shippingCost) : 0;
      let orderItemsData = [];

      for (let item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });

        if (!product) throw new Error(`Produk tidak ditemukan`);
        if (product.stock < item.quantity) throw new Error(`Stok ${product.name} tidak cukup!`);

        totalAmount += product.price * item.quantity;

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          priceAtBuy: product.price
        });

        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity }
        });
      }

      const order = await tx.order.create({
        data: {
          buyerId,
          totalAmount,
          status: 'PENDING',
          items: {
            create: orderItemsData
          },
          // Karena di schema.prisma kamu ada relasi Shipment
          shipment: {
            create: {
              shippingCost: shippingCost ? parseInt(shippingCost) : 0,
              courierName: courierName || "Kurir B2B"
            }
          }
        },
        include: { items: true }
      });

      return order;
    });

    // 2. MINTA LINK PEMBAYARAN KE XENDIT
    const xenditInvoice = await Invoice.createInvoice({
      data: {
        externalId: newOrder.id, // ID Order database kita
        amount: newOrder.totalAmount,
        description: `Pembayaran Biji Kopi RobustaHub - Order ${newOrder.id}`,
        successRedirectUrl: 'http://localhost:5173/riwayat-pesanan',
        failureRedirectUrl: 'http://localhost:5173/keranjang-belanja',
      }
    });

    // 3. SIMPAN LINK PEMBAYARAN KE TABEL PAYMENT
    await prisma.payment.create({
      data: {
        orderId: newOrder.id,
        amount: newOrder.totalAmount,
        xenditInvoiceId: xenditInvoice.id,
        paymentUrl: xenditInvoice.invoiceUrl,
        status: 'PENDING'
      }
    });

    // 4. KIRIM BALASAN KE POSTMAN / FRONTEND
    res.status(201).json({
      message: 'Pesanan berhasil dibuat! Silakan lakukan pembayaran.',
      paymentUrl: xenditInvoice.invoiceUrl,
      data: newOrder
    });

  } catch (error) {
    console.error("Error saat membuat pesanan:", error);
    if (error.message.includes('tidak ditemukan') || error.message.includes('tidak cukup')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat memproses checkout.' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const orders = await prisma.order.findMany({
      where: { buyerId: buyerId },
      include: {
        items: { include: { product: { select: { name: true } } } },
        payment: true, // Tampilkan data pembayaran juga
        shipment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      message: 'Berhasil mengambil riwayat pesanan! ',
      data: orders
    });
  } catch (error) {
    console.error("Error saat mengambil riwayat pesanan:", error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// 5. SISTEM WEBHOOK UNTUK MENERIMA NOTIFIKASI DARI XENDIT
const xenditWebhook = async (req, res) => {
  try {
    const { external_id, status } = req.body;
    const orderId = external_id;

    if (status === 'PAID' || status === 'SETTLED') {
      // Ubah status order jadi PAID
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' }
      });

      // Ubah status payment jadi SUCCESS
      await prisma.payment.updateMany({
        where: { orderId: orderId },
        data: { status: 'SUCCESS' }
      });

      console.log(` HORE! Pesanan ${orderId} berhasil DIBAYAR LUNAS!`);
    }

    return res.status(200).json({ message: 'Webhook berhasil diterima' });
  } catch (error) {
    console.error("Error pada Webhook Xendit:", error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada webhook server.' });
  }
};

// Fungsi untuk memproses pengiriman dan memasukkan nomor resi
const updateTrackingNumber = async (req, res) => {
  try {
    const { id } = req.params; // ID pesanan (OrderId)
    
    // UBAH DARI trackingNumber MENJADI waybillNumber
    const { waybillNumber } = req.body;

    if (!waybillNumber) {
      return res.status(400).json({ message: 'Nomor resi tidak boleh kosong!' });
    }

    // Ubah status order jadi SHIPPED dan simpan nomor resi ke tabel Shipment
    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: {
        status: 'SHIPPED',
        shipment: {
          update: {
            waybillNumber: waybillNumber // <-- PERBAIKAN DI SINI
          }
        }
      },
      include: {
        shipment: true // Tampilkan data pengiriman di hasil respons
      }
    });

    res.status(200).json({
      message: 'Pesanan berhasil diproses! Nomor resi telah disimpan.',
      data: updatedOrder
    });

  } catch (error) {
    console.error("Error saat update resi:", error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat memperbarui resi.' });
  }
};

module.exports = { createOrder, getMyOrders, xenditWebhook, updateTrackingNumber };