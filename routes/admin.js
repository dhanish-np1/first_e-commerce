var express = require("express");
const adminRouter = express.Router();
const admincontroller = require("../controllers/admincontrollers");
const productcontroller = require("../controllers/productcontrollers");
const orderContoller =require("../controllers/orderControllers");
const multer = require("../middlewares/multer");
const isAuth = require("../middlewares/adminAuth");

//==================================login/logout================================================
adminRouter.post("/adminlogin", isAuth.isLogout, admincontroller.adminLogin);
adminRouter.get("/logout", isAuth.isLogin, admincontroller.adminLogout);
//==================================load pages==================================================
adminRouter.get("/", isAuth.isLogout, admincontroller.loadAdmin);
adminRouter.get("/dashboard", isAuth.isLogin, admincontroller.loadDashBoard);
//=================================users========================================================
adminRouter.get("/users", isAuth.isLogin, admincontroller.loadUsers);
adminRouter.post("/blockuser", isAuth.isLogin, admincontroller.blockUser);
//=================================products=====================================================
adminRouter.get(
  "/addproducts",
  isAuth.isLogin,
  productcontroller.loadAddProduct
);
adminRouter.get("/products", isAuth.isLogin, productcontroller.loadProducts);
adminRouter.post(
  "/addproducts",
  multer.productImagesUpload,
  productcontroller.addProduct
);
adminRouter.post("/blockproduct", productcontroller.blockProduct);
adminRouter.get(
  "/loadeditproduct",
  isAuth.isLogin,
  productcontroller.loadEditProduct
);
adminRouter.post(
  "/editproduct",
  isAuth.isLogin,
  multer.productImagesUpload,
  productcontroller.editProduct
);
//=================================catogery=====================================================
adminRouter.get("/catogery", isAuth.isLogin, admincontroller.loadCatogery);
adminRouter.post("/addcategory", admincontroller.addCategory);
adminRouter.post("/blockcat", admincontroller.blockCat);
adminRouter.post("/editcat", admincontroller.editCat);


adminRouter.get("/orders", isAuth.isLogin, orderContoller.loadOrder);

module.exports = adminRouter;
