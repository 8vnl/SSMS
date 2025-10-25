const express = require('express');
const { 
  createSale, 
  getTodaySales, 
  getSalesByDateRange, 
  getDailyAggregates 
} = require('../controllers/salesController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, createSale);
router.get('/today', auth, getTodaySales);
router.get('/history', auth, getSalesByDateRange);
router.get('/aggregates', auth, getDailyAggregates);

module.exports = router;