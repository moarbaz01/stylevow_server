const Router = require("express").Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
// Import all user routes and middlewares
const { verifyUser, isAdmin } = require("../middlewares/auth");
const {
  changePassword,
  resetPassword,
  generateResetToken,
  updateInformation,
  sendSMS,
  verifySMS,
  removeProductToWishList,
  addProductToWishList,
} = require("../controllers/Profile");
const {
  create,
  update,
  deleteAddress,
  getAddress,
} = require("../controllers/Address");
const {
  add,
  updateCard,
  deleteCard,
  getCard,
} = require("../controllers/Cards");

// Create Routes
Router.put("/changePassword", verifyUser, changePassword);
Router.put("/resetPassword", resetPassword);
Router.post("/generateResetLink", generateResetToken);
Router.put(
  "/information",
  upload.single("profileImage"),
  verifyUser,
  updateInformation
);
Router.post("/sendSMS", sendSMS);
Router.post("/verifySMS", verifySMS);
Router.post("/address", verifyUser, create);
Router.put("/address", verifyUser, update);
Router.delete("/address", verifyUser, deleteAddress);
Router.post("/address/get", verifyUser, getAddress);

// Card ROutes
Router.post("/card", verifyUser, add);
Router.put("/card", verifyUser, updateCard);
Router.delete("/card", verifyUser, deleteCard);
Router.post("/card/get", verifyUser, getCard);

// Wishlist Routes
Router.post("/wishlist", verifyUser, addProductToWishList);
Router.delete("/wishlist/:id", verifyUser, removeProductToWishList);

// Admin Routes
module.exports = Router;
