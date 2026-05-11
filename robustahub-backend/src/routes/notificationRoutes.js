const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Route untuk mengambil daftar notifikasi
router.get('/', verifyToken, getMyNotifications);

// Route untuk menandai semua notifikasi dibaca
router.put('/read-all', verifyToken, markAllAsRead);

// Route untuk menandai 1 notifikasi dibaca
router.put('/:id/read', verifyToken, markAsRead);

module.exports = router;