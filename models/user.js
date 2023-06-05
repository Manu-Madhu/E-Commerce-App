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
            },
            price: {
                type: Number,
                require: true
            }
        }]
    },
    address:[{
        name: {
            type: String,
            required: true
        },
        houseName: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        phone: {
            type: Number,
            required: true
        },
        postalCode: {
            type: Number,
            required: true
        }
    }]
}, { timestamps: true });

const user = mongoose.model("user", userSchema);
module.exports = user

