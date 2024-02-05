const { render } = require("ejs");
const product = require("../models/productmodel");
const category = require("../models/catogerymodel");
const user = require("../models/usermodel");
const cart = require("../models/cartModel");
const address = require("../models/addressModel");
const order = require("../models/orderModel");
const coupons = require("../models/couponModel");

const loadCoupens = async (req, res) => {
  try {
    const coupon= await coupons.find({});
    console.log(coupon);
    res.render("admin/coupons", { lay: false ,coupon});
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const loadAddCoupens = async (req, res) => {
  try {
    res.render("admin/addCoupons", { lay: false });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addCoupens = async (req, res) => {
  try {
    console.log("working");
    const coponsName = req.body.cpName;
    const coponsCode = req.body.cpCode;
    const disAmount = req.body.cpDisAmount;
    const criteriaAmount = req.body.cpCriAmount;
    const activationDate = req.body.cpActiveDate;
    const expiryDate = req.body.cpExpiryDate;
    const userLimit = req.body.cpLimit;
    const Today = new Date().toISOString().split("T")[0];
    const active = new Date(activationDate);
    // cheking the name and code already exist or not
    const regexName = new RegExp(coponsName, "i");
    const already = await coupons.findOne({ couponName: regexName });
    const regexCode = new RegExp(coponsCode, "i");
    const codeAlready = await coupons.findOne({ couponCode:regexCode });
    if (
      coponsName.trim() === "" &&
      coponsCode.trim() === "" &&
      disAmount.trim() === "" &&
      criteriaAmount.trim() === "" &&
      activationDate.trim() === "" &&
      expiryDate.trim() === "" &&
      userLimit.trim() === ""
    ) {
      return res.json({
        success: false,
        message: "please fill all fields",
      });
    } else if (already) {
      return res.json({
        success: false,
        message: "this name already exist",
      });
    } else if (codeAlready) {
      return res.json({
        success: false,
        message: "this code already exist please try another one ",
      });
    } else if (criteriaAmount <= 0) {
      return res.json({
        success: false,
        message: "please give a valid number for amount",
      });
    } else if (disAmount <= 0) {
      return res.json({
        success: false,
        message: "please give a valid number for discount amount",
      });
    } else if (userLimit <= 0) {
      return res.json({
        success: false,
        message: "please give a valid number for user limit",
      });
    } else if (expiryDate < Today) {
      return res.json({
        success: false,
        message: "please increase your expire date",
      });
    } else if (activationDate < Today) {
      return res.json({
        success: false,
        message: "please increase your activation  date",
      });
    } else {
      const data = new coupons({
        couponName: coponsName,
        couponCode: coponsCode,
        discountAmount: disAmount,
        activationDate: activationDate,
        expiryDate: expiryDate,
        criteriaAmount: criteriaAmount,
        usersLimit: userLimit,
      });
      await data.save();
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const loadEditCoupon = async (req, res) => {
  try {
    
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const editCoupon = async (req, res) => {
  try {
    res.render("admin/addCoupons", { lay: false });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const blockCoupon = async (req, res) => {
  try {
    console.log('working');
    const id = req.body._id;
    const coupen = await coupons.findOne({ _id: id });
    if (coupen.status == true) {
      await coupons.updateOne(
        { _id: id },
        { $set: { status: false } }
      );
      return res.json({
        blocked: true,
        success: true,
        btntext: "unblock",
        btncolor: "green",
      });
    } else {
      console.log('workig');
      await coupons.updateOne({ _id: id }, { $set: { status: true } });
      return res.json({
        blocked: true,
        success: true,
        btntext: "block",
        btncolor: "red",
      });
    }
    
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  loadCoupens,
  loadAddCoupens,
  addCoupens,
  loadEditCoupon,
  editCoupon,
  blockCoupon
};
