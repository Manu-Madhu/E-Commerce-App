const UserModel = require('../models/user');
const OTP = require('../models/otpModel');
const ProductModel = require('../models/productModel');
const OrderModel = require('../models/order');
const bcrypt = require('bcrypt');
const Razorpay = require('razorpay');
const couponModle = require('../models/coupon');
const categoryModel = require('../models/category');
const orderModel = require('../models/order');
const fast2sms = require('fast-two-sms');


// Fast 2 SMS
const API = process.env.FAST_2_SMS_API;
// Razorpoy
const key_id = process.env.RAZORPAY_API_KEY;
const key_secret = process.env.RAZORPAY_API_SECRET

//---------- USER CONTROLLER----------------

// PASSWORD ENCRIPTION
const pwdEncription = (password) => {
    const hashedPWD = bcrypt.hash(password, 10)
    return hashedPWD
}

// HOME
const home = async (req, res) => {
    try {
        const data = await ProductModel.find({ availability: true }).sort({ _id: -1 }).limit(8);
        const dataNormal = await ProductModel.find({ availability: true }).limit(8);
        const userData = await UserModel.findOne({ email: req.session.email });
        const cart = userData.cart.items;
        const cartCount = cart.length;
        res.render('user/Home', { log: "LogOut", title: "Home", user: req.session.user, data, dataNormal, cartCount })
    } catch (error) {
        console.log(error);
        res.status(500).send("internal error")
    }
}

// LOGIN VALIDATION
const login = (req, res) => {
    let cartCount;
    res.render('user/login', { title: 'Login', user: req.session.user, cartCount })
}
const validation = async (req, res) => {
    try {
        const {email,password} = req.body;
        const userData = await UserModel.findOne({ email: email });
        
        if (userData.isBlocked === false) {
            if (userData) {
                const VPWD = await bcrypt.compare(password, userData.password);
                if (VPWD) {
                    const userNumber = userData.number;
                    const number = userNumber;
                    let cartCount;
                    let signinPage = 0;
                    req.session.data = {
                        userName: userData.name,
                        userEmail: userData.email
                    }
                    // generat randome 4 digit number
                    let randome = Math.floor(Math.random() * 9000) + 1000;
                    fast2sms.sendMessage({
                        authorization: API,
                        message: `Your verification OTP is: ${randome}`,
                        numbers: [number],
                    })
                        .then(saveUser());

                    //save randome Number to database then render verify page
                    function saveUser() {
                        const newUser = new OTP({
                            number: randome
                        })
                        newUser.save()
                            .then(() => {
                                res.render('user/verification', { user: req.session.user, cartCount, signinPage });
                            })
                            .catch((error) => {
                                console.log("error generating numb", error);
                            });
                    }
                } else {
                    const cart = userData.cart.items;
                    const cartCount = cart.length;
                    res.render("user/login", { fail: "Check Your Password", user: req.session.user, cartCount })
                }

            } else {
                res.render('user/login', { fail: "Check Your Email", user: req.session.user, cartCount })
            }
        } else {
            res.render('user/login', { fail: "Pease Contact Your Admin You are not Allow to Use this Account AnyMore", user: req.session.user, cartCount })
        }
    } catch (error) {
        console.log(error);
        res.render('user/login', { fail: "Pease Use proper credentials", user: req.session.user })
    }
}
const forGotPassword = async (req, res) => {
    try {
        let cartCount;
        res.render("user/forgotPassword", { user: req.session.user, cartCount })
    } catch (error) {
        console.log(error);
    }
}
const numberValidation = async (req, res) => {
    try {
        const number = req.body.number;
        req.session.userNumber = number;
        const signinPage = 2;
        let cartCount;
        const userExist = await UserModel.findOne({ number: number });
        if (userExist) {
            const randome = Math.floor(Math.random() * 9000) + 1000;
            fast2sms.sendMessage({
                authorization: API,
                message: `Your verification OTP is: ${randome}`,
                numbers: [number],
            })
                .then(saveUser());
            //save randome Number to database then render verify page
            function saveUser() {
                const newUser = new OTP({
                    number: randome
                })
                newUser.save()
                    .then(() => {
                        res.render('user/verification', { user: req.session.user, cartCount, signinPage });
                    })
                    .catch((error) => {
                        console.log("error generating numb", error);
                    });
            }
        } else {
            const msg = "Please Enter The Currect Number";
            let cartCount;
            res.render("user/forgotPassword", { user: req.session.user, msg, cartCount })
        }
    } catch (error) {
        const msg = "Server Error Wait for the Admin Response";
        let cartCount;
        console.log("error At the number validation inreset place" + error);
        res.status(500).render("user/forgotPassword", { user: req.session.user, msg, cartCount })
    }
}
const resetPassword = async (req, res) => {
    try {
        const num1 = req.body.num_1;
        const num2 = req.body.num_2;
        const num3 = req.body.num_3;
        const num4 = req.body.num_4;
        const code = parseInt(num1 + num2 + num3 + num4);
        const signinPage = 2;
        let cartCount;
        await OTP.find({ number: code })
            .then((fount) => {
                if (fount.length > 0) {
                    res.render("user/resetPassword", { user: req.session.user, cartCount })
                    // IF FOUND, DELETE THE OTP CODE FROM DB
                    OTP.findOneAndDelete({ number: code })
                        .then(() => {
                            console.log("successfully deleted")
                        })
                        .catch((err) => {
                            console.log("error while deleting", err);
                        });
                } else {
                    let cartCount;
                    res.render('user/verification', { fal: "Please Check Your OTP", user: req.session.user, cartCount, signinPage })
                }
            })
            .catch((err) => {
                console.log(err);
                res.render('user/verification', { fal: "Please Check Your OTP", user: req.session.user, cartCount, signinPage })
            })
    } catch (error) {
        console.log("reset password error" + error);
    }
}
const newPassword = async (req, res) => {
    try {
        const psw = req.body.password;
        const userNumber = req.session.userNumber;
        const newPassword = await pwdEncription(psw);
        await UserModel.findOneAndUpdate({ number: userNumber }, {
            $set: {
                password: newPassword
            }
        });
        req.session.userNumber = null;
        const succ = "Successfully Changed Your Password"
        let cartCount;
        res.render("user/successTick", { user: req.session.user, cartCount, succ });
    } catch (error) {
        console.log(error);
    }
}

// REGISTRATION
const signup = (req, res) => {
    let cartCount;
    res.render('user/signUp', { title: "Sign Up", user: req.session.user, cartCount })
}
const registerUser = async (req, res) => {
    try {
        const enPwd = await pwdEncription(req.body.password);
        req.body.password = enPwd;
        req.body.isBlocked = false;
        let cartCount;
        const signinPage = 1;
        // USER INFO SAVING TO DB
        const { name, number, email, password, confirmPassword, isBlocked } = req.body
        req.session.userData = {
            name: name,
            number: number,
            email: email,
            password: password,
            confirmPassword: confirmPassword,
            isBlocked: isBlocked
        }
        const dataExist = await UserModel.findOne({
            $or: [{ email }, { number }]
        });

        if (!dataExist) {
            // OTP CODE 
            const randome = Math.floor(Math.random() * 9000) + 1000;
            fast2sms.sendMessage({
                authorization: API,
                message: `Your verification OTP is: ${randome}`,
                numbers: [number],
            })
                .then(saveUser());
            //save randome Number to database then render verify page
            function saveUser() {
                const newUser = new OTP({
                    number: randome
                })
                newUser.save()
                    .then(() => {
                        res.render('user/verification', { user: req.session.user, cartCount, signinPage });
                    })
                    .catch((error) => {
                        console.log("error generating numb", error);
                    });
            }
        } else {
            console.log(error)
            let cartCount;
            res.render('user/signUp', { succ: "Please Use a Uniqe Email ID and Phone Number", user: req.session.user, cartCount })
        }


    } catch (error) {
        console.log(error)
        let cartCount;
        res.render('user/signUp', { succ: "Please Use a Uniqe Email ID and Phone Number", user: req.session.user, cartCount })
    }
}
const OTPValidationSignIn = async (req, res) => {
    let cartCount;
    try {
        const num1 = req.body.num_1;
        const num2 = req.body.num_2;
        const num3 = req.body.num_3;
        const num4 = req.body.num_4;
        const code = parseInt(num1 + num2 + num3 + num4);
        await OTP.find({ number: code })
            .then((fount) => {
                if (fount.length > 0) {
                    let cartCount;
                    const succ = "Successfully Created Your Account"
                    UserModel.create(req.session.userData);
                    res.render("user/successTick", { user: req.session.user, cartCount,succ })
                    // IF FOUND, DELETE THE OTP CODE FROM DB
                    OTP.findOneAndDelete({ number: code })
                        .then(() => {
                            console.log("successfully deleted")
                        })
                        .catch((err) => {
                            console.log("error while deleting", err);
                        });
                } else {
                    res.render('user/verification', { fal: "Please Check Your OTP", user: req.session.user, cartCount })
                }
            })
            .catch((err) => {
                console.log(err)
                res.render('user/verification', { fal: "Please Check Your OTP", user: req.session.user, cartCount })
            })
    } catch (error) {
        console.log(error)
        res.status(500).send("SignIn Otp error")
    }
}
const OTPValidation = async (req, res) => {
    let cartCount;
    try {
        const num1 = req.body.num_1;
        const num2 = req.body.num_2;
        const num3 = req.body.num_3;
        const num4 = req.body.num_4;
        const code = parseInt(num1 + num2 + num3 + num4);
        const { userName, userEmail } = req.session.data;
        await OTP.find({ number: code })
            .then((fount) => {
                if (fount.length > 0) {
                    req.session.user = userName;
                    req.session.email = userEmail;
                    const succ = "Successfully Logged In"
                    let cartCount;
                    res.render("user/successTick", { user: req.session.user, cartCount, succ });
                    // IF FOUND, DELETE THE OTP CODE FROM DB
                    OTP.findOneAndDelete({ number: code })
                        .then(() => {
                            console.log("successfully deleted")
                        })
                        .catch((err) => {
                            console.log("error while deleting", err);
                        });
                } else {
                    res.render('user/verification', { fal: "Please Check Your OTP", user: req.session.user, cartCount })
                }
            })
            .catch((err) => {
                res.render('user/verification', { fal: "Please Check Your OTP", user: req.session.user, cartCount })
            })
    } catch (error) {
        console.log(error)
        res.status(500).send("Otp error")
    }
}
// Success
const successTick = (req, res) => {
    let cartCount;
    res.render('user/successTick', { title: "Account", succ: "Success.....", user: req.session.user, cartCount })
}
// Search
const Search = async (req, res) => {
    try {
        const key = req.query.q;
        const searchPattern = new RegExp(key, 'i');
        const searchedProducts = await ProductModel.find({ p_name: searchPattern }).exec();
        const otherProducts = await ProductModel.find({ p_name: { $not: searchPattern } }).exec();
        const products = searchedProducts.concat(otherProducts);
        res.json(products);
    } catch (err) {
        console.log(`Error while performing search: ${err}`);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const orderSearch = async (req, res) => {
    try {
        const key = req.query.q;
        console.log(key)
        const searchPattern = new RegExp(key, 'i');
        const order = await orderModel.find();
        console.log(order)
        const searchedProducts = await orderModel.find({ p_name: searchPattern }).exec();
        console.log(searchedProducts)
        const otherProducts = await ProductModel.find({ p_name: { $not: searchPattern } }).exec();
        const products = searchedProducts.concat(otherProducts);
        res.json(products);
    } catch (error) {
        console.log(error)
    }
}

// Shop
const ShopView = async (req, res) => {
    try {

        const currentPage = parseInt(req.query.page) || 1;
        const itemsPerPage = 15;
        const totalProduct = await ProductModel.find();
        const totalPages = Math.ceil(totalProduct.length / itemsPerPage);
        const skip = (currentPage - 1) * itemsPerPage;
        const product = await ProductModel.find({ availability: true }).skip(skip).limit(itemsPerPage);

        const userDetails = await UserModel.findOne({ email: req.session.email });
        const category = await categoryModel.find();
        let cartCount, cart;
        if (userDetails) {
            cart = userDetails.cart.items;
            cartCount = cart.length;
        }
        res.render('user/Shop', { title: "Shop", user: req.session.user, cartCount, product, category, totalPages, currentPage });
    } catch (error) {
        console.log(error);
        res.status('500'.send("Internal server Error On ShopView"))
    }
}
const productFilter = async (req, res) => {
    try {
        const categoryName = JSON.parse(req.body.categoryName);
        if (categoryName.length == 0) {
            const product = await ProductModel.find({ availability: true });
            res.json(product);
        } else {
            const productByCata = await ProductModel.find({ category: { $in: categoryName } });
            res.json(productByCata);
        }
    } catch (error) {
        console.log(error);
        res.json("no data found")
    }
}
const sorting = async (req, res) => {
    try {
        const selectedValue = req.body.selectedValue;
        const currentPage = parseInt(req.query.page) || 1;
        const itemsPerPage = 15;
        const totalProduct = await ProductModel.find();
        const totalPages = Math.ceil(totalProduct.length / itemsPerPage);
        const skip = (currentPage - 1) * itemsPerPage;
        console.log(selectedValue);
        if (selectedValue == 'latest') {
            const product = await ProductModel.find().sort({ _id: -1 }).limit(itemsPerPage);
            res.json(product);
        } else if (selectedValue == "heighToLow") {
            const product = await ProductModel.aggregate([
                {
                    $addFields: {
                        finalPriceNumeric: { $toDouble: "$finalPrice" }
                    }
                },
                { $sort: { finalPriceNumeric: -1 } },
                { $limit: itemsPerPage }
            ]);
            res.json(product);
        } else if (selectedValue == "lowToHigh") {
            const product = await ProductModel.aggregate([
                {
                    $addFields: {
                        finalPriceNumeric: { $toDouble: "$finalPrice" }
                    }
                },
                { $sort: { finalPriceNumeric: 1 } },
                { $limit: itemsPerPage }
            ]);
            res.json(product);
        }
    } catch (error) {
        console.log(error);
        res.json("Failed");
    }
}

// Detaild view
const detaildView = async (req, res) => {
    try {
        const userData = await UserModel.findOne({ email: req.session.email });
        const id = req.params.id;
        const data = await ProductModel.findOne({ _id: id });
        const cate = data.category[0];
        const category = await ProductModel.find({ category: cate }).sort({ _id: -1 }).limit(4);
        let cart, cartCount;
        if (userData) {
            cart = userData.cart.items;
            cartCount = cart.length;
            res.render('user/productView', { title: "Product View", user: req.session.user, data, category, cartCount })
        } else {
            res.render('user/productView', { title: "Product View", user: req.session.user, data, category, cartCount })
        }

    } catch (error) {
        console.log("detaild page error" + error)
    }
}

// WhishList
const WhishListLoad = async (req, res) => {
    try {
        const user = req.session.user;
        const email = req.session.email;
        const userDetails = await UserModel.findOne({ email: email });
        const productData = userDetails.wishlist;
        const cart = userDetails.cart.items;
        const cartCount = cart.length;
        const productId = productData.map(items => items.productId);
        const productDetails = await ProductModel.find({ _id: { $in: productId } });
        res.render('user/whishList', { user, productDetails, cartCount })
    } catch (error) {
        console.log(error)
    }
}
const addingWhishList = async (req, res) => {
    try {
        const productId = req.params.id;
        const user = req.session.email;
        const userDetails = await UserModel.findOne({ email: user });
        const productExist = userDetails.wishlist.map(items => items.productId.toString() === productId);


        if (productExist.includes(true)) {
            return res.json("Already Existe");
        } else {
            const WhishList = {
                productId: productId
            }
            userDetails.wishlist.push(WhishList);
            await userDetails.save();
            return res.json('server got this....');
        }
    } catch (error) {
        console.log(error);
    }
}
const addingWhishListtoCart = async (req, res) => {
    try {
        const id = req.body.productId;
        const userEmail = req.session.email;
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
                price: cartPrtoduct.finalPrice,
                realPrice: cartPrtoduct.price
            };
            userData.cart.items.push(newCartItem);
        }

        await userData.save();
        res.json("successfully cart u r product")
    } catch (error) {
        console.log('Error adding to cart:', error);
    }
};
const WhishProductDelete = async (req, res) => {
    try {
        const productId = req.params.id;
        const userEmail = req.session.email;
        await UserModel.findOneAndUpdate(
            { email: userEmail },
            { $pull: { wishlist: { productId: productId } } }
        );
        res.redirect("/WhishList");
    } catch (error) {
        console.log("whish deleting Error" + error)
    }
}

// Cart
const cartload = async (req, res) => {
    try {
        const userEmail = req.session.email;
        const user = req.session.user;
        const userData = await UserModel.findOne({ email: userEmail });
        const similerProducts = await ProductModel.find({ availability: true }).sort({ p_name: -1 }).limit(4);
        const cartItems = userData.cart.items;
        const cartCount = cartItems.length;
        const cartProductIds = cartItems.map(item => item.productId);
        const cartProducts = await ProductModel.find({ _id: { $in: cartProductIds } });
        const productsPrice = cartItems.reduce((total, item) => total + parseFloat(item.realPrice), 0);
        const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
        let totalPrice = 0;
        for (const item of cartItems) {
            const product = cartProducts.find(prod => prod._id.toString() === item.productId.toString());
            if (product) {
                totalPrice += item.quantity * product.finalPrice;
            } else {
                console.log(`Product not found for item: ${item.productId}`);
            }
        }
        const discount = Math.abs(totalPrice - productsPrice);
        res.render('user/Cart', { title: "Cart", user, cartProducts, cartItems, productsPrice, totalQuantity, totalPrice, discount, cartCount, similerProducts });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal error from cart side");
    }
};
const cart = async (req, res) => {
    try {
        const id = req.params.id;
        const userEmail = req.session.email;
        const userData = await UserModel.findOne({ email: userEmail });
        const cartItems = userData.cart.items;
        const existingCartItem = cartItems.find(item => item.productId.toString() === id);
        const cartPrtoduct = await ProductModel.findOne({ _id: id });
        const productPrice = cartPrtoduct.finalPrice;

        if (existingCartItem) {
            existingCartItem.quantity += 1;
            existingCartItem.price = existingCartItem.quantity * productPrice;
        } else {
            const newCartItem = {
                productId: id,
                quantity: 1,
                price: cartPrtoduct.finalPrice,
                realPrice: cartPrtoduct.price
            };
            userData.cart.items.push(newCartItem);
        }

        await userData.save();
        res.json("successfully cart u r product")
    } catch (error) {
        console.log('Error adding to cart:', error);
    }
};
const cartQuantityUpdate = async (req, res) => {
    try {
        const cartId = req.params.itemId;
        const data = Number(req.body.quantity);
        const user = req.session.email;
        const userDetails = await UserModel.findOne({ email: user });

        const cartItems = userDetails.cart.items;
        // const CartProductIds = cartItems.map((items) => items.productId);

        const cartItem = userDetails.cart.items.id(cartId);
        const cartQuantityPre = cartItem.quantity;
        const CartQuantity = cartItem.quantity = data;
        const product = await ProductModel.findById(cartItem.productId);
        const ProQuantity = +product.quantity;

        const count = CartQuantity - cartQuantityPre;
        product.quantity -= count;
        const cartPrice = cartItem.price = product.finalPrice * CartQuantity;
        cartItem.realPrice = product.price * CartQuantity;
        await product.save();
        await userDetails.save();

        let grantTotal = cartItems.reduce((total, item) => total + item.realPrice, 0);
        const total = cartItems.reduce((total, item) => total + item.price, 0);

        const discount = grantTotal - total;

        res.json({ cartPrice, grantTotal, total, discount, ProQuantity });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred while updating the quantity.' });
    }
};
const cartDelete = async (req, res) => {
    try {
        const id = req.params.id;
        const userEmail = req.session.email;
        await UserModel.updateOne({ email: userEmail }, { $pull: { 'cart.items': { _id: id } } });
        res.redirect('/cart');
    } catch (error) {
        console.log(error);
        res.status(500).send("internal error at cartDelete")
    }
}

// Coupon
const coupons = async (req, res) => {
    try {
        const couponCode = req.body.coupon;
        const TotalAmount = req.body.amount;
        const user = req.session.email;
        const userDetails = await UserModel.findOne({ email: user });
        const userDataId = userDetails._id;
        const couponValue = await couponModle.findOne({ couponName: couponCode });
        const date = new Date();
        const formattedDate = date.toLocaleDateString();
        const expiryDate = couponValue.expiryDate;

        if (!couponValue) {
            res.json({ message: 'Coupon Not Valid' });
        } else if (couponValue) {
            const userExist = couponValue.userId.includes(userDataId);
            if (!userExist) {
                if (TotalAmount <= couponValue.maxValue && TotalAmount >= couponValue.minValue) {
                    await couponModle.updateOne({ couponName: couponCode }, { $push: { userId: userDataId } });
                    res.json({ message: 'Coupon is succefully Added', coupon: couponValue });
                } else {
                    res.json({ message: 'Coupon Expired', coupon: couponValue });
                }
            } else {
                res.json({ message: 'You Already Use This Coupon', coupon: couponValue });
            }

        }
    } catch (error) {
        console.log(error);
        res.json('CouponExpired');
    }
}

// Check out 
const Checkout = async (req, res) => {
    try {
        const user = req.session.user;
        const userFinder = req.session.email;
        const userDetails = await UserModel.findOne({ email: userFinder });
        const currentUserID = userDetails._id;
        const cartItems = userDetails.cart.items;
        const cartCount = cartItems.length;
        const coupons = await couponModle.find();
        const coupon = coupons.filter(coupon => !coupon.userId.includes(currentUserID));
        const cartProductIds = cartItems.map(item => item.productId.toString());
        const cartProducts = await ProductModel.find({ _id: { $in: cartProductIds } });
        const totalP_Price = cartItems.reduce((total, items) => total + parseFloat(items.realPrice), 0);
        const address = userDetails.address;
        let totalPrice = 0;
        cartItems.map(item => totalPrice += item.price);

        const discount = Math.abs(totalP_Price - totalPrice)
        res.render('user/account/billing', {
            title: "Check Out",
            user,
            cartItems,
            cartProducts,
            discount,
            totalP_Price,
            totalPrice,
            address,
            cartCount,
            coupon
        })
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
        res.redirect('/CheckOutPage');
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error");
    }
};

// dta storing for saving data in db after online payment easy access!!!!!!
let newOrder;
const orderSuccess = async (req, res) => {
    try {
        const currentDate = new Date();
        const data = req.body
        const email = req.session.email;
        const foundUser = await UserModel.findOne({ email: email });
        const cartItems = foundUser.cart.items;
        const cartProductIds = cartItems.map(item => item.productId.toString());
        const cartProducts = await ProductModel.find({ _id: { $in: cartProductIds } });

        const userId = foundUser._id;
        const addressId = data.selectedAddress;
        const method = data.method;
        const amount = data.amount;
        console.log(amount)
        // Data collecting for db Storing
        const productData = cartProducts.map(product => ({
            p_name: product.p_name,
            realPrice: product.price,
            price: amount,
            description: product.description,
            image: product.image,
            category: product.category,
            quantity: product.quantity
        }));
        const deliveryDate = new Date();
        deliveryDate.setDate(currentDate.getDate() + 5);
        newOrder = new OrderModel({
            userId: userId,
            address: addressId,
            products: productData,
            payment: {
                method: method,
                amount: amount
            },
            status: "Processing",
            proCartDetail: cartProducts,
            cartProduct: cartItems,
            createdAt: currentDate,
            expectedDelivery: deliveryDate
        });
        if (method === "InternetBanking") {
            const instance = new Razorpay({
                key_id: key_id,
                key_secret: key_secret
            });
            let order = await instance.orders.create({
                amount: amount * 100,
                currency: "INR",
                receipt: 'new id u want to impliment',
            })
            res.json(order);
        } else if (method === "COD") {
            await newOrder.save();
            for (let values of cartItems) {
                for (let products of cartProducts) {
                    if (new String(values.productId).trim() == new String(products._id).trim()) {
                        products.quantity = products.quantity - values.quantity;
                        await products.save()
                    }
                }
            }
            foundUser.cart.items = [];
            await foundUser.save();
            res.json("successFully cod Completed")
        } else {
            res.status(400).send("individual payment")
        }

    } catch (error) {
        console.log('data not comming');
        res.status(500).send('An error occurred While saving data in DB');
    }
}
const savingData = async (req, res) => {
    try {
        await newOrder.save();
        const email = req.session.email;
        const userData = await UserModel.findOne({ email: email });
        const cartItems = userData.cart.items;
        const cartProductIds = cartItems.map(item => item.productId.toString());
        const cartProducts = await ProductModel.find({ _id: { $in: cartProductIds } });

        for (let values of cartItems) {
            for (let product of cartProducts) {
                if (String(values.productId).trim() === String(product._id).trim()) {
                    product.quantity -= values.quantity;
                    await product.save();
                }
            }
        }

        userData.cart.items = [];
        await userData.save();
        res.json("data is saved")
    } catch (error) {
        console.log(error);
        res.status(500).send('An error occurred while saving the order and updating product quantities');
    }
};

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
    Search,
    ShopView,
    sorting,
    detaildView,
    Checkout,
    cartload,
    productFilter,
    cart,
    cartDelete,
    addressAdding,
    orderSuccess,
    savingData,
    cartQuantityUpdate,
    coupons,
    WhishListLoad,
    WhishProductDelete,
    addingWhishList,
    addingWhishListtoCart,
    OTPValidationSignIn,
    orderSearch,
    forGotPassword,
    numberValidation,
    resetPassword,
    newPassword
}