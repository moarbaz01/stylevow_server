const Razorpay = require("razorpay");
const instance = require("../config/payment");

// Payment Initialize
exports.paymentInitialize = async (req, res) => {
  try{
    const options = {
        amount: req.body.amount,
        currency: "INR",
      };
    
      instance.orders.create(options, (error, order) => {
        if (error) {
          return res.status(500).json({
            message: "Something went wrong!",
          });
        }
        res.status(200).json({
          data: order,
          message: "Order created successfully!",
        });
      });
  }catch(err){
    console.log(err);
    res.status(500).json({  
        message: "Something went wrong!",

    })
  }
};

// Payment Verify
exports.paymentVerify = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      res.status(200).json({
        message: "Payment verified successfully",
      });
    } else {
      res.status(400).json({
        message: "Invalid signature sent!",
      });
    }
    res.status(200).json({
      message: "Payment verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

