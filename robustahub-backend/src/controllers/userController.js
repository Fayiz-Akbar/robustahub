const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getProfile = async (req, res) => {
  try {
    // Ambil ID dari token satpam
    const userId = req.user.id;

    // Cari user di database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true
        // KITA SENGAJA TIDAK MEMASUKKAN 'password' DI SINI
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan!' });
    }

    res.status(200).json({
      message: 'Data profil berhasil diambil! 👤',
      data: user
    });
  } catch (error) {
    console.error("Error saat mengambil profil:", error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = { getProfile };