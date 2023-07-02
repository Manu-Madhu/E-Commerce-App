const express = require('express');
const Router = express.Router();

// Routers
const userMiddlewear = require('../middleWeare/user');
const userControler = require('../controllers/userControllers');
const profileController = require('../controllers/profileControllers');

Router.get('/login', userMiddlewear.isLogOut, userControler.login);
Router.post('/login', userControler.validation);
Router.get('/forGotPassword',userControler.forGotPassword);
Router.post('/numberValidation',userControler.numberValidation);
Router.post('/resetPassword',userControler.resetPassword);
Router.post('/newPassword',userControler.newPassword);

// Sign up
Router.get('/signUp', userMiddlewear.isLogOut, userControler.signup);
Router.post('/register', userControler.registerUser);
Router.post('/validation', userControler.OTPValidation); 
Router.post('/signIn', userControler.OTPValidationSignIn);
// success
Router.get('/success', userControler.successTick);
Router.get('/', userMiddlewear.islogin, userMiddlewear.userIsBlocked, userControler.home);

// View Product detaild view
Router.get('/detaildView/:id', userMiddlewear.userIsBlocked, userControler.detaildView);

// Search
Router.get('/search', userControler.Search);
Router.get('/orderSearch', userControler.orderSearch);

// Shop Page
Router.get('/Shop', userControler.ShopView);
Router.post('/productFilter', userControler.productFilter);
Router.post('/shopSort', userControler.sorting);

// profile 
Router.get('/profile', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, profileController.profile);
Router.get('/profile/order', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, profileController.order);
Router.get('/profile/orderView', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, profileController.orderView);
Router.get('/profile/invoice', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, profileController.pdf);
Router.post('/profile/orderStatus/:id', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, profileController.orderStatus);
Router.get('/profile/orderReturn', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, profileController.listReturn);
Router.post('/profile/orderReturn/:id', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, profileController.orderReturn);
Router.get('/profile/address', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, profileController.profileAddress);
Router.post('/profile/order/:id', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, profileController.orderCancel);
Router.post('/profile/address/editAddress', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, profileController.editAddress);
Router.post('/profile/address/updateAddress', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, profileController.newAddress);
Router.post('/profileUpdate', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, profileController.profileUpdate);

// Cart
Router.get('/cart', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, userControler.cartload);
Router.post('/cart/:id', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, userControler.cart);
Router.post('/cart/update/:id', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, userControler.cart);
Router.post('/cart/quantityUpdate/:itemId', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, userControler.cartQuantityUpdate);
Router.post('/cartDelete/:id', userControler.cartDelete);

// Coupons
Router.post('/coupons/couponValidation', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, userControler.coupons);

// WhishList
Router.get('/WhishList', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, userControler.WhishListLoad);
Router.get('/WhishList/:id', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, userControler.WhishProductDelete);
Router.post('/WhishList/:id', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, userControler.addingWhishList);
Router.post('/wishlist/cart', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, userControler.addingWhishListtoCart);

// CheckOut 
Router.get('/CheckOutPage', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, userControler.Checkout);
Router.post('/AddressUpdate', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, userControler.addressAdding);
Router.post('/CheckOut', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, userControler.orderSuccess);
Router.post('/saveOrderData', userMiddlewear.userCheking, userMiddlewear.userIsBlocked, userControler.savingData);

// Logout
Router.get('/logout', userControler.logOut);

module.exports = Router;