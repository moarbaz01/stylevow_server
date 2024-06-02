const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const sendMail = require("../utils/sendMail");
const {
  UserBindingListInstance,
} = require("twilio/lib/rest/chat/v2/service/user/userBinding");

// All user related handlers

// Send OTP handler
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    // console.log(req.body);
    if (!email) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }
    // Check is user exist or not
    const user = await User.findOne({ email });
    if (user) {
      return res.status(500).json({
        success: false,
        message: "User already registered",
      });
    }

    let result;
    let checkOTP;
    do {
      result = otpGenerator.generate(4, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      checkOTP = await OTP.findOne({ otp: result });
    } while (checkOTP);

    // Now send this 4 DIGIT OTP to the user email
    const saveOTP = await OTP.create({
      email,
      otp: result,
    });

    // Send otp email
    const subject = "OTP for Registration";
    const html = `<h3>Your OTP for registration is ${result}
    </h3>
    <p>Please do not share this OTP with anyone.</p>`;
    await sendMail(email, subject, html);

    res.status(200).json({
      success: true,
      message: "OTP Successfully sent to the user",
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in sending otp to the user email",
      error: error.message,
    });
  }
};

// SIGN UP
exports.signup = async (req, res) => {
  try {
    const { fname, lname, email, phone, confirmPassword, password, otp } =
      req.body;
    // console.log(req.body);
    if (!fname || !lname || !email || !phone || !confirmPassword || !password) {
      return res.status(500).json({
        success: false,
        message: "All fields are mendantory",
      });
    }

    // Check passwords
    if (confirmPassword !== password) {
      return res.status(500).json({
        success: false,
        message: "Passwords not matched",
      });
    }

    // Check is user exist or not
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(500).json({
        success: false,
        message: "User already registered",
      });
    }

    const checkPhoneNumber = await User.findOne({ phone });
    if (checkPhoneNumber) {
      return res.status(500).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    const recentOTP = await OTP.findOne().sort({ createdAt: -1 }).limit(1);
    console.log("Working hai", recentOTP);
    if (!recentOTP) {
      return res.status(500).json({
        success: false,
        message: "SEND OTP FIRST",
      });
    }
    // console.log(recentOTP.otp)
    // console.log("MY OTP",otp)
    if (otp !== recentOTP.otp) {
      return res.status(500).json({
        success: false,
        message: "OTP EXPIRED",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    // Now send this 4 DIGIT OTP to the user email
    const user = await User.create({
      fname,
      lname,
      password: hashedPassword,
      email,
      phone,
      profileImage: `https://ui-avatars.com/api/?name=${fname}+${lname}`,
    });

    if (!user) {
      return res.status(500).json({
        success: false,
        message: "ERROR IN SAVING USER DATA",
      });
    }

    //  SEND EMAIL
    const emailInfo = await sendMail(
      email,
      `SUCCESSFULLY REGISTERED`,
      `<h3>WELCOME TO STYLEVOW</h3>
      <p>You have successfully registered to our website.</p>
      <p>Thank you for shopping with us!</p>
      `
    );
    console.log(emailInfo);

    // Return
    res.status(200).json({
      success: true,
      message: "USER SUCCESSFULLY REGISTERED",
      user,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "ERROR IN SIGN UP USER",
      error: error.message,
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    // Fetched
    const { email, password } = req.body;
    console.log(email);
    if (!email || !password) {
      return res.status(500).json({
        success: false,
        message: "All fields are mendantory",
      });
    }

    // Check is user exist or not
    const user = await User.findOne({ email })
      .populate({
        path: "order",
        populate: {
          path: "shippingAddress",
        },
        populate: {
          path: "products",
        },
      })
      .populate({
        path: "cart",
        populate: {
          path: "product", // Populate the 'product' field within the 'cart' documents
        },
      })
      .populate({
        path: "reviews",
        populate: {
          path: "user",
        },
      })
      .populate("wishlist")
      .populate("cards")
      .populate("address");
    if (!user) {
      return res.status(500).json({
        success: false,
        message: "USER NOT FOUND || PLEASE SIGNUP FIRST",
      });
    }

    // Compare password
    const comparePassword = await bcrypt.compare(password, user.password);

    // Check passwords
    if (!comparePassword) {
      return res.status(500).json({
        success: false,
        message: "Password not matched",
      });
    }

    // CREATE JWT TOKEN
    const payload = {
      role: user.role,
      userId: user._id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    user.token = token;

    // Send login notification
    const emailInfo = await sendMail(
      email,
      `SUCCESSFULLY LOGGED IN`,
      `<h3>WELCOME TO STYLEVOW</h3>
      <p>You have successfully logged in to our website.</p>
      <p>Thank you for shopping with us!</p>
      `
    );

    res
      .status(200)
      .json({
        success: true,
        message: "USER SUCCESSFULLY LOGIN",
        user,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "ERROR IN LOGIN USER",
      error: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const id = req.user.userId;
    const user = await User.findById(id);
    user.token = null;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "LOGGED OUT SUCCESSFULLY",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ERROR IN LOGOUT USER",
      error: error.message,
    });
  }
};

// Get user by id
exports.getUser = async (req, res) => {
  try {
    const id = req.user.userId;
    let user;
    if (id) {
      user = await User.findById(id)
        .populate({
          path: "order",
          populate: {
            path: "shippingAddress",
          },
          populate: {
            path: "products",
          },
        })
        .populate({
          path: "cart",
          populate: {
            path: "product", // Populate the 'product' field within the 'cart' documents
          },
        })
        .populate({
          path: "reviews",
          populate: {
            path: "user",
          },
        })
        .populate("wishlist")
        .populate("cards")
        .populate("address");
    }
    // if (email) {
    //   user = await User.findOne({ email })
    //     .populate("order")
    //     .populate({
    //       path: "cart",
    //       populate: {
    //         path: "product", // Populate the 'product' field within the 'cart' documents
    //       },
    //     })
    //     .populate("reviews")
    //     .populate("wishlist")
    //     .populate("cards")
    //     .populate("address");

    //   console.log(user.cart);
    // }
    // Check if fields are populated or not
    if (user) {
      user.cart = user.cart || [];
      user.reviews = user.reviews || [];
      user.wishlist = user.wishlist || [];
    }

    res.status(200).json({
      success: true,
      message: "USER SUCCESSFULLY FETCHED",
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "ERROR IN USER FETCH",
      error: error.message,
    });
  }
};
// Get user by id
exports.getUsers = async (req, res) => {
  try {
    let users = await User.find()
      .populate("order")
      .populate({
        path: "cart",
        populate: {
          path: "product",
        },
      })
      .populate("reviews")
      .populate("wishlist")
      .populate("cards")
      .populate("address");

    res.status(200).json({
      success: true,
      message: "USER SUCCESSFULLY FETCHED",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ERROR IN USER FETCH",
      error: error.message,
    });
  }
};
