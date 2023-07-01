const userModel = require('../models/user');
const ProductModel = require('../models/productModel');


const islogin = async (req, res, next) => {
    try {
        if (req.session.user) {
            next()
        } else {
            const user = req.session.user;
            const data = await ProductModel.find();
            const dataNormal = await ProductModel.find({ availability: true }).limit(8);
            let cartCount;
            res.render('user/Home', { title: 'Home', user, data,cartCount,dataNormal });
        }
    } catch (err) {
        console.log(err)
    }
}

const isLogOut = async (req, res, next) => {
    try {
        if (req.session.user) {
            res.redirect('/');
        } else {
            next()
        }
    } catch (error) {
        console.log(error);
    }
}

const userIsBlocked = async (req, res, next) => {
    try {
        if (req.session.user) {
            const email = req.session.email;
            const user = req.session.user;
            const useremail = await userModel.findOne({ email: email });
            if (useremail.isBlocked === false) {
                next()
            } else {
                req.session.email = null;
                req.session.user = null;
                res.render("user/login", {user, fail: "Please contact Your Admin You are no longer to access this account" });
            }
        } else {
            next()
        }
    } catch (error) {
        console.log(error)
    }
}

const userCheking = (req,res,next)=>{
   if(req.session.user){
    next()
   }else{
    res.redirect('/login');
   }
}

module.exports = {
    islogin,
    isLogOut,
    userIsBlocked,
    userCheking
}