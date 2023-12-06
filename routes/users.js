var express = require("express");
var userRouter = express.Router();
const usercontroller = require("../controllers/usercontrollers");
const auth = require("../middlewares/userAuth");
const productcontroller = require("../controllers/productcontrollers");

//==================================login/logout/sign-up======================================
userRouter.get("/sign-up", auth.isLogout, usercontroller.loadSign_up);
userRouter.get("/login", auth.isLogout, usercontroller.loadLogin);
userRouter.post("/sign-up", auth.isLogout, usercontroller.insertUser);
userRouter.post("/login", auth.isLogout, usercontroller.login);
userRouter.get("/logout", auth.isLogin, usercontroller.userLogout);
//==================================load pages================================================
userRouter.get("/home", auth.isLogin, usercontroller.loadHome);
userRouter.get("/", auth.isLogout, usercontroller.loadHome);
userRouter.get("/shop", usercontroller.loadShop);
userRouter.get("/product-detail", productcontroller.loadProductDetails);
//==================================otp=======================================================
userRouter.get("/otp", auth.isLogout, usercontroller.loadVarify);
userRouter.post("/varify", auth.isLogout, usercontroller.otpVarify);
userRouter.post("/resendotp", usercontroller.resendOtp);

module.exports = userRouter;
