const express = require('express');
const { createProduct, getAllProducts, updateProduct, deleteProduct, getProductById } = require('../controllers/productController');
const { verifyToken, isPetani } = require('../middlewares/authMiddleware'); 

// Import multer middleware yang sudah kita buat
const upload = require('../middlewares/upload'); 

const router = express.Router();

// Tambahkan upload.single('image') agar API bisa menerima file foto kopi
router.post('/', verifyToken, isPetani, upload.single('image'), createProduct); 
router.get('/', getAllProducts);

// Tambahkan juga ke rute update agar petani bisa ganti foto
router.put('/:id', verifyToken, isPetani, upload.single('image'), updateProduct);
router.delete('/:id', verifyToken, isPetani, deleteProduct);
router.get('/:id', getProductById);

module.exports = router;