var express = require('express');
const adminRouter = express.Router();
const admincontroller=require("../controllers/admincontrollers")
const productcontroller=require("../controllers/productcontrollers")
const multer= require("../middlewares/multer")


adminRouter.get('/',admincontroller.loadadmin)
adminRouter.get('/products',productcontroller.loadproducts)
adminRouter.get('/catogery',admincontroller.loadcatogery)
adminRouter.get('/users',admincontroller.loadusers)
adminRouter.get('/dashboard',admincontroller.loaddashboard)
adminRouter.post('/adminlogin',admincontroller.adminlogin)
adminRouter.post('/addcategory',admincontroller.addcategory)
adminRouter.get('/blockcat',admincontroller.blockcat)
adminRouter.post('/editcat',admincontroller.editcat)
adminRouter.get('/addproducts',productcontroller.loadAddProduct)
adminRouter.post('/addproducts',multer.productImagesUpload,productcontroller.addProduct)
adminRouter.get('/blockuser',admincontroller.blockuser)







module.exports = adminRouter;

