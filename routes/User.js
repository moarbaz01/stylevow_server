const Router = require("express").Router();

// Import all user routes and middlewares
const {
    login,
    signup,
    sendOTP,
    getUser,
    getUsers,
} = require("../controllers/User");
const { verifyUser, isAdmin } = require("../middlewares/auth");

// Create ROutes
Router.post("/otp", sendOTP);
Router.post("/signup", signup);
Router.post("/login", login);

// ADMIN ROUTES
Router.get("/user", verifyUser, getUser);
Router.get("/users", verifyUser, isAdmin, getUsers);

module.exports = Router;
