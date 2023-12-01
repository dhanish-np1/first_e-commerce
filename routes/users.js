var express = require("express");
var userRouter = express.Router();
const usercontroller = require("../controllers/usercontrollers");
const auth = require("../middlewares/userAuth");

const productcontroller = require("../controllers/productcontrollers");


userRouter.get("/",auth.isLogout, usercontroller.loadhome);
userRouter.get("/home", auth.isLogin,usercontroller.loadhome);
userRouter.get("/sign-up", auth.isLogout,usercontroller.loadsign_up);
userRouter.get("/login",auth.isLogout, usercontroller.loadLogin);
userRouter.post("/sign-up",auth.isLogout, usercontroller.insertuser);
userRouter.get("/otp",auth.isLogout, usercontroller.loadvarify);
userRouter.post("/login",auth.isLogout, usercontroller.login);
userRouter.post("/varify",auth.isLogout, usercontroller.otpvarify);
userRouter.get("/shop", usercontroller.loadshop);
userRouter.get("/product-detail", productcontroller.loadProductdetails);
userRouter.get("/logout",auth.isLogin, usercontroller.userLogout);
userRouter.post("/resendotp", usercontroller.resendOtp);


module.exports = userRouter;
