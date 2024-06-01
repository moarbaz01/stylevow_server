const Order = require("../models/Order");
const User = require("../models/User");
const Promocode = require("../models/Promocode");
const sendMail = require("../utils/sendMail");

exports.create = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      products,
      totalAmount,
      paymentMethod,
      shippingAddress,
      promocode,
      shippingDate,
    } = req.body;

    //   Validation
    if (
      !products ||
      !totalAmount ||
      !paymentMethod ||
      !shippingAddress ||
      !shippingDate
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let totalItems = 0;
    products.forEach((cart) => {
      totalItems += cart.quantity;
    });

    const promocodeValue = await Promocode.findOne({ _id: promocode });
    if (promocodeValue && promocodeValue.status === "active") {
      if (promocodeValue.type === "percentage") {
        totalAmount = totalAmount - (totalAmount * promocodeValue.value) / 100;
      } else if (promocodeValue.type === "amount") {
        totalAmount = totalAmount - promocodeValue.value;
      }
    }

    const order = new Order({
      user: userId,
      totalAmount,
      totalItems,
      shippingAddress,
      shippingDate,
      paymentMethod,
      promocode,
      products,
    });
    await order.save();
    // Push orders to user's orders array
    user.order.push(order._id);
    // Update user's cart
    user.cart = [];
    await user.save();

    // Send email to the user with the order details
    await sendMail(
      user.email,
      "Order Placed",
      `
            <p>Dear ${user.fname + " " + user.lname},</p>
            <p>Your order has been placed successfully.</p>
            <p>Order Details:</p>
            <ul>
                ${products
                  .map(
                    (cart) =>
                      `<li>${cart.product.name} - ${cart.quantity} x ${
                        cart.product.price
                      }₹ = ${cart.quantity * cart.product.price}₹</li>`
                  )
                  .join("")}
            </ul>
            <p>Total Amount: ${totalAmount}₹</p>
            <p>Payment Method: ${paymentMethod}</p>
            <p>Shipping Address: ${shippingAddress}</p>
            <p>Promocode: ${promocode || "No Promocode"}</p>
            <p>Order ID: ${order._id}</p>
            <p>Thank you for shopping with us!</p>
        `
    );

    res
      .status(201)
      .json({ success: true, message: "Order created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Order
exports.update = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await Order.findByIdAndUpdate(orderId, { status });
    res
      .status(200)
      .json({ success: true, message: "Order updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Cancel Order
exports.cancel = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await Order.findByIdAndUpdate(orderId, { status });
    res
      .status(200)
      .json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    if (!orders) return res.status(404).json({ message: "No orders found" });
    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
