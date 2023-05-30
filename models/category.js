const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    categoryName:{
        type: String,
        unique:true,
        require: true
    },
    categoryDiscription:{
        type: String,
    },
    isAvailable:{
        type: Boolean,
        default: true
    }
})


const category = mongoose.model('category',categorySchema);

module.exports =category