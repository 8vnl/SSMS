const express = require('express');
const {
  getPublicTodaySales,
  getPublicSalesByDateRange,
  getPublicDailyAggregates
} = require('../controllers/publicController');
const router = express.Router();

router.get('/today', getPublicTodaySales);
router.get('/history', getPublicSalesByDateRange);
router.get('/aggregates', getPublicDailyAggregates);

module.exports = router;
