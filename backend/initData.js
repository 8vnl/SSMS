const mongoose = require('mongoose');
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const connectDB = require('./config/database');
require('dotenv').config();

const initializeData = async () => {
  try {
    await connectDB();

    // Create admin user if not exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const adminUser = new User({
        username: 'admin',
        email: 'admin@ssms.com',
        password: 'admin123',
        role: 'admin',
        isApproved: true
      });
      await adminUser.save();
      console.log('Admin user created: admin@ssms.com / admin123');
    }

    // Create menu items
    const menuItems = [
      { name: 'Ayam Penyet', basePrice: 20000, options: [{ name: 'Pakai Nasi', price: 5000 }] },
      { name: '3T', basePrice: 15000, options: [{ name: 'Pakai Nasi', price: 5000 }] },
      { name: 'Nasi goreng', basePrice: 15000, options: [{ name: 'Tambah Telur', price: 5000 }] },
      { name: 'Bakmi jawa goreng', basePrice: 15000, options: [{ name: 'Spesial', price: 5000 }] },
      { name: 'Bakmi jawa nyemek', basePrice: 15000, options: [{ name: 'Spesial', price: 5000 }] },
      { name: 'Bakmi jawa kuah', basePrice: 15000, options: [{ name: 'Spesial', price: 5000 }] },
      { name: 'Soto Gading', basePrice: 15000, options: [{ name: 'Pakai Nasi', price: 5000 }] },
      { name: 'Sup Ayam', basePrice: 15000, options: [{ name: 'Pakai Nasi', price: 5000 }] },
      { name: 'Nasi campur', basePrice: 0, requiresManualPrice: true },
      { name: 'Nasi', basePrice: 5000 }
    ];

    for (let itemData of menuItems) {
      const itemExists = await MenuItem.findOne({ name: itemData.name });
      if (!itemExists) {
        const menuItem = new MenuItem(itemData);
        await menuItem.save();
      }
    }

    console.log('Menu items initialized');
    console.log('Data initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
};

initializeData();