const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ambil semua notifikasi milik user yang sedang login
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifs = await prisma.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' } // Urutkan dari yang paling baru
    });
    res.status(200).json({ data: notifs });
  } catch (error) {
    console.error("Error get notifications:", error);
    res.status(500).json({ message: 'Gagal mengambil notifikasi.' });
  }
};

// Tandai SATU notifikasi sebagai "Sudah Dibaca"
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.update({
      where: { id: id },
      data: { isRead: true }
    });
    res.status(200).json({ message: 'Notifikasi dibaca' });
  } catch (error) {
    console.error("Error mark as read:", error);
    res.status(500).json({ message: 'Gagal update notifikasi' });
  }
};

// Tandai SEMUA notifikasi sebagai "Sudah Dibaca"
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await prisma.notification.updateMany({
      where: { userId: userId, isRead: false },
      data: { isRead: true }
    });
    res.status(200).json({ message: 'Semua notifikasi dibaca' });
  } catch (error) {
    console.error("Error mark all as read:", error);
    res.status(500).json({ message: 'Gagal update semua notifikasi' });
  }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead };