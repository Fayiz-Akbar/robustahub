const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    
    // Ambil ID Petani dari token yang sudah dicek oleh satpam (middleware)
    const petaniId = req.user.id;

    // Simpan ke database
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        petaniId
      }
    });

    res.status(201).json({
      message: 'Katalog kopi berhasil ditambahkan! ',
      data: newProduct
    });
  } catch (error) {
    console.error("Error saat tambah produk:", error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

const getAllProducts = async (req, res) => {
  try {
    // findMany akan mengambil semua baris di tabel Product
    const products = await prisma.product.findMany({
      include: {
        petani: {
          // Fitur Relasi: Kita ambil nama dan alamat petani dari tabel User!
          select: { 
            name: true, 
            address: true 
          } 
        }
      }
    });

    res.status(200).json({
      message: 'Berhasil mengambil data katalog kopi! ',
      data: products
    });
  } catch (error) {
    console.error("Error saat mengambil data produk:", error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params; // Mengambil ID produk dari URL
    const { name, description, price, stock } = req.body;
    const petaniId = req.user.id; // ID petani yang sedang login

    // 1. Cek apakah kopinya ada
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ message: 'Katalog kopi tidak ditemukan!' });
    }

    // 2. KEAMANAN: Pastikan ini kopi miliknya sendiri
    if (existingProduct.petaniId !== petaniId) {
      return res.status(403).json({ message: 'Akses Ditolak! Anda tidak berhak mengubah produk orang lain.' });
    }

    // 3. Simpan perubahan ke database
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { name, description, price, stock }
    });

    res.status(200).json({
      message: 'Katalog kopi berhasil diperbarui! 📝',
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

    res.status(200).json({ message: 'Katalog kopi berhasil dihapus dari etalase! 🗑️' });
  } catch (error) {
    console.error("Error saat menghapus produk:", error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = { createProduct, getAllProducts, updateProduct, deleteProduct };