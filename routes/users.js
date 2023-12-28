var express = require("express");
var userRouter = express.Router();
const usercontroller = require("../controllers/usercontrollers");
const auth = require("../middlewares/userAuth");
const productcontroller = require("../controllers/productcontrollers");
const profileController = require("../controllers/profileControllers");
const cartController = require("../controllers/cartControllers");
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

//==================================user profile====================================================

userRouter.get("/profile", auth.isLogin, profileController.loadProfile);
userRouter.get(
  "/user-details",
  auth.isLogin,
  profileController.loadUserDetailes
);
userRouter.post(
  "/user-details",
  auth.isLogin,
  profileController.editDetails
);
//==================================Change password====================================================
userRouter.get(
  "/changePassword",
  auth.isLogin,
  profileController.loadChangePassword
);
userRouter.post(
  "/changePassword",
  auth.isLogin,
  profileController.editDetails
);
//==================================Add Address====================================================
userRouter.get('/add-address',auth.isLogin,profileController.loadAddress)
userRouter.get('/load-add-address',auth.isLogin,profileController.loadAddAddress)
userRouter.post('/add-address',auth.isLogin,profileController.addAddress)
//==================================cart====================================================
userRouter.get("/cart", auth.isLogin, cartController.loadCart);
userRouter.post("/addToCart", cartController.addToCart)
userRouter.post("/remove-product",auth.isLogin, cartController.removeCart)

module.exports = userRouter;
