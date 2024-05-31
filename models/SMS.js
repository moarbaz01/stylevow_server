const mongoose = require('mongoose');

// Phone otp schema
const smsSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true
    },
    otp: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '5m' }
    }
    
} );

module.exports = mongoose.model('SMS', smsSchema);