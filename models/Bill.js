// models/bill.js
const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      totalMakeCost: {
        type: Number,
        required: true,
      },
      // Add more fields as needed
    },
  ],
  totalRevenue: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill;
