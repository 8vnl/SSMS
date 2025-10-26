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

// Update CORS to allow all origins
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Add error handling for malformed JSON
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('JSON Parse Error:', error.message);
    return res.status(400).json({ 
      message: 'Invalid JSON in request body',
      details: error.message 
    });
  }
  next();
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/users', require('./routes/users'));
app.use('/api/menu', require('./routes/menu'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'SSMS API is running', 
    timestamp: new Date().toISOString()
  });
});

// Catch all handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`External: http://35.240.205.230:${PORT}`);
});