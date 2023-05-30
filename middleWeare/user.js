const userModel = require('../models/user');
const ProductModel = require('../models/productModel');

const islogin = async (req, res, next) => {
    try {
        if (req.session.user) {
            next()
        } else {
            const data = await ProductModel.find()
            res.render('user/home',{title: 'Home', data})
        }

    } catch (err) {
        console.log(err)
    }
}

const isLogOut = async(req, res, next) => {
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
            const user = await userModel.findOne({ email: email });
            if (user.isBlocked === false) {
                next()
            } else {
                req.session.email = null;
                req.session.user = null;
                res.render("user/login", { fail: "Please contact Your Admin You are no longer to access this account" });
            }
        } else {
            next()
        }
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    islogin,
    isLogOut,
    userIsBlocked
}