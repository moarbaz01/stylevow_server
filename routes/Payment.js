// Payment routes
const express = require('express');
const router = express.Router();

// Import
const {verifyUser} = require('../middlewares/auth');
const {paymentInitialize,paymentVerify} = require('../controllers/Payment');

// ROutes
router.post('/initialize',verifyUser,paymentInitialize);
router.post('/verify', verifyUser, paymentVerify);
module.exports = router;