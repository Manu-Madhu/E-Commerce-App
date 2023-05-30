const user = require('../models/user');
const OTP = require('../models/otpModel');
const ProductModel = require('../models/productModel');
const bcrypt = require('bcrypt');
const { category } = require('./adminControllers');
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
        res.render('user/Home', {log:"LogOut", title: "Home", user: req.session.user, data })
    } catch (error) {
        console.log(error);
        res.status(500).send("internal error")
    }
}

// LOGIN VALIDATION
const login = (req, res) => {
    res.render('user/login', { title: 'Login' })
}
const validation = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await user.findOne({ email: email });
        if (userData.isBlocked === false) {
            if (userData) {
                const VPWD = await bcrypt.compare(password, userData.password);
                if (VPWD) {
                    req.session.user = userData.name;
                    req.session.email = userData.email;
                    res.redirect('/')
                } else {
                    res.render("user/login", { fail: "Ckeck Your Password" })
                }

            } else {
                res.render('user/login', { fail: "Check Your Email" })
            }
        } else {
            res.render('user/login', { fail: "Pease Contact Your Admin You are not Allow to Use this Account AnyMore" })
        }


    } catch (error) {
        console.log(error)
    }
}





// REGISTRATION
const signup = (req, res) => {
    res.render('user/signUp', { title: "Sign Up" })
}
const registerUser = async (req, res) => {
    try {
        const enPwd = await pwdEncription(req.body.password);
        req.body.password = enPwd;
        req.body.isBlocked = false;
        // USER INFO SAVING TO DB
        await user.create(req.body)

        // OTP CODE
        const number = req.body.number
        // generat randome 4 digit number
        let randome = Math.floor(Math.random() * 9000) + 1000;

        // send random number to user
        client.messages
            .create({ body: randome, from: '+12542726949', to: number })
            .then(saveUser());

        //save randome Number to database then render verify page
        function saveUser() {
            const newUser = new OTP({
                number: randome
            })
            newUser.save()
                .then(() => {
                    res.render('user/verification');
                })
                .catch((error) => {
                    console.log("error generating numb", error);
                });
        }
    }
    catch (error) {
        console.log(error)
        res.render('user/signUp', { succ: "Please Use a Uniqe Email ID" })
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
                    res.render('user/verification', { fal: "Please Check Your OTP" })
                }
            })
            .catch((err) => {
                res.render('user/verification', { fal: "Please Check Your OTP" })
            })
    } catch (error) {
        console.log(error)
        res.status(500).send("Otp error")
    }
}

// Success
const successTick = (req, res) => {
    res.render('user/successTick', { title: "Account", succ: "SuccessFully Create Your Account" })
}

// Detaild view
const detaildView = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await ProductModel.findOne({ _id: id });
        const cate = data.category[0];
        const category = await ProductModel.find({category:cate});
        res.render('user/productView', { title: "Product View", user: req.session.user, data,category })
    } catch (error) {
        console.log(error)
    }
}

// LOGOUT
const logOut = async (req, res) => {
    try {
        req.session.user = null;
        req.session.email = null;
        const data = await ProductModel.find();
        res.render('user/Home', { title: "Home", data })
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
    detaildView
}