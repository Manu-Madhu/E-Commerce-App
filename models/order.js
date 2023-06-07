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
    products:[{
      p_name: {
         type: String,
         require: true
     },
     price: {
         type: String,
         require: true
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
    }],
    payment:{
       method:{
        type:String,
       },
       amount:{
        type:String,
       }
    },
    orderCancleRequest:{
        type:Boolean,
        default:false
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
      expectedDelivery:{
        type:Date,
      }
});

const orderModel = mongoose.model('order',orderSchema);
module.exports = orderModel;
