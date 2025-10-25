const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ssms_secret';

// Generate unique ID
const generateId = (items) => {
  if (items.length === 0) return 1;
  return Math.max(...items.map(item => item.id)) + 1;
};

// Password hashing
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// JWT tokens
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// Date helpers
const getStartOfDay = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getEndOfDay = (date = new Date()) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

// Filter sales by date range
const filterSalesByDateRange = (sales, startDate, endDate) => {
  const start = startDate ? new Date(startDate) : getStartOfDay();
  const end = endDate ? new Date(endDate) : getEndOfDay();
  
  return sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    return saleDate >= start && saleDate <= end;
  });
};

module.exports = {
  generateId,
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  getStartOfDay,
  getEndOfDay,
  filterSalesByDateRange
};