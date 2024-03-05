const { render } = require("ejs");
const coupons = require("../models/couponModel");

// ========================LOAD COUPON PAGE====================================================
const loadCoupens = async (req, res) => {
  try {
    const coupon = await coupons.find({});
    console.log(coupon);
    res.render("admin/coupons", { lay: false, coupon });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
// ===================== LOAD ADD COUPON PAGE=======================================================
const loadAddCoupens = async (req, res) => {
  try {
    res.render("admin/addCoupons", { lay: false });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
// ====================ADD COUPON========================================================

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
    const codeAlready = await coupons.findOne({ couponCode: regexCode });
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

// ======================= LOAD EDIT COUPON=====================================================
const loadEditCoupon = async (req, res) => {
  try {
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
// ============================EDIT COUPON================================================

const editCoupon = async (req, res) => {
  try {
    res.render("admin/addCoupons", { lay: false });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
// =========================BLOCK COUPON===================================================
const blockCoupon = async (req, res) => {
  try {
    console.log("working");
    const id = req.body._id;
    const coupen = await coupons.findOne({ _id: id });
    if (coupen.status == true) {
      await coupons.updateOne({ _id: id }, { $set: { status: false } });
      return res.json({
        blocked: true,
        success: true,
        btntext: "unblock",
        btncolor: "green",
      });
    } else {
      console.log("workig");
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
// ======================= APPLY COUPON=====================================================

const applyCoupon = async (req, res) => {
  try {
    console.log("working");
    const code = req.body.couponCode;
    console.log(code);

    if (code.trim() == "") {
      return res.json({
        success: false,
        message: "please enter the coupon code",
      });
    }
    const coupon = await coupons.findOne({ couponCode: code });
    console.log(coupon);
    if (!coupon) {
      return res.json({
        success: false,
        message: "this coupon not exist",
      });
    }
    if (coupon.status == false) {
      return res.json({
        success: false,
        message: "this coupon is not available",
      });
    }
    const usedCoupon = await coupons.findOne({
      couponCode: code,
      usedUsers: { $in: [req.session.user_id] },
    });
    if (usedCoupon) {
      return res.json({
        success: false,
        message: "this coupon already used",
      });
    }
    if (coupon.expiryDate <= new Date()) {
      return res.json({
        success: false,
        message: "this coupon is expired",
      });
    }
    if (coupon.criteriaAmount > req.body.amount) {
      return res.json({
        success: false,
        message: `minimum ${coupon.criteriaAmount}Rs needed for apply this coupon `,
      });
    }
    if (coupon.usersLimit <= coupon.usedUsers.length) {
      return res.json({
        success: false,
        message: `coupon expired `,
      });
    }
    req.session.code = code;
    req.session.couponAmount = coupon.discountAmount;
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
// ============================REMOVE COUPON================================================
const romveCoupon = async (req, res) => {
  try {
    req.session.code = false;
    req.session.couponAmount = false;
    res.json({ success: true });
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
  blockCoupon,
  applyCoupon,
  romveCoupon,
};
