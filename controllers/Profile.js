const bcrypt = require("bcrypt");
const User = require("../models/User");
const sendMail = require("../utils/sendMail");
const crypto = require("crypto");
const uploadImage = require("../utils/uploadImage");
const otpGenerator = require("otp-generator");
const SMS = require("../models/SMS");
const vonage = require("../config/vonage");
const ResetToken = require("../models/ResetToken");
const Product = require("../models/Product");

// Change Password
exports.changePassword = async (req, res) => {
  try {
    // Fetch Data
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.userId;

    if (!oldPassword || !newPassword || !confirmPassword || !userId) {
      return res.status(500).json({
        success: false,
        message: "ALL FIELDS ARE MENDANTORY",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(500).json({
        success: false,
        message: "CONFIRM PASSWORD AND NEW PASSWORD NOT MATCHED",
      });
    }

    // Check is user available or not
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "USER NOT FOUND",
      });
    }

    // Compare password
    const comparePassword = await bcrypt.compare(oldPassword, user.password);
    if (!comparePassword) {
      return res.status(500).json({
        success: false,
        message: "PASSWORD NOT MATCHED",
      });
    }

    // Hashed Password
    const hashPass = await bcrypt.hash(newPassword, 10);

    // Save this password in user database
    await User.findByIdAndUpdate(
      userId,
      {
        password: hashPass,
      },
      { new: true }
    );

    // SEND EMAIL TO USER
    await sendMail(user.email, "YOUR PASSWORD SUCCESSFULLY CHANGE");

    res.status(200).json({
      success: true,
      message: "SUCCESSFULLY PASSWORD CHANGE",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ERROR IN PASSWORD CHANGE",
      error: error.message,
    });
  }
};

// Send otp on phone number using twilio
exports.sendSMS = async (req, res) => {
  try {
    // Fetch Data
    const { phone } = req.body;

    if (!phone) {
      return res.status(500).json({
        success: false,
        message: "PHONE NUMBER IS MENDANTORY",
      });
    }

    // Generate 6 DIGIT OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    console.log(otp);

    // Save OTP in sms database
    const saveOTP = await SMS.create({
      phone,
      otp,
    });
    // Send OTP
    const from = "STYLEVOW";
    const to = `91${phone}`;
    const text = `Your OTP is ${otp}`;

    async function sendSMS() {
      await vonage.sms
        .send({ to, from, text })
        .then((resp) => {
          console.log("Message sent successfully");
          console.log(resp);
        })
        .catch((err) => {
          console.log("There was an error sending the messages.");
          console.error(err);
        });
    }

    sendSMS();

    res.status(200).json({
      success: true,
      message: "OTP SEND SUCCESSFULLY",
      otp,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ERROR IN SEND OTP",
      error: error.message,
    });
  }
};

// VERIFY SMS
exports.verifySMS = async (req, res) => {
  try {
    // Fetch Data
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(500).json({
        success: false,
        message: "ALL FIELDS ARE MENDANTORY",
      });
    }

    // Find recent otp
    const recentOTP = await SMS.findOne({ phone })
      .sort({ createdAt: -1 })
      .limit(1);
    if (!recentOTP) {
      return res.status(500).json({
        success: false,
        message: "SEND OTP FIRST",
      });
    }

    // Check is otp matched or not
    if (recentOTP.otp !== otp) {
      return res.status(500).json({
        success: false,
        message: "OTP NOT MATCHED OR EXPIRED",
      });
    }

    // Delete OTP from database
    await SMS.findByIdAndDelete(recentOTP._id);

    res.status(200).json({
      success: true,
      message: "OTP VERIFIED SUCCESSFULLY",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ERROR IN VERIFY OTP",
      error: error.message,
    });
  }
};

// GENERATE RESET TOKEN
exports.generateResetToken = async (req, res) => {
  try {
    // FETCH USER EMAIL
    const { email } = req.body;
    console.log(email);

    // EMAIL VALIDATION
    if (!email) {
      return res.status(500).json({
        success: false,
        message: "EMAIL NOT FOUND",
      });
    }

    // CHECK USER EXISTENCE
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(500).json({
        success: false,
        message: "USER NOT FOUND",
      });
    }

    // GENERATE A TOKEN
    const token = crypto.randomBytes(20).toString("hex");

    await User.findOneAndUpdate(
      { email },
      {
        resetToken: token,
      }
    );

    // CREATE A LINK FOR USER
    const link = `${process.env.BASE_URL}/resetPassword/?id=${user._id}&token=${token}`;
    // SEND EMAIL TO THE USER
    await sendMail(
      email,
      "PASSWORD RESET",
      `<a href="${link}">CLICK TO THE LINK</a>`
    );

    await ResetToken.create({
      email,
      token,
    });

    res.status(200).json({
      success: true,
      message: "CHECK YOUR EMAIL AND CLICK ON THE LINK",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ERROR IN GENERATE LINK",
    });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    // Fetch Data
    const { token, userId, newPassword, confirmPassword } = req.body;

    if (!token || !userId || !newPassword || !confirmPassword) {
      return res.status(500).json({
        success: false,
        message: "ALL FIELDS ARE MENDANTORY",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(500).json({
        success: false,
        message: "CONFIRM PASSWORD AND NEW PASSWORD NOT MATCHED",
      });
    }

    // Check is user available or not
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "USER NOT FOUND",
      });
    }

    const recentToken = await ResetToken.findOne({ email: user.email })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!recentToken) {
      return res.status(500).json({
        success: false,
        message: "TOKEN EXPIRED || GENERATE NEW TOKEN",
      });
    }
    // VERIFY TOKEN
    if (token !== recentToken.token) {
      return res.status(500).json({
        success: false,
        message: "TOKEN EXPIRED SO TRY TO GENERATE ANOTHER LINK",
      });
    }

    // Compare password
    const hashPassword = await bcrypt.hash(newPassword, 10);

    // Save this password in user database
    user.password = hashPassword;
    await user.save();

    // SEND EMAIL TO USER
    await sendMail(user.email, "YOUR PASSWORD SUCCESSFULLY RESET", "Congrats");

    // Delete token
    await ResetToken.findByIdAndDelete(recentToken._id);

    res.status(200).json({
      success: true,
      message: "SUCCESSFULLY PASSWORD RESET",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "ERROR IN PASSWORD RESET PROCESS",
      error: error.message,
    });
  }
};

// Update Profile
exports.updateInformation = async (req, res) => {
  try {
    // FETCH USER DATA
    const userId = req.user.userId;
    const userdata = {
      ...req.body,
    };
    if (req.file) {
      const profileImage = req.file;
      // UPLOAD PROFILE IMAGE
      const folderName = "USER_PROFILE_IMAGE";

      // SEND IMAGE DATA
      const imageUpload = await uploadImage(profileImage.path, folderName);
      // console.log("Image Data : ",profileImage)
      if (!imageUpload) {
        return res.status(500).json({
          success: false,
          message: "ERROR IN IMAGE UPLOAD PROCESS",
        });
      }
      userdata.profileImage = imageUpload.secure_url;
    }

    // Check user existence
    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...userdata,
      },
      { new: true }
    );
    if (!user) {
      return res.status(500).json({
        success: false,
        message: "USER NOT FOUND",
      });
    }

    res.status(200).json({
      success: true,
      message: "USER INFORMATION SUCCESSFULLY UPDATE",
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ERROR IN USER INFORMATION UPDATE PROCESS",
      error: error.message,
    });
  }
};

// Wish List
exports.addProductToWishList = async (req, res) => {
  try {
    // FETCH DATA
    const userId = req.user.userId;
    const { productId } = req.body;

    // Check is user available or not
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "USER NOT FOUND",
      });
    }

    // Check is product available or not
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "PRODUCT NOT FOUND",
      });
    }

    user.wishlist.push(productId);
    await user.save();

    res.json({
      success: true,
      message: "PRODUCT ADDED TO WISHLIST",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "ERROR IN ADDING PRODUCT TO WISHLIST",
    });
  }
};
exports.removeProductToWishList = async (req, res) => {
  try {
    // FETCH DATA
    const userId = req.user.userId;
    const productId = req.params.id;

    // Check is user available or not
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "USER NOT FOUND",
      });
    }

    // Check is product available or not
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "PRODUCT NOT FOUND",
      });
    }

    user.wishlist.pull(productId);
    await user.save();

    res.json({
      success: true,
      message: "PRODUCT REMOVED TO WISHLIST",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "ERROR IN REMOVING PRODUCT TO WISHLIST",
    });
  }
};
