const UserModel = require('../models/user');
const OTP = require('../models/otpModel');
const ProductModel = require('../models/productModel');
const OrderModel = require('../models/order');
const bcrypt = require('bcrypt');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


//---------- USER CONTROLLER----------------

// PASSWORD ENCRIPTION
const pwdEncription = (password) => {
    const hashedPWD = bcrypt.hash(password, 10)
    return hashedPWD
}
// HOME
const home = async (req, res) => {
    try {
        const data = await ProductModel.find();
        res.render('user/Home', { log: "LogOut", title: "Home", user: req.session.user, data })
    } catch (error) {
        console.log(error);
        res.status(500).send("internal error")
    }
}

// LOGIN VALIDATION
const login = (req, res) => {
    res.render('user/login', { title: 'Login', user: req.session.user })
}
const validation = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await UserModel.findOne({ email: email });
        if (userData.isBlocked === false) {
            if (userData) {
                const VPWD = await bcrypt.compare(password, userData.password);
                if (VPWD) {
                    req.session.user = userData.name;
                    req.session.email = userData.email;
                    res.redirect('/')
                } else {
                    res.render("user/login", { fail: "Ckeck Your Password", user: req.session.user })
                }

            } else {
                res.render('user/login', { fail: "Check Your Email", user: req.session.user })
            }
        } else {
            res.render('user/login', { fail: "Pease Contact Your Admin You are not Allow to Use this Account AnyMore", user: req.session.user })
        }


    } catch (error) {
        console.log(error)
    }
}


// REGISTRATION
const signup = (req, res) => {
    res.render('user/signUp', { title: "Sign Up", user: req.session.user })
}
const registerUser = async (req, res) => {
    try {
        const enPwd = await pwdEncription(req.body.password);
        req.body.password = enPwd;
        req.body.isBlocked = false;
        // USER INFO SAVING TO DB
        await UserModel.create(req.body)

        // OTP CODE
        const number = req.body.number
        // generat randome 4 digit number
        let randome = Math.floor(Math.random() * 9000) + 1000;

        // send random number to user
        client.messages
            .create({ body: randome, from: '+12542726949', to: `+91${number}` })
            .then(saveUser());

        //save randome Number to database then render verify page
        function saveUser() {
            const newUser = new OTP({
                number: randome
            })
            newUser.save()
                .then(() => {
                    res.render('user/verification', { user: req.session.user });
                })
                .catch((error) => {
                    console.log("error generating numb", error);
                });
        }
    }
    catch (error) {
        console.log(error)
        res.render('user/signUp', { succ: "Please Use a Uniqe Email ID", user: req.session.user })
    }
}
const OTPValidation = async (req, res) => {
    try {
        const num1 = req.body.num_1;
        const num2 = req.body.num_2;
        const num3 = req.body.num_3;
        const num4 = req.body.num_4;
        const code = parseInt(num1 + num2 + num3 + num4)

        await OTP.find({ number: code })
            .then((fount) => {
                if (fount.length > 0) {
                    res.redirect("/success")
                    // IF FOUND, DELETE THE OTP CODE FROM DB
                    OTP.findOneAndDelete({ number: code })
                        .then(() => {
                            console.log("successfully deleted")
                        })
                        .catch((err) => {
                            console.log("error while deleting", err);
                        });
                } else {
                    res.render('user/verification', { fal: "Please Check Your OTP", user: req.session.user })
                }
            })
            .catch((err) => {
                res.render('user/verification', { fal: "Please Check Your OTP", user: req.session.user })
            })
    } catch (error) {
        console.log(error)
        res.status(500).send("Otp error")
    }
}

// Success
const successTick = (req, res) => {
    res.render('user/successTick', { title: "Account", succ: "SuccessFully Create Your Account", user: req.session.user })
}

// Detaild view
const detaildView = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await ProductModel.findOne({ _id: id });
        const cate = data.category[0];
        const category = await ProductModel.find({ category: cate });
        res.render('user/productView', { title: "Product View", user: req.session.user, data, category })
    } catch (error) {
        console.log(error)
    }
}

// Cart
const cartload = async (req, res) => {
    try {
        const userEmail = req.session.email;
        const user = req.session.user;
        const userData = await UserModel.findOne({ email: userEmail });
        const cartItems = userData.cart.items;
        const cartProductIds = cartItems.map(item => item.productId);
        const cartProducts = await ProductModel.find({ _id: { $in: cartProductIds } });

        const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
        let totalPrice = 0;
        for (const item of cartItems) {
            const product = cartProducts.find(prod => prod._id.toString() === item.productId.toString());
            totalPrice += item.quantity * product.price;
        }

        res.render('user/Cart', { title: "Cart", user, cartProducts, cartItems, totalQuantity, totalPrice });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal error from cart side");
    }
};

const cart = async (req, res) => {
    try {
        const id = req.params.id;
        const userEmail = req.session.email;
        const user = req.session.user;
        const userData = await UserModel.findOne({ email: userEmail });
        const cartItems = userData.cart.items;
        const existingCartItem = cartItems.find(item => item.productId.toString() === id);
        const cartPrtoduct = await ProductModel.findOne({ _id: id });
        const productPrice = cartPrtoduct.price;

        if (existingCartItem) {
            existingCartItem.quantity += 1;
            existingCartItem.price = existingCartItem.quantity * productPrice;
        } else {
            const newCartItem = {
                productId: id,
                quantity: 1,
                price: cartPrtoduct.price
            };
            userData.cart.items.push(newCartItem);
        }

        await userData.save();
        const cartProductIds = cartItems.map(item => item.productId);
        const cartProducts = await ProductModel.find({ _id: { $in: cartProductIds } });

        const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
        let totalPrice = 0;
        for (const item of cartItems) {
            const product = cartProducts.find(prod => prod._id.toString() === item.productId.toString());
            if (product && product.price) {
                totalPrice += item.quantity * product.price;
            }
        }

        res.render('user/Cart', { title: "Cart", user, cartProducts, cartItems, totalQuantity, totalPrice });
    } catch (error) {
        console.log('Error adding to cart:', error);
    }
};

const cartDelete = async (req, res) => {
    try {
        const id = req.params.id;
        const userEmail = req.session.email;
        await UserModel.updateOne(
            { email: userEmail },
            { $pull: { 'cart.items': { _id: id } } }
        );
        res.redirect('/cart');
    } catch (error) {
        console.log(error);
        res.status(500).send("internal error at cartDelete")
    }
}

// Check out 
const Checkout = async (req, res) => {
    try {
        const user = req.session.user;
        const userFinder = req.session.email;
        const userDetails = await UserModel.findOne({ email: userFinder });
        const cartItems = userDetails.cart.items;
        const cartProductIds = cartItems.map(item => item.productId.toString());
        const cartProducts = await ProductModel.find({ _id: { $in: cartProductIds } });
        const address = userDetails.address;
        let totalPrice = 0;
        cartItems.map(item => totalPrice += item.price);
        res.render('user/account/billing', { title: "Check", user, cartItems, cartProducts, totalPrice, address })
    } catch (error) {
        console.log(error);
    }
}

const addressAdding = async (req, res) => {
    try {
        const email = req.session.email;
        const { name, houseName, street, city, state, phone, postalCode } = req.body;

        const userData = await UserModel.findOne({ email: email });

        if (!userData) {
            return console.log("User not found")
        }

        const newAddress = {
            name: name,
            houseName: houseName,
            street: street,
            city: city,
            state: state,
            phone: phone,
            postalCode: postalCode
        };

        userData.address.push(newAddress);
        await userData.save();
        res.redirect('/CheckOut');
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error");
    }
};

const orderSuccess = async (req, res) => {
    try {
        const data = req.body
        const user = req.session.user;
        const email = req.session.email;
        const foundUser = await UserModel.findOne({ email: email });
        const userId = foundUser._id;        
        const cartItems = foundUser.cart.items;
        const cartProductIds = cartItems.map(item => item.productId.toString());

        const addressId = data.selectedAddress;
        const method = data.method;
        const amount = data.amount;
        
        const newOrder = new OrderModel({
            userId: userId,
            address:addressId,
            payment:{
                method:method,
                amount:amount
            },
            status: "Processing"
        });
        await newOrder.save();
        foundUser.cart.items = [];
        await foundUser.save();

        res.render('user/successTick.ejs',{user,succ:"Your Order Will Conformed...."})
}catch (error) {
    console.log('data not comming');
    res.status(500).send('An error occurred While saving data in DB');
}
}

// LOGOUT
const logOut = async (req, res) => {
    try {
        req.session.user = null;
        req.session.email = null;
        res.redirect('/');
    } catch (error) {
        console.log(error)
    }

}

module.exports = {
    home,
    login,
    signup,
    OTPValidation,
    successTick,
    registerUser,
    validation,
    logOut,
    detaildView,
    Checkout,
    cartload,
    cart,
    cartDelete,
    addressAdding,
    orderSuccess
}