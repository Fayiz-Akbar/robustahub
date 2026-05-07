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
      message: 'Data profil berhasil diambil! ',
      data: user
    });
  } catch (error) {
    console.error("Error saat mengambil profil:", error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, description, bankName, bankAccountNumber, bankAccountName } = req.body;

    // Pastikan user hanya bisa mengedit profilnya sendiri
    if (req.user.id !== id) {
      return res.status(403).json({ message: "Akses ditolak!" });
    }

    // Siapkan data yang akan diupdate
    let updateData = {
      name,
      phone,
      address,
      description,
      bankName,
      bankAccountNumber, // <-- Sesuai skema kamu
      bankAccountName
    };

    // Jika ada file foto toko yang diupload
    if (req.file) {
      updateData.shopImage = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await prisma.pengguna.update({
      where: { id: id },
      data: updateData
    });

    // Buang password dari response
    const { password: _, ...userData } = updatedUser;

    res.status(200).json({
      message: "Profil berhasil diperbarui!",
      data: userData
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Gagal memperbarui profil" });
  }
};


module.exports = { getProfile, updateUserProfile };