var express = require("express");
const adminRouter = express.Router();
const admincontroller = require("../controllers/admincontrollers");
const productcontroller = require("../controllers/productcontrollers");
const orderContoller = require("../controllers/orderControllers");
const couponsController = require("../controllers/couponsControllers");
const offerController = require("../controllers/offerControllers");
const bannerController = require("../controllers/bannerControllers");
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

//=================================orders=====================================================
adminRouter.post("/statusUpdate", isAuth.isLogin, orderContoller.statusUpdate);
adminRouter.get("/orders", isAuth.isLogin, admincontroller.loadOrder);
adminRouter.get("/viewOrders", isAuth.isLogin, admincontroller.viewOrder);

//=================================coupons=====================================================
adminRouter.get("/coupons", isAuth.isLogin, couponsController.loadCoupens);
adminRouter.get(
  "/add-coupons",
  isAuth.isLogin,
  couponsController.loadAddCoupens
);
adminRouter.post("/add-coupons", isAuth.isLogin, couponsController.addCoupens);
adminRouter.post(
  "/block-coupons",
  isAuth.isLogin,
  couponsController.blockCoupon
);
adminRouter.get(
  "/edit-coupons",
  isAuth.isLogin,
  couponsController.loadEditCoupon
);
adminRouter.post("/edit-coupons", isAuth.isLogin, couponsController.editCoupon);
//=================================Offers=====================================================
adminRouter.get("/offers", isAuth.isLogin, offerController.loadOffers);
adminRouter.get("/addoffers", isAuth.isLogin, offerController.loadAddOffers);
adminRouter.post("/addoffers", isAuth.isLogin, offerController.addOffers);
adminRouter.post("/blockOffers", isAuth.isLogin, offerController.blockOffer);
adminRouter.get("/editOffer", isAuth.isLogin, offerController.loadEditOffer);
adminRouter.post("/editOffer", isAuth.isLogin, offerController.editOffer);
adminRouter.get(
  "/product-Offer",
  isAuth.isLogin,
  offerController.loadProductOffers
);
adminRouter.post(
  "/product-Offer",
  isAuth.isLogin,
  offerController.addProductOffers
);
adminRouter.post(
  "/remove-Offer",
  isAuth.isLogin,
  offerController.removeProductOffer
);
adminRouter.post(
  "/categery-Offer",
  isAuth.isLogin,
  offerController.addCategeryOffers
);
adminRouter.post(
  "/rm-categery-Offer",
  isAuth.isLogin,
  offerController.removeCategeryOffers
);
//=================================banner=====================================================
adminRouter.get("/banner", isAuth.isLogin, bannerController.loadBanner);
adminRouter.post("/blockBanner", isAuth.isLogin, bannerController.blockBanner);
adminRouter.get(
  "/edit-banner",
  isAuth.isLogin,
  bannerController.loadEditBanner
);
adminRouter.post(
  "/edit-banner",
  multer.bannerUpload.single("image"),
  bannerController.editBanner
);
//=================================sales report=====================================================
adminRouter.get("/sales-sort", isAuth.isLogin, admincontroller.salesSort);
adminRouter.get(
  "/sales-download",
  isAuth.isLogin,
  admincontroller.downloadReport
);
//=================================dashboard=====================================================
adminRouter.get(
  "/weeklySalesDataEndpoint",
  isAuth.isLogin,
  admincontroller.weeklySalesDataEndpoint
);
adminRouter.get("/chartWeek", isAuth.isLogin, admincontroller.chartFilterWeek);
adminRouter.get(
  "/chartMonth",
  isAuth.isLogin,
  admincontroller.chartFilterMonth
);
adminRouter.get("/chartYear", isAuth.isLogin, admincontroller.chartFilterYear);

module.exports = adminRouter;
