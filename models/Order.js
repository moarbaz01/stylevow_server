const mongoose = require("mongoose");

// UserSchema
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    products: {
        type:Array,
        required:true,

    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "in-transit",
        "shipped",
        "cancelled",
        "delivered",
        "out-of-stock",
      ],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "PREPAID"],
      required: true,
    },
    shippingAddress: {
      type : Object,
    },
    shippingDate:{
        type:Date,
        required:true,
    },
    promocode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Promocode",
    },
    totalItems: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
