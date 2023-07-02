const express = require('express');
const admin = express.Router()
const multer = require('multer');


// MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'productImages'); // Destination folder for uploaded images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname); // Unique filename for each uploaded image
  }
});

const upload = multer({ storage: storage });


// ADMIN SIDE ROUTERS
const adminController = require('../controllers/adminControllers');
const adminMiddleWeare = require('../middleWeare/admin');

// Admin login&Dashboard
admin.get('/',adminMiddleWeare.isAdmin, adminController.adminLogin);
admin.post('/', adminController.adminVerification)
admin.get('/Dashboard', adminMiddleWeare.isLogOut, adminController.dashboard);
admin.post('/Dashboard/graph',adminController.graph);

// category
admin.get("/category", adminController.category);
admin.post("/addCategory", adminController.CategoryAdding);

admin.get("/addCategory", adminController.categoryAdd);
admin.post("/unlistCategory/:id", adminController.unlistCategory);
admin.post("/listCategory/:id", adminController.listCategory);

admin.get("/updateCategory/:id", adminMiddleWeare.isLogOut, adminController.Categoryupdate);
admin.post("/updateCategory", adminController.updateCategory);
admin.post('/Category_OfferValue', adminMiddleWeare.isLogOut,adminController.categoryOffer);

// product
admin.get('/productView', adminController.productView);
admin.get('/newProduct', adminMiddleWeare.isLogOut,adminController.productAdding);
admin.post('/p_adding', upload.array("image"), adminController.newproductAdding);
admin.post("/p_unlist/:id", adminController.p_unlist);
admin.post("/p_list/:id", adminController.p_list);

admin.get('/updateProduct/:id', adminController.productUpdating);
admin.get('/deleteProduct/:id', adminController.productDelete);
admin.post('/addUpdatedProducts', upload.array("image"), adminController.addUpdateProduct);

// Order 
admin.get('/order',adminController.orderList);
admin.put('/order/:id',adminController.orderstatus);
admin.post('/order/details',adminController.orderDetails);

// Coupons 
admin.get('/coupons',adminController.couponsList);
admin.get('/coupons/couponsAdding',adminController.couponsAdding);
admin.post('/coupons/couponsAdding',adminController.couponCreation);
admin.post('/coupons/couponsRemove/:id',adminController.couponsRemove);

// user 
admin.get('/coustomers', adminController.userView);
admin.post('/userBlocking/:id', adminController.userBlocking);
admin.post('/userUnBlocking/:id', adminController.userUnBlocking);

// logOut
admin.get('/logOut', adminController.adminLogout);

admin.get('*', function (req, res) {
  res.redirect('/admin')
})

module.exports = admin;