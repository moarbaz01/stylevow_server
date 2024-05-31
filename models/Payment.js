const mongoose = require('mongoose');

// Define the Payment schema
const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  orderId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    required: true
  },
  razorpaySignature: {
    type: String,
    required: true
  },

  razorpayOrderId: {
    type: String,
    required: true,
  },

  razorpayPaymentId: {
    type: String,
  },

}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Create a Payment model
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
