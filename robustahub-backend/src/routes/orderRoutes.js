const express = require('express');
const router = express.Router();

const { createOrder, getMyOrders, xenditWebhook, updateTrackingNumber } = require('../controllers/orderController'); 
const { verifyToken, isCoffeeShop, isPetani } = require('../middlewares/authMiddleware');

// Jalur pesanan untuk User (Coffee Shop)
router.post('/', verifyToken, isCoffeeShop, createOrder); 
router.get('/', verifyToken, getMyOrders);

// Jalur Webhook khusus untuk diketuk oleh Server Xendit (Tanpa middleware auth)
router.post('/webhook', xenditWebhook);

// Rute untuk Petani: Memproses pesanan dan input resi
// Ubah authMiddleware menjadi verifyToken
router.put('/:id/ship', verifyToken, isPetani, updateTrackingNumber);

module.exports = router;