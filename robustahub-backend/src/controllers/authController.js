const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

const register = async (req, res) => {
  try {
    // 1. Menangkap data yang dikirim oleh Frontend / Postman
    const { name, email, password, role, phone, address } = req.body;

    // 2. Mengecek apakah email tersebut sudah pernah didaftarkan
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Maaf, Email tersebut sudah digunakan!' });
    }

    // 3. Mengacak (Hashing) Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Menyimpan data Pengguna baru ke tabel User di PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'COFFEE_SHOP', // Jika tidak diisi, otomatis jadi Coffee Shop
        phone,
        address
      }
    });

    // 5. Mengirim jawaban sukses kembali ke Frontend
    res.status(201).json({
      message: 'Registrasi akun berhasil! ',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error("Error saat registrasi:", error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Cari pengguna berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: 'Email tidak ditemukan!' });
    }

    // 2. Cocokkan password yang diketik dengan password acak di database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Password salah!' });
    }

    // 3. Buat Tiket (Token JWT) jika email & password benar
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' } // Tiket berlaku selama 1 hari
    );

    // 4. Kirim balasan sukses beserta tiketnya
    res.status(200).json({
      message: 'Login berhasil! ',
      token: token,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Error saat login:", error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
module.exports = { register, login };