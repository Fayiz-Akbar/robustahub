const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createOrder = async (req, res) => {
  try {
    const buyerId = req.user.id; // Diambil otomatis dari tiket/token
    const { items } = req.body;  // Data keranjang belanja dari Postman/Frontend

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Keranjang belanja kosong!' });
    }

    // Jurus Prisma Transaction: Kalau satu gagal, semua dibatalkan!
    const newOrder = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      let orderItemsData = [];

      // 1. Cek setiap kopi yang dibeli
      for (let item of items) {
        // Cari kopi di database
        const product = await tx.product.findUnique({ where: { id: item.productId } });

        if (!product) throw new Error(`Produk tidak ditemukan`);
        if (product.stock < item.quantity) throw new Error(`Stok ${product.name} tidak cukup!`);

        // Hitung total harga (Harga Asli x Jumlah Beli)
        totalAmount += product.price * item.quantity;

        // Siapkan data untuk tabel OrderItem (Nota Detail)
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          priceAtBuy: product.price // Kita kunci harganya saat dibeli
        });

        // Kurangi stok kopi di etalase Petani
        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity }
        });
      }

      // 2. Buat Nota Utama di tabel Order
      const order = await tx.order.create({
        data: {
          buyerId,
          totalAmount,
          status: 'PENDING', // Status awal selalu PENDING (Belum dibayar)
          items: {
            create: orderItemsData // Otomatis mengisi tabel OrderItem!
          }
        },
        include: {
          items: true // Tampilkan daftar barang di response
        }
      });

      return order;
    });

    res.status(201).json({
      message: 'Pesanan berhasil dibuat! ',
      data: newOrder
    });

  } catch (error) {
    console.error("Error saat membuat pesanan:", error);
    // Tangkap error jika stok habis
    if (error.message.includes('tidak ditemukan') || error.message.includes('tidak cukup')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    // Ambil ID pengguna yang sedang login dari tiket (token)
    const buyerId = req.user.id;

    // Cari semua pesanan milik pengguna tersebut
    const orders = await prisma.order.findMany({
      where: { buyerId: buyerId },
      include: {
        items: {
          include: {
            product: {
              select: { name: true } // Ambil nama kopinya biar notanya rapi
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' } // Urutkan dari pesanan paling baru
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

// Fungsi untuk menerima notifikasi pembayaran sukses dari Xendit
const xenditWebhook = async (req, res) => {
  try {
    // Xendit akan mengirimkan data tagihan ke req.body
    const { external_id, status } = req.body;

    // external_id adalah ID Order yang kita kirim saat membuat invoice
    const orderId = external_id;

    // Cek jika status dari Xendit adalah PAID (Sudah dibayar) atau SETTLED
    if (status === 'PAID' || status === 'SETTLED') {
      
      // 1. Ubah status Order di database menjadi PAID
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' }
      });

      // 2. Ubah status Payment di database menjadi PAID
      await prisma.payment.updateMany({
        where: { orderId: orderId },
        data: { status: 'PAID' }
      });

      console.log(` HORE! Pesanan ${orderId} berhasil DIBAYAR!`);
    }

    // WAJIB: Selalu kembalikan status 200 OK ke Xendit
    // Jika tidak, Xendit akan mengira server kita mati dan terus-menerus mengirim ulang webhook
    return res.status(200).json({ message: 'Webhook berhasil diterima' });

  } catch (error) {
    console.error("Error pada Webhook Xendit:", error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server webhook.' });
  }
};

// Jangan lupa export fungsinya agar bisa dipanggil di routes!
module.exports = { createOrder, getMyOrders, xenditWebhook };
