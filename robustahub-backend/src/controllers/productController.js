const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createProduct = async (req, res) => {
  try {
    const { 
      name, description, price, stock, minOrder, 
      tastingNotes, processingMethod, elevation, category // <-- Tangkap category di sini
    } = req.body;

    // Menangani banyak foto (jika menggunakan upload.array('images'))
    let savedImageUrl = null;
    if (req.files && req.files.length > 0) {
      // Kumpulkan semua path foto
      const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
      // Simpan sebagai string JSON agar bisa masuk ke kolom String di Prisma
      savedImageUrl = JSON.stringify(imagePaths); 
    } else if (req.file) {
      // Fallback jika ternyata masih pakai upload.single('image')
      savedImageUrl = `/uploads/${req.file.filename}`;
    }

    // Simpan ke database
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseInt(price),
        stock: parseInt(stock),
        minOrder: minOrder ? parseInt(minOrder) : 5,
        tastingNotes,
        processingMethod,
        elevation,
        imageUrl: savedImageUrl,
        category: category || "ROBUSTA", // <-- Masukkan category ke Prisma
        petaniId: req.user.id // Pastikan ini sesuai dengan cara tokenmu menyimpan ID
      }
    });

    res.status(201).json({ message: "Produk berhasil ditambahkan", data: newProduct });
  } catch (error) {
    console.error("Error create product:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        petani: { select: { name: true } },
        // Hitung dari pesanan yang minimal sudah DIBAYAR atau SELESAI
        orderItems: {
          where: { 
            order: { status: { in: ['PAID', 'SHIPPED', 'COMPLETED'] } } 
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Kalkulasi total terjual untuk setiap produk
    const productsWithSold = products.map(product => {
      const sold = product.orderItems.reduce((total, item) => total + item.quantity, 0);
      return { ...product, sold };
    });

    res.status(200).json({ data: productsWithSold });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data produk' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
        name, description, price, stock, 
        minOrder, category, tastingNotes, 
        processingMethod, elevation, defectRate, isActive 
    } = req.body;
    const petaniId = req.user.id;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ message: 'Katalog kopi tidak ditemukan!' });
    }

    if (existingProduct.petaniId !== petaniId) {
      return res.status(403).json({ message: 'Akses Ditolak! Anda tidak berhak mengubah produk orang lain.' });
    }

    // 👇 UBAH LOGIKA GAMBAR DI SINI: Deteksi banyak foto (array)
    let savedImageUrl = existingProduct.imageUrl; // Default pakai gambar lama
    
    if (req.files && req.files.length > 0) {
      // Jika user mengunggah foto-foto baru, timpa yang lama
      const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
      savedImageUrl = JSON.stringify(imagePaths); 
    } else if (req.file) {
      // Fallback jika sistem terbaca sebagai single file
      savedImageUrl = `/uploads/${req.file.filename}`;
    }

    const updateData = {
        name, 
        description, 
        category, 
        tastingNotes, 
        processingMethod, 
        elevation, 
        defectRate, 
        imageUrl: savedImageUrl // <-- Masukkan hasil olahan gambar ke database
    };
    
    if (price) updateData.price = parseInt(price);
    if (stock) updateData.stock = parseInt(stock);
    if (minOrder) updateData.minOrder = parseInt(minOrder);
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({
      message: 'Katalog kopi berhasil diperbarui!',
      data: updatedProduct
    });
  } catch (error) {
    console.error("Error saat update produk:", error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const petaniId = req.user.id;

    // 1. Cek keberadaan kopi
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ message: 'Katalog kopi tidak ditemukan!' });
    }

    // 2. KEAMANAN: Pastikan ini kopi miliknya sendiri
    if (existingProduct.petaniId !== petaniId) {
      return res.status(403).json({ message: 'Akses Ditolak! Anda tidak berhak menghapus produk orang lain.' });
    }

    // 3. Hapus dari database
    await prisma.product.delete({ where: { id } });

    res.status(200).json({ message: 'Katalog kopi berhasil dihapus dari etalase!' });
  } catch (error) {
    console.error("Error saat menghapus produk:", error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: id }
    });

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan!" });
    }

    res.status(200).json({
      message: "Berhasil mengambil detail produk!",
      data: product
    });
  } catch (error) {
    console.error("Error saat mengambil detail produk:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

module.exports = { createProduct, getAllProducts, updateProduct, deleteProduct, getProductById };