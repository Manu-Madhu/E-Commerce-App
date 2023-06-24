const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    p_name: {
        type: String,
        require: true
    },
    price: {
        type: String,
        require: true
    },
    c_offerPrice:{
        type:String
    },
    productOffer:{
        type:String
    },
    finalPrice:{
        type:String
    },
    description: {
        type: String,
        require: true
    },
    image: [{
        type: String,
        require: true
    }],
    category: [{
        type: String,
        require: true
    }],
    size: {
        type: String,
        require: true
    },
    color: {
        type: String,
        require: true
    },
    quantity: {
        type: String,
        require: true
    },
    availability:{
        type:Boolean,
        require:true,
        default:true
    }
})

const product = mongoose.model('product', productSchema);
module.exports = product 