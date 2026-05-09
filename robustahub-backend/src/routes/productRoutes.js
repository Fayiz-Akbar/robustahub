const express = require('express');
const { createProduct, getAllProducts, updateProduct, deleteProduct, getProductById } = require('../controllers/productController');
const { verifyToken, isPetani } = require('../middlewares/authMiddleware'); 
const upload = require('../middlewares/upload'); 

const router = express.Router();

router.post('/', verifyToken, isPetani, upload.array('images', 5), createProduct); 
router.get('/', getAllProducts);

// 👇 UBAH BAGIAN INI: Ganti upload.single('image') menjadi upload.array('images', 5)
router.put('/:id', verifyToken, isPetani, upload.array('images', 5), updateProduct);

router.delete('/:id', verifyToken, isPetani, deleteProduct);
router.get('/:id', getProductById);

module.exports = router;