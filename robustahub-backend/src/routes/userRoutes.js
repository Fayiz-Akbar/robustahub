const express = require('express');
const { getProfile } = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware'); // Wajib login untuk lihat profil

const router = express.Router();

// Endpoint: GET /api/users/profile
router.get('/profile', verifyToken, getProfile);

module.exports = router;