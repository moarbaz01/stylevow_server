const mongoose = require("mongoose");

// UserSchema
const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        product:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
        review: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        likes:[
            {
                type:mongoose.Schema.Types.ObjectId, 
                ref:"User",
            }
        ],
        dislikes:[
            {
                type:mongoose.Schema.Types.ObjectId, 
                ref:"User",
            }
        ],
       
        images:[
            {
                type:Object,
            }
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Reviews", reviewSchema);
