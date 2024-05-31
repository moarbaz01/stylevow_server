const Router = require('express').Router();

// IMPORT HANDLERS
const {create, update, deleteCart} = require('../controllers/Cart');
const {verifyUser} = require('../middlewares/auth')
// ROUTES
Router.post("/create", verifyUser, create );
Router.put("/update", verifyUser, update );
Router.delete("/delete", verifyUser, deleteCart );

module.exports = Router;