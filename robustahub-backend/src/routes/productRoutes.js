const express = require('express');
// 1. Panggil fungsi barunya
const { createProduct, getAllProducts, updateProduct, deleteProduct } = require('../controllers/productController');
const { verifyToken, isPetani } = require('../middlewares/authMiddleware'); 

const router = express.Router();

router.post('/', verifyToken, isPetani, createProduct); 
router.get('/', getAllProducts);

// 2. Tambahkan jalur Update & Delete (Hanya Petani yang boleh akses)
// Tanda /:id berarti URL-nya butuh ID produk, contoh: /api/products/123-abc
router.put('/:id', verifyToken, isPetani, updateProduct);
router.delete('/:id', verifyToken, isPetani, deleteProduct);

module.exports = router;