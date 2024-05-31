const Router = require('express').Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })

// Import Routes
const { create, update, deleteProduct, getAll, getById } = require('../controllers/Product');
const { verifyUser, isAdmin } = require('../middlewares/auth');
// ROUTES
Router.post("/create", upload.array('images'), verifyUser, isAdmin, create);
Router.put("/update", upload.array('images'), verifyUser, isAdmin, update);
Router.delete("/delete", verifyUser, isAdmin, deleteProduct);
Router.post("/get",  getById);
Router.get("/all",  getAll);

module.exports = Router;