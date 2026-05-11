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
      let totalAmount = (shippingCost ? parseInt(shippingCost) : 0) + 5000;
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
        externalId: newOrder.id, 
        amount: newOrder.totalAmount,
        description: `Pembayaran Biji Kopi RobustaHub - Order ${newOrder.id}`,
        successRedirectUrl: 'http://localhost:5173/riwayat',
        failureRedirectUrl: 'http://localhost:5173/keranjang',
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

    // 4. KIRIM BALASAN KE FRONTEND
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
        items: { include: { product: true } }, 
        payment: true, 
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
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' }
      });

      await prisma.payment.updateMany({
        where: { orderId: orderId },
        data: { status: 'SUCCESS' }
      });

      // NOTIFIKASI PEMBAYARAN BERHASIL (KE PEMBELI)
      await prisma.notification.create({
        data: {
          userId: updatedOrder.buyerId,
          title: "Pembayaran Berhasil!",
          message: `Pembayaran sebesar Rp ${updatedOrder.totalAmount.toLocaleString('id-ID')} untuk pesanan #${orderId.substring(0,8).toUpperCase()} telah berhasil diverifikasi.`,
          type: "success",
          link: "/riwayat"
        }
      });

      console.log(` HORE! Pesanan ${orderId} berhasil DIBAYAR LUNAS!`);
    }

    return res.status(200).json({ message: 'Webhook berhasil diterima' });
  } catch (error) {
    console.error("Error pada Webhook Xendit:", error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada webhook server.' });
  }
};

const updateTrackingNumber = async (req, res) => {
  try {
    const { id } = req.params; 
    const { waybillNumber } = req.body;

    if (!waybillNumber) {
      return res.status(400).json({ message: 'Nomor resi tidak boleh kosong!' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: {
        status: 'SHIPPED',
        shipment: {
          update: { waybillNumber: waybillNumber }
        }
      },
      include: { shipment: true }
    });

    // NOTIFIKASI BARANG DIKIRIM (KE PEMBELI)
    await prisma.notification.create({
      data: {
        userId: updatedOrder.buyerId,
        title: "Pesanan Sedang Dikirim!",
        message: `Pesanan Anda #${updatedOrder.id.substring(0,8).toUpperCase()} telah diserahkan ke ${updatedOrder.shipment.courierName} dengan resi ${waybillNumber}.`,
        type: "delivery",
        link: "/riwayat"
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

// =========================================================================
// FUNGSI KHUSUS PETANI
// =========================================================================

const getIncomingOrders = async (req, res) => {
  try {
    const petaniId = req.user.id;
    
    const incomingOrders = await prisma.order.findMany({
      where: {
        items: {
          some: { product: { petaniId: petaniId } }
        }
      },
      include: {
        items: { include: { product: true } },
        payment: true,
        shipment: true,
        buyer: { select: { name: true, phone: true, address: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      message: 'Berhasil mengambil pesanan masuk!',
      data: incomingOrders
    });
  } catch (error) {
    console.error("Error saat mengambil pesanan masuk:", error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: { status: status }
    });

    res.status(200).json({
      message: `Status pesanan berhasil diubah menjadi ${status}!`,
      data: updatedOrder
    });
  } catch (error) {
    console.error("Error update status pesanan:", error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat update status.' });
  }
};

const completeOrderForBuyer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: { status: 'COMPLETED' },
      include: { items: { include: { product: true } } }
    });

    // NOTIFIKASI PESANAN SELESAI (KE PETANI)
    const petaniId = updatedOrder.items[0].product.petaniId;
    await prisma.notification.create({
      data: {
        userId: petaniId,
        title: "Pesanan Selesai!",
        message: `Pembeli telah menerima pesanan #${id.substring(0,8).toUpperCase()}. Dana otomatis diteruskan ke saldo Anda.`,
        type: "success",
        link: "/pesanan-masuk"
      }
    });

    res.status(200).json({ message: 'Pesanan telah selesai', data: updatedOrder });
  } catch (error) {
    console.error("Error dari Backend saat Pesanan Diterima:", error); 
    res.status(500).json({ message: 'Terjadi kesalahan pada database.' });
  }
};

const cancelOrderBuyer = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } }
    });

    if (!order) return res.status(404).json({ message: "Pesanan tidak ditemukan" });

    if (order.status !== 'PENDING' && order.status !== 'PAID') {
      return res.status(400).json({ message: "Pesanan sudah diproses, tidak bisa dibatalkan." });
    }

    for (let item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } } 
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        cancelReason: cancelReason || 'Dibatalkan oleh pembeli'
      }
    });

    // NOTIFIKASI PESANAN BATAL (KE PETANI)
    const petaniId = order.items[0].product.petaniId;
    await prisma.notification.create({
      data: {
        userId: petaniId,
        title: "Pesanan Dibatalkan Pembeli",
        message: `Pesanan #${id.substring(0,8).toUpperCase()} telah dibatalkan. Alasan: ${cancelReason || 'Lainnya'}. Stok otomatis dikembalikan.`,
        type: "warning",
        link: "/pesanan-masuk"
      }
    });

    res.status(200).json({ message: "Pesanan berhasil dibatalkan", data: updatedOrder });
  } catch (error) {
    console.error("Error cancel order:", error);
    res.status(500).json({ message: "Terjadi kesalahan server saat membatalkan pesanan." });
  }
};

module.exports = { createOrder, getMyOrders, xenditWebhook, updateTrackingNumber, getIncomingOrders, updateOrderStatus, completeOrderForBuyer, cancelOrderBuyer };