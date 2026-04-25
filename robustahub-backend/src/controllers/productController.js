const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createProduct = async (req, res) => {
  try {
    const { 
        name, description, price, stock, 
        minOrder, category, tastingNotes, 
        processingMethod, elevation, defectRate 
    } = req.body;
    
    // Ambil ID Petani dari token yang sudah dicek oleh satpam (middleware)
    const petaniId = req.user.id;

    // Ambil path gambar dari Multer (jika ada file yang diupload)
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Simpan ke database
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseInt(price),
        stock: parseInt(stock),
        minOrder: minOrder ? parseInt(minOrder) : 5,
        category,
        tastingNotes,
        processingMethod,
        elevation,
        defectRate,
        imageUrl,
        petaniId
      }
    });

    res.status(201).json({
      message: 'Katalog kopi berhasil ditambahkan!',
      data: newProduct
    });
  } catch (error) {
    console.error("Error saat tambah produk:", error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        petani: {
          select: { 
            name: true, 
            address: true,
            shopName: true 
          } 
        }
      }
    });

    res.status(200).json({
      message: 'Berhasil mengambil data katalog kopi!',
      data: products
    });
  } catch (error) {
    console.error("Error saat mengambil data produk:", error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
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

    // 1. Cek apakah kopinya ada
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ message: 'Katalog kopi tidak ditemukan!' });
    }

    // 2. KEAMANAN: Pastikan ini kopi miliknya sendiri
    if (existingProduct.petaniId !== petaniId) {
      return res.status(403).json({ message: 'Akses Ditolak! Anda tidak berhak mengubah produk orang lain.' });
    }

    // 3. Cek Gambar: Gunakan gambar baru jika diupload, jika tidak gunakan yang lama
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : existingProduct.imageUrl;

    // 4. Siapkan data update (mengubah string dari form-data menjadi tipe data yang benar)
    const updateData = {
        name, description, category, tastingNotes, processingMethod, elevation, defectRate, imageUrl
    };
    if (price) updateData.price = parseInt(price);
    if (stock) updateData.stock = parseInt(stock);
    if (minOrder) updateData.minOrder = parseInt(minOrder);
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

    // 5. Simpan perubahan ke database
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

module.exports = { createProduct, getAllProducts, updateProduct, deleteProduct };