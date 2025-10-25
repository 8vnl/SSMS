const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  selectedOption: String,
  optionPrice: {
    type: Number,
    default: 0
  }
});

const salesSchema = new mongoose.Schema({
  buyerIdentifier: {
    type: String,
    required: true,
    trim: true
  },
  orderItems: [orderItemSchema],
  customAdditionalCharges: {
    type: Number,
    default: 0
  },
  additionalChargeNotes: {
    type: String,
    trim: true
  },
  generalNotes: {
    type: String,
    trim: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

salesSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Sales', salesSchema);