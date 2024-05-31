const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");

// Create Cart
exports.create = async (req, res) => {
  try {
    // FETCH DATA
    const userId = req.user.userId;
    const { productId, quantity, totalAmount, size, color } = req.body;

    // Validation
    if (!userId || !productId || !quantity || !totalAmount || !size || !color) {
      return res.status(500).json({
        success: false,
        message: "ALL FIELDS ARE REQUIRED",
      });
    }

    // CHECK PRODUCT
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "PRODUCT NOT FOUND",
      });
    }

    const cart = await Cart.create({
      user: userId,
      product: productId,
      quantity,
      totalAmount,
      size,
      color,
    });

    await User.findByIdAndUpdate(userId, {
      $push: {
        cart: cart._id,
      },
    });

    res.status(200).json({
      success: true,
      message: "CART SUCCESSFULLY CREATED",
      cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "ERROR OCCUR IN CART CREATION",
      error: error,
    });
  }
};

// Create Cart
exports.update = async (req, res) => {
  try {
    // FETCH DATA
    const { cartId, quantity, totalAmount } = req.body;
    console.log(req.body);

    // Validation
    if (!cartId || !quantity || !totalAmount) {
      return res.status(500).json({
        success: false,
        message: "ALL FIELDS ARE REQUIRED",
      });
    }

    // CHECK PRODUCT
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "CART NOT FOUND",
      });
    }

    const updateCart = await Cart.findByIdAndUpdate(
      cartId,
      {
        quantity,
        totalAmount,
      },
      { new: true }
    ).populate({
      path: "user",
      populate: {
        path: "cart",
      },
    });

    res.status(200).json({
      success: true,
      message: "CART SUCCESSFULLY UPDATE",
      cart: updateCart,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "ERROR OCCUR IN CART UPDATION",
      error: error.message,
    });
  }
};

// Delete Cart
exports.deleteCart = async (req, res) => {
  try {
    // FETCH DATA
    const userId = req.user.userId;
    const { cartId } = req.body;

    // Validation
    if (!cartId) {
      return res.status(500).json({
        success: false,
        message: "CART ID NOT FOUND",
      });
    }

    // CHECK PRODUCT
    const cart = await Cart.findById(cartId).populate("user");
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "CART NOT FOUND",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          cart: cart._id,
        },
      },
      { new: true }
    ).populate("cart");

    await Cart.findByIdAndDelete(cartId);

    // SEND RESPOSNSE
    res.status(200).json({
      success: true,
      message: "CART SUCCESSFULLY DELETED",
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ERROR OCCUR IN CART DELETION",
      error: error.message,
    });
  }
};
