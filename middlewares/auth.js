const jwt = require("jsonwebtoken");

// Lets start to create all middlewares here that are related to authentication and authorization
exports.verifyUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization.replace("Bearer ", "");
    // Split token in the headers
    if (!token) {
      return res.status(500).json({
        success: false,
        message: "HEADERS NOT FOUND OR NOT STARTS WITH BEARER",
      });
    }
    // console.log(token);

    // DECODE TOKEN
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decode);
    if (!decode) {
      return res.status(500).json({
        success: false,
        message: "ERROR IN DECODE OF JWT TOKEN",
      });
    }
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "ERROR IN VERIFY TOKEN",
      error: error.message,
    });
  }
};
// Lets start to create all middlewares here that are related to authentication and authorization
exports.isAdmin = async (req, res, next) => {
  try {
    const role = req.user.role;
    // Check role
    if (!role) {
      return res.status(500).json({
        success: false,
        message: "ROLE NOT FOUND",
      });
    }

    if (role !== "admin") {
      return res.status(500).json({
        success: false,
        message: "PROTECTED ROUTE FOR ONLY ADMINS",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ERROR IN VERIFY ADMIN",
      error: error.message,
    });
  }
};
