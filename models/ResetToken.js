const mongoose = require("mongoose");

const resetTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

module.exports = mongoose.model("ResetToken", resetTokenSchema);
