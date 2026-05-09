const express = require('express');
// Tambahkan updateUserProfile di dalam kurung kurawal di bawah ini:
const { getProfile, updateUserProfile } = require('../controllers/userController'); 
const { verifyToken } = require('../middlewares/authMiddleware'); // Wajib login untuk lihat profil
const upload = require('../middlewares/upload');
const router = express.Router();

// Endpoint: GET /api/users/profile
router.get('/profile', verifyToken, getProfile);

// Endpoint: PUT /api/users/:id
router.put('/:id', verifyToken, upload.single('shopImage'), updateUserProfile);

module.exports = router;