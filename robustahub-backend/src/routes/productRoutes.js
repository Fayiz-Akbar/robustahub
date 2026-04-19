const express = require('express');
const { createProduct, getAllProducts } = require('../controllers/productController');
// 1. Panggil satpam isPetani
const { verifyToken, isPetani } = require('../middlewares/authMiddleware'); 

const router = express.Router();

// 2. Pasang isPetani di sini (Harus login DULU, baru dicek apakah dia Petani)
router.post('/', verifyToken, isPetani, createProduct); 
router.get('/', getAllProducts);

module.exports = router;