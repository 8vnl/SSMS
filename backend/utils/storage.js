const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, '../data');

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// Initialize default data files
const initializeDataFiles = async () => {
  await ensureDataDir();
  
  const files = {
    'users.json': [
      {
        id: 1,
        username: 'admin',
        email: 'admin@ssms.com',
        password: '$2a$10$8K1p/a0dRTlR0dC6GujWue3Q7Oq7Q7b5nQ5Q5Q5Q5Q5Q5Q5Q5Q5Q', // admin123
        role: 'admin',
        isApproved: true,
        createdAt: new Date().toISOString()
      }
    ],
    'sales.json': [],
    'menuItems.json': [
      { id: 1, name: 'Ayam Penyet', basePrice: 20000, options: [{ name: 'Pakai Nasi', price: 5000 }], requiresManualPrice: false },
      { id: 2, name: '3T', basePrice: 15000, options: [{ name: 'Pakai Nasi', price: 5000 }], requiresManualPrice: false },
      { id: 3, name: 'Nasi goreng', basePrice: 15000, options: [{ name: 'Tambah Telur', price: 5000 }], requiresManualPrice: false },
      { id: 4, name: 'Bakmi jawa goreng', basePrice: 15000, options: [{ name: 'Spesial', price: 5000 }], requiresManualPrice: false },
      { id: 5, name: 'Bakmi jawa nyemek', basePrice: 15000, options: [{ name: 'Spesial', price: 5000 }], requiresManualPrice: false },
      { id: 6, name: 'Bakmi jawa kuah', basePrice: 15000, options: [{ name: 'Spesial', price: 5000 }], requiresManualPrice: false },
      { id: 7, name: 'Soto Gading', basePrice: 15000, options: [{ name: 'Pakai Nasi', price: 5000 }], requiresManualPrice: false },
      { id: 8, name: 'Sup Ayam', basePrice: 15000, options: [{ name: 'Pakai Nasi', price: 5000 }], requiresManualPrice: false },
      { id: 9, name: 'Nasi campur', basePrice: 0, options: [], requiresManualPrice: true },
      { id: 10, name: 'Nasi', basePrice: 5000, options: [], requiresManualPrice: false }
    ],
    'sessions.json': {}
  };

  for (const [filename, defaultData] of Object.entries(files)) {
    const filePath = path.join(dataDir, filename);
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
  }
};

// Generic read/write functions
const readData = async (filename) => {
  await ensureDataDir();
  const filePath = path.join(dataDir, filename);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    throw error;
  }
};

const writeData = async (filename, data) => {
  await ensureDataDir();
  const filePath = path.join(dataDir, filename);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw error;
  }
};

// Specific data operations
const storage = {
  // Users
  getUsers: () => readData('users.json'),
  saveUsers: (users) => writeData('users.json', users),
  
  // Sales
  getSales: () => readData('sales.json'),
  saveSales: (sales) => writeData('sales.json', sales),
  
  // Menu Items
  getMenuItems: () => readData('menuItems.json'),
  saveMenuItems: (menuItems) => writeData('menuItems.json', menuItems),
  
  // Sessions (for simple token management)
  getSessions: () => readData('sessions.json'),
  saveSessions: (sessions) => writeData('sessions.json', sessions),
  
  // Initialize all data files
  initialize: initializeDataFiles
};

module.exports = storage;