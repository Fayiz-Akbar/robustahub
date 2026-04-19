const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // 1. Ambil tiket (token) dari Header/permintaan yang dikirim Frontend
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Akses ditolak! Anda belum login (Token tidak ada).' });
  }

  // 2. Potong tulisan 'Bearer ' untuk mendapatkan token aslinya
  const token = authHeader.split(' ')[1];

  try {
    // 3. Cek apakah tokennya asli buatan server kita
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Jika asli, simpan data user (id & role) ke dalam request untuk dipakai nanti
    req.user = decoded;
    
    // 5. Persilakan masuk ke proses selanjutnya!
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token tidak valid atau sudah kadaluarsa!' });
  }
};
const isPetani = (req, res, next) => {
  // Cek apakah role di token adalah PETANI
  if (req.user.role !== 'PETANI') {
    return res.status(403).json({ message: 'Akses Ditolak! Hanya Petani yang bisa menambah katalog.' });
  }
  next(); // Kalau benar Petani, silakan lewat!
};

const isCoffeeShop = (req, res, next) => {
  // Cek apakah role di token adalah COFFEE_SHOP
  if (req.user.role !== 'COFFEE_SHOP') {
    return res.status(403).json({ message: 'Akses Ditolak! Hanya Coffee Shop yang bisa melakukan pesanan.' });
  }
  next(); // Kalau benar Coffee Shop, silakan lewat!
};

// Jangan lupa export fungsi barunya!
module.exports = { verifyToken, isPetani, isCoffeeShop };