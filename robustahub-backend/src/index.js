const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Mengimpor jalur (routes) yang baru dibuat
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Memasang jalur utama untuk API Autentikasi
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