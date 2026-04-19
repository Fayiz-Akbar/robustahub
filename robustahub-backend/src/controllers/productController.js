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

module.exports = { createProduct, getAllProducts };