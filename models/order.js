const mongoose =require("mongoose");
const userModel =require('./user');


const orderSchema = new mongoose.Schema({
    userId:{
       type:mongoose.Schema.Types.ObjectId,
       ref:userModel
    },
    address:{
       type:mongoose.Schema.Types.ObjectId,
       ref:userModel
    },
    payment:{
       method:{
        type:String,
       },
       amount:{
        type:String,
       }
    },
    status:{
        type:String,
        default:"Processing"
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now()
      },
});

const orderModel = mongoose.model('order',orderSchema);
module.exports = orderModel;
