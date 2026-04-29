const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Mengimpor jalur (routes) yang baru dibuat
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// KONFIGURASI CORS YANG BARU
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Memasang jalur utama untuk API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Server Backend RobustaHub Berjalan Lancar! ' 
  });
});

app.listen(PORT, () => {
  console.log(` Server berjalan di http://localhost:${PORT}`);
});