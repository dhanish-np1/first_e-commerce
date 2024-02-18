var express = require("express");
var userRouter = express.Router();
const usercontroller = require("../controllers/usercontrollers");
const auth = require("../middlewares/userAuth");
const productcontroller = require("../controllers/productcontrollers");
const profileController = require("../controllers/profileControllers");
const cartController = require("../controllers/cartControllers");
const orderController = require("../controllers/orderControllers");
//==================================login/logout/sign-up======================================
userRouter.get("/sign-up", auth.isLogout, usercontroller.loadSign_up);
userRouter.get("/login", auth.isLogout, usercontroller.loadLogin);
userRouter.post("/sign-up", auth.isLogout, usercontroller.insertUser);
userRouter.post("/login", auth.isLogout, usercontroller.login);
userRouter.get("/logout", auth.isLogin, usercontroller.userLogout);
//==================================forgot password======================================
userRouter.get("/forgot-password",auth.isLogout, usercontroller.loadForgotPassword);
userRouter.post("/forgot-password",auth.isLogout, usercontroller.forgotPassword);
userRouter.get("/forgot-password-otp",auth.isLogout, usercontroller.loadOtpForgot);
userRouter.post("/resendForgototp",auth.isLogout, usercontroller.resendForgotOtp);
userRouter.post("/varifyForgototp",auth.isLogout, usercontroller.varifyForgotOtp);
userRouter.get("/resetPassword",auth.isLogout, usercontroller.loadResetPassword);
userRouter.post("/resetPassword",auth.isLogout, usercontroller.ResetPassword);
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
userRouter.post("/user-details", auth.isLogin, profileController.editDetails);
userRouter.get("/coupons", auth.isLogin, profileController.loadCoupons);
userRouter.get("/wallet", auth.isLogin, profileController.loadWallet);
//==================================Change password====================================================
userRouter.get(
  "/changePassword",
  auth.isLogin,
  profileController.loadChangePassword
);
userRouter.post("/changePassword", auth.isLogin, profileController.ChangePassword);
//==================================Add Address====================================================
userRouter.get("/add-address", auth.isLogin, profileController.loadAddress);
userRouter.get(
  "/load-add-address",
  auth.isLogin,
  profileController.loadAddAddress
);
userRouter.post("/add-address", auth.isLogin, profileController.addAddress);
userRouter.post("/remove-address", auth.isLogin, profileController.removeAddress);
//==================================cart====================================================
userRouter.get("/cart", auth.isLogin, cartController.loadCart);
userRouter.post("/addToCart", cartController.addToCart);
userRouter.post("/remove-product", auth.isLogin, cartController.removeCart);
userRouter.post(
  "/quantity-update",
  auth.isLogin,
  cartController.quantityUpdate
);

//==================================Chekout====================================================
userRouter.get("/chekout", auth.isLogin, orderController.loadProceedCheckout);
userRouter.post("/chekout", auth.isLogin, orderController.proceedCheckout);

//==================================order====================================================
userRouter.post("/placeOrder",auth.isLogin,orderController.placeOrder)
userRouter.get("/orderSuccess",auth.isLogin,orderController.loadSuccess)
userRouter.get("/orders",auth.isLogin,profileController.loadOrders)
userRouter.post("/cancelOrders",auth.isLogin,orderController.cancelOrder)





module.exports = userRouter;
