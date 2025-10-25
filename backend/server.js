const express = require('express');
const cors = require('cors');
const path = require('path');
const storage = require('./utils/storage');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize data storage
storage.initialize().then(() => {
  console.log('Data storage initialized');
}).catch(err => {
  console.error('Failed to initialize data storage:', err);
});

app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/users', require('./routes/users'));
app.use('/api/menu', require('./routes/menu'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'SSMS API is running', timestamp: new Date().toISOString() });
});

// Catch all handler - send back React's index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});