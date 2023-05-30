const express = require('express');
const Router = express.Router();



// Routers
const userMiddlewear = require('../middleWeare/user');
const userControler = require('../controllers/userControllers');
Router.get('/login',userMiddlewear.isLogOut, userControler.login);
Router.post('/login', userControler.validation);

// Sign up
Router.get('/signUp',userMiddlewear.isLogOut,userControler.signup);
Router.post('/register', userControler.registerUser);
Router.post('/validation', userControler.OTPValidation);

// success
Router.get('/success',userControler.successTick);
Router.get('/',userMiddlewear.islogin,userMiddlewear.userIsBlocked, userControler.home);

// View Product detaild view
Router.get('/detaildView/:id',userMiddlewear.userIsBlocked, userControler.detaildView);

// Logout
Router.get('/logout', userControler.logOut);

module.exports = Router;