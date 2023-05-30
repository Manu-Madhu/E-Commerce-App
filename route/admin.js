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
admin.get('/',adminController.adminLogin);
admin.post('/', adminController.adminVerification)
admin.get('/Dashboard', adminMiddleWeare.isLogOut, adminController.dashboard);

// category
admin.get("/category", adminController.category);
admin.post("/addCategory", adminController.CategoryAdding);

admin.get("/addCategory", adminController.categoryAdd);
admin.post("/deleteCategory/:id", adminController.deleteCategory);

admin.get("/updateCategory/:id", adminMiddleWeare.isLogOut, adminController.Categoryupdate);
admin.post("/updateCategory", adminController.updateCategory);

// product
admin.get('/productView', adminController.productView);
admin.get('/newProduct', adminMiddleWeare.isLogOut,adminController.productAdding);
admin.post('/p_adding', upload.array("image"), adminController.newproductAdding);
admin.post("/p_delete/:id", adminController.p_deleting)

admin.get('/updateProduct/:id', adminController.productUpdating);
admin.post('/addUpdatedProducts', upload.array("image"), adminController.addUpdateProduct);

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