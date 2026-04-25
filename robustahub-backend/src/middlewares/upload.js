// file: middlewares/upload.js
const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Menyimpan file ke dalam folder 'uploads'
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        // Membuat nama file unik: Tanggal-Waktu-NamaAsli.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter khusus agar hanya menerima file gambar
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar (JPG, PNG, dll) yang diizinkan!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Batas maksimal ukuran file: 5MB
});

module.exports = upload;