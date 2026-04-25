const express = require('express');
const { createOrder, getMyOrders, xenditWebhook } = require('../controllers/orderController'); // Pastikan xenditWebhook di-import
const { verifyToken, isCoffeeShop } = require('../middlewares/authMiddleware');

const router = express.Router();

// Jalur pesanan untuk User
router.post('/', verifyToken, isCoffeeShop, createOrder); 
router.get('/', verifyToken, getMyOrders);

// Jalur Webhook khusus untuk diketuk oleh Server Xendit (Tanpa middleware auth)
router.post('/webhook', xenditWebhook);

module.exports = router;