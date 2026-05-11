const express = require('express');
const router = express.Router();

// Jangan lupa panggil 2 fungsi baru yang barusan dibuat dari controller
const { 
  createOrder, 
  getMyOrders, 
  xenditWebhook, 
  updateTrackingNumber,
  getIncomingOrders, 
  updateOrderStatus,  
  completeOrderForBuyer,
  cancelOrderBuyer
} = require('../controllers/orderController'); 

const { verifyToken, isCoffeeShop, isPetani } = require('../middlewares/authMiddleware');

// Jalur pesanan untuk User (Coffee Shop)
router.post('/', verifyToken, isCoffeeShop, createOrder); 
router.get('/', verifyToken, getMyOrders);

// Jalur Webhook khusus untuk diketuk oleh Server Xendit (Tanpa middleware auth)
router.post('/webhook', xenditWebhook);

// Rute untuk Petani: Memproses pesanan dan input resi
router.put('/:id/ship', verifyToken, isPetani, updateTrackingNumber);

// ============================================================
// RUTE BARU KHUSUS UNTUK FRONTEND PESANAN PETANI
// ============================================================
// Rute untuk mengambil pesanan masuk milik Petani
router.get('/incoming', verifyToken, isPetani, getIncomingOrders);

// Rute untuk update status pesanan secara instan (PAID -> SHIPPED)
router.patch('/:id/status', verifyToken, isPetani, updateOrderStatus);
// Rute untuk menyelesaikan pesanan (SHIPPED -> COMPLETED) oleh Pembeli
router.put('/:id/complete', verifyToken, completeOrderForBuyer);

// GANTI kata .patch menjadi .put
router.put('/:id/cancel', verifyToken, cancelOrderBuyer);

module.exports = router;