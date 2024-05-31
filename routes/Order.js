const Router = require('express').Router();

// Import all of the API Handlers
const { create, update, cancel, getOrders } = require('../controllers/Order');
const { verifyUser, isAdmin } = require('../middlewares/auth');

// Routes
Router.post('/create', verifyUser, create);
Router.post('/update', verifyUser,  update);
Router.post('/cancel', verifyUser, cancel);
Router.get('/get', verifyUser,isAdmin, getOrders);
module.exports = Router;