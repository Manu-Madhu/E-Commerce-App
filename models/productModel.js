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
    offerPrice:{
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
})

const product = mongoose.model('product', productSchema);
module.exports = product 