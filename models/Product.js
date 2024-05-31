const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    desc: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    cutPrice: {
        type: Number,
        required: true
    },
    images: [
        {
            type: Object
        }
    ]
    ,
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reviews"
    }],
    size: [{
        type: String,
        required: true
    }],
    color: [{
        type: String,
        required: true
    }],
    sold: {
        type: Number,
        required: true,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    additionalDetails: {
        type: Object
    },
    detailDesc: {
        type: Object
    },
    rating:{
        type:Number,
        default:5
    },
    inStock: {
        type: Boolean,
        enum: [true, false],
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
