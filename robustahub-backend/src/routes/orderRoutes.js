const express = require('express');
const { createOrder, getMyOrders } = require('../controllers/orderController');
// 1. Panggil satpam isCoffeeShop
const { verifyToken, isCoffeeShop } = require('../middlewares/authMiddleware');

const router = express.Router();

// 2. Pasang isCoffeeShop di sini (Harus login DULU, baru dicek apakah dia Coffee Shop)
router.post('/', verifyToken, isCoffeeShop, createOrder); 
router.get('/', verifyToken, getMyOrders);

module.exports = router;