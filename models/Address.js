const mongoose = require('mongoose');

// Address Schema
const AddressSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    streetAddress:{
        type: String,
        required: true
    },
    streetAddress2:{
        type: String,
    },
    city:{
        type: String,
        required: true
    },
    state:{
        type: String,
        required: true
    },
    zip:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    }

});

module.exports = mongoose.model('Address', AddressSchema);