const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        unique: true,
        require: true
    },
    offerValue: {
        type: Number,
        default: 0
    },
    maxValue: {
        type: Number,
    },
    minValue: {
        type: Number,
    },
    categoryDiscription: {
        type: String,
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
});
const category = mongoose.model('category', categorySchema);

module.exports = category;