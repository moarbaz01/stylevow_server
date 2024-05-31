const mongoose = require("mongoose");

// Cards Schema
const CardsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    cardNumber: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: String,
      required: true,
    },
    cvv: {
      type: String,
      required: true,
    },
    cardHolderName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Card", CardsSchema);
