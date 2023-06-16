const admin = require('../models/admin');
const UsersModel = require('../models/user');
const CategoryModel = require('../models/category');
const productModel = require('../models/productModel');
const couponModel = require('../models/coupon');
const orderModel =require('../models/order');
const fs = require('fs');


// ADMIN CONTROLLER

// ADMIN lOGIN
const adminLogin = (req, res) => {
    const user = req.session.user;
    res.render('admin/adminLogin', { title: "Admin", user })
}
const adminVerification = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const adminData = await admin.findOne({ email: email });
        if (adminData) {
            const adminpassword = adminData.password
            if (adminpassword === password) {
                req.session.admin = adminData.name;
                res.redirect('/admin/Dashboard')
            } else {
                res.render("admin/adminLogin", { fail: "Ckeck Your Password" })
            }
        } else {
            res.render('admin/adminLogin', { fail: "Check Your Email" })
        }
    }
    catch (error) {
        console.log(error)
    }
}

// Dashboard
const dashboard = (req, res) => {
    res.render('admin/dashboard', { title: "Dashboard", admin: req.session.admin })
}

// Users
const userView = async (req, res) => {
    try {
        const userData = await UsersModel.find();
        res.render('admin/userView', { title: "User", admin: req.session.admin, userData })
    } catch (error) {
        console.log(error);
        res.status(500).send("internal error")
    }
}
const userBlocking = async (req, res) => {
    try {
        const id = req.params.id;
        await UsersModel.findByIdAndUpdate({ _id: id },
            {
                $set: {
                    isBlocked: true
                }
            })
        res.redirect("/admin/coustomers");
    } catch (error) {
        console.log(error);
        res.status(500).send("internal error")
    }
}
const userUnBlocking = async (req, res) => {
    try {
        const id = req.params.id;
        await UsersModel.findByIdAndUpdate({ _id: id },
            {
                $set: {
                    isBlocked: false
                }
            })
        res.redirect("/admin/coustomers");
    } catch (error) {
        console.log(error);
        res.status(500).send("internal error")
    }
}


// Category
const category = async (req, res) => {
    try {
        const CategoryData = await CategoryModel.find();
        res.render('admin/category', { title: "Category", admin: req.session.admin, CategoryData });
    } catch (error) {
        console.log(error);
        res.status(500).send("internal error");
    }
}
const categoryAdd = (req, res) => {
    res.render('admin/categoryAdd', { title: "Category", admin: req.session.admin })
}
const CategoryAdding = async (req, res) => {
    try {
        const catData = req.body;
        // Saving Data to teh DataBAse
        await CategoryModel.create(catData);

        res.render('admin/categoryAdd', { Succ: "Successfully Added....", admin: req.session.admin, title: "Category" })
    } catch (error) {
        console.log(error)
        res.status(500).render('admin/categoryAdd', { Succ: "Category must be uniqe", title: "Category" })
    }
}
const unlistCategory = async (req, res) => {
    try {
        const id = req.params.id
        await CategoryModel.findByIdAndUpdate({ _id: id }, {
            $set: {
                isAvailable: false
            }
        })
        res.redirect('/admin/category')
    } catch (error) {
        res.status(500).send("internal error")
    }
}
const listCategory = async (req, res) => {
    try {
        const id = req.params.id
        await CategoryModel.findByIdAndUpdate({ _id: id }, {
            $set: {
                isAvailable: true
            }
        })
        res.redirect('/admin/category')
    } catch (error) {
        res.status(500).send("internal error")
    }
}
const Categoryupdate = async (req, res) => {
    try {
        const id = req.params.id;
        const CategoryData = await CategoryModel.findById({ _id: id })
        res.render('admin/categoryUpdate', { title: "Category", admin: req.session.admin, CategoryData });
    } catch (error) {
        console.log(error)
        res.status(500).send("internal error")
    }
}
const updateCategory = async (req, res) => {
    try {
        await CategoryModel.findByIdAndUpdate(
            { _id: req.body.id },
            {
                $set: {
                    categoryName: req.body.categoryName,
                    categoryDiscription: req.body.categoryDiscription,
                    offerValue: req.body.offerValue,
                    maxValue: req.body.maxValue,
                    minValue: req.body.minValue
                }
            })
        res.redirect("/admin/category")

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal error")
    }
}


// product
const productView = async (req, res) => {
    try {
        const product = await productModel.find();
        res.render('admin/productView', { title: "Product", admin: req.session.admin, product })
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal error");
    }
}
const productAdding = async (req, res) => {
    try {
        const category = await CategoryModel.find({ isAvailable: true });
        res.render('admin/productAdding', { title: "Product", admin: req.session.admin, category })
    } catch (error) {
        console.log(error);
        res.status(500).send("internal error")
    }
}
const newproductAdding = async (req, res) => {
    try {
        const { p_name, category, price, offerPrice, quantity, description } = req.body;
        const files = req.files;
        // Create a new product object with the form data
        const product = new productModel({
            p_name,
            category,
            price,
            offerPrice,
            quantity,
            description,
            image: files.map(file => file.filename)
        });
        // Save the product to the database
        await product.save();

        res.redirect('/admin/newProduct');
    } catch (error) {
        // Handle any errors that occurred during the process
        console.error(error);
        res.redirect('/admin/newProduct'); // Redirect to an appropriate error page or display an error message
    }
}
const p_deleting = async (req, res) => {

    try {
        const id = req.params.id;
        // Retrieve existing product data
        const existingProduct = await productModel.findById(id);
        const existingImages = existingProduct.image;

        // Delete previous images from fs
        existingImages.forEach((filename) => {
            fs.unlink(`productImages/${filename}`, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        });
        await productModel.findByIdAndDelete({ _id: id })
        res.redirect('/admin/productView');
    } catch (error) {
        console.log(error);
        res.status(500).send("internal error");
    }
}
const productUpdating = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await productModel.findById({ _id: id });
        res.render('admin/productUpdate', { title: "Product", admin: req.session.admin, product })
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal error")
    }
}
const addUpdateProduct = async (req, res) => {
    try {
        const id = req.body.id;
        // Retrieve existing product data
        const existingProduct = await productModel.findById(id);
        const existingImages = existingProduct.image;

        // Delete previous images from fs
        existingImages.forEach((filename) => {
            fs.unlink(`productImages/${filename}`, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        });
        const updatedData = {
            p_name: req.body.p_name,
            price: req.body.price,
            description: req.body.description,
            category: req.body.category,
            quantity: req.body.quantity,
        }
        if (req.files && req.files.length > 0) {
            const images = req.files.map((file) => file.filename)
            updatedData.image = images
        }
        await productModel.findByIdAndUpdate(id, updatedData)
        res.redirect('/admin/productView');
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal error")
    }
}

// Order LIsting 

const orderList = async (req, res) => {
    try {
        const admin = req.session.admin;
        const orderList = await orderModel.find();
        const user  = orderList.map(item => item.userId);
        const userData = await UsersModel.find({_id:{$in:user}});
        const ordersWithData = orderList.map(order => {
            const user = userData.find(user => user._id.toString() === order.userId.toString());
            return {
                ...order.toObject(),
                user: user
            };
        });
        res.render('admin/orderlisting', { admin, orderList:ordersWithData})

    } catch (error) {
        console.log(error)
    }
}



const orderstatus = async (req,res)=>{
  try{
    const orderId = req.params.id;
    const status =req.body.status;
    await orderModel.findByIdAndUpdate({_id:orderId},{
        $set:{
            status:status
        }
    })
    res.json("reache the msg")
  }catch(error){
     console.log("error in the orderstatus updation");
     res.json("error in the orderstatus updation");
  }
}

// Coupons Adding 
const couponsList = async (req, res) => {
    try {
        const admin = req.session.admin;
        const couponData = await couponModel.find();
        res.render('admin/couponListing', { admin,couponData })

    } catch (error) {
        console.log(error);
        res.status(500).send("couponRendering Error");
    }
}

const couponsAdding = async (req, res) => {
    try {
        const admin = req.session.admin;
        res.render('admin/coupon', { admin});
    } catch (error) {
        console.log("couponAddingPage Rendering Error");
        res.status(500).send("couponAddingPage Rendering Error");
    }
}

const couponsRemove =async(req,res)=>{
    try{
        const couponId = req.params.id;
        await couponModel.findByIdAndDelete(couponId)
        res.json("successfully removed");
    }catch(error){
       res.status(500).json("error by the server side");
    }
}

const couponCreation = async (req, res) => {
    try {
        const data = req.body;
        const couponDetails = new couponModel({
            couponName: data.couponName,
            couponValue: data.couponValue,
            expiryDate: data.expiryDate,
            maxValue: data.maxValue,
            minValue: data.minValue
        })
        await couponDetails.save();
        res.render('admin/coupon',{suMessage:"Coupon Successfully Added", admin:req.session.admin});
    } catch (error) {
        res.status(500).render('admin/coupon',{message:"Coupon Already Existing....", admin:req.session.admin});
    }
}

// LogOut
const adminLogout = async (req, res) => {
    try {
        req.session.admin = null;
        res.render('admin/adminLogin', { title: "Admin Login", admin: req.session.admin })
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    adminLogin,
    dashboard,
    productView,
    productAdding,
    productUpdating,
    userView,
    adminVerification,
    category,
    categoryAdd,
    CategoryAdding,
    unlistCategory,
    listCategory,
    Categoryupdate,
    updateCategory,
    newproductAdding,
    p_deleting,
    addUpdateProduct,
    userBlocking,
    userUnBlocking,
    adminLogout,
    orderList,
    couponsList,
    couponsAdding,
    couponCreation,
    couponsRemove,
    orderstatus
}