const mongoose = require('mongoose');
const productModel = require('./productModel');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isBlocked: {
        type: Boolean,
        default: false,
        require: true
    },
    cart: {
        items: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: productModel
            },
            quantity: {
                type: Number,
                default: 1
            }
        }]
    }
}, { timestamps: true });

const user = mongoose.model("user", userSchema);
module.exports = user

