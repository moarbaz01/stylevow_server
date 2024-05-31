const mongoose = require("mongoose");

// UserSchema
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: Number,
    // length: 4,
    required: true,
  },
  createdAt: {
    type: Date,
    index: { expireAfterSeconds: 5 * 60 },
    default: Date.now,
  },
});

module.exports = mongoose.model("OTP", otpSchema);
