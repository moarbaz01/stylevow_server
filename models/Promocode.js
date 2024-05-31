const mongoose = require("mongoose");

// UserSchema
const promocodeSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
        },
        type: {
            type: String,
            enum: ["percentage", "amount"],
            required: true,
        },
        discount: {
            type: Number,
            required: true,
        },
        limit: {
            type: Number,
            default: 1,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        },
        used: {
            type: Number,
            required: true,
            default: 0
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Promocode", promocodeSchema);
