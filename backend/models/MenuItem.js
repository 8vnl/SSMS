const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  options: [{
    name: String,
    price: Number
  }],
  requiresManualPrice: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);