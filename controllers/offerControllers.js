const { render } = require("ejs");
const mongoose = require("mongoose");
const product = require("../models/productmodel");
const category = require("../models/catogerymodel");
const user = require("../models/usermodel");
const cart = require("../models/cartModel");
const address = require("../models/addressModel");
const order = require("../models/orderModel");
const Offer = require("../models/offerModel");

const loadOffers = async (req, res) => {
  try {
    const offers = await Offer.find();
    res.render("admin/offers", { lay: false, offers });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const loadAddOffers = async (req, res) => {
  try {
    res.render("admin/addOffer", { lay: false });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addOffers = async (req, res) => {
  try {
    const name = req.body.name;
    const offer = req.body.percentage;
    const actiDate = req.body.actiDate;
    const expDate = req.body.expDate;
    const Today = new Date().toISOString().split("T")[0];
    if (
      name.trim() === "" &&
      offer.trim() === "" &&
      actiDate.trim() === "" &&
      expDate.trim() === ""
    ) {
      return res.json({
        success: false,
        message: "please fill all fields",
      });
    } else if (expDate < Today) {
      return res.json({
        success: false,
        message: "please increase your expiry date",
      });
    } else if (actiDate > expDate) {
      return res.json({
        success: false,
        message: "your expiry date is graterthan activation date",
      });
    } else if (offer <= 0 || offer > 100) {
      return res.json({
        success: false,
        message: "please give offer percentage between 1 to 100",
      });
    } else {
      const result = new Offer({
        name: name,
        percentages: offer,
        activeDate: actiDate,
        expDate: expDate,
      });
      await result.save();
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const blockOffer = async (req, res) => {
  try {
    const id = req.body._id;
    const offer = await Offer.findOne({ _id: id });
    if (offer.blocked == 0) {
      await Offer.updateOne({ _id: id }, { $set: { blocked: 1 } });
      return res.json({
        blocked: true,
        success: true,
        btntext: "unblock",
        btncolor: "green",
      });
    } else {
      await Offer.updateOne({ _id: id }, { $set: { blocked: 0 } });
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
const loadEditOffer = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    const offer = await Offer.findOne({ _id: id });
    res.render("admin/editOffer", { lay: false, offer });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const editOffer = async (req, res) => {
  try {
    const name = req.body.name;
    const offer = req.body.percentage;
    const actiDate = req.body.actiDate;
    const expDate = req.body.expDate;
    const Today = new Date().toISOString().split("T")[0];
    if (
      name.trim() === "" &&
      offer.trim() === "" &&
      actiDate.trim() === "" &&
      expDate.trim() === ""
    ) {
      return res.json({
        success: false,
        message: "please fill all fields",
      });
    } else if (expDate < Today) {
      return res.json({
        success: false,
        message: "please increase your expiry date",
      });
    } else if (actiDate > expDate) {
      return res.json({
        success: false,
        message: "your expiry date is graterthan activation date",
      });
    } else if (offer <= 0 || offer > 100) {
      return res.json({
        success: false,
        message: "please give offer percentage between 1 to 100",
      });
    } else {
      await Offer.updateOne(
        { _id: req.body.id },
        {
          $set: {
            name: name,
            percentages: offer,
            activeDate: actiDate,
            expDate: expDate,
          },
        }
      );
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const loadProductOffers = async (req, res) => {
  try {
    const id = req.query.id;
    const offer = await Offer.find({blocked:0});
    const productDetail = await product.findOne({ _id: id });
    console.log(productDetail);
    res.render("admin/productOffer", { lay: false, productDetail, offer });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addProductOffers = async (req, res) => {
  try {
    console.log("working");
    console.log(req.body);
    const offerId = req.body.offerId;
    const proId = req.body.productId;
    console.log(offerId);
    if (offerId == undefined) {
      return res.json({
        success: false,
        message: "please select any offer",
      });
    } else {
      const { ObjectId } = mongoose.Types;
      const convertedOfferId = new ObjectId(offerId);
      const offerData = await Offer.findOne({ _id: convertedOfferId });
      const productData = await product.findOne({ _id: proId });
      productData.offer=convertedOfferId;
      productData.discount= productData.price -(offerData.percentages * productData.price)/100;
      const saveOffer= await productData.save();
      if(saveOffer){
        return res.json({
          success: true,
          message: "",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


const removeProductOffer = async (req, res) => {
  try {
    const proId=req.body.proId;
    const proData= await product.findOne({_id:proId})
    if(proData){
      proData.offer=null;
      proData.discount=null;
      await proData.save()
      return res.json({
        success: true,
        
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  loadOffers,
  loadAddOffers,
  addOffers,
  blockOffer,
  editOffer,
  loadEditOffer,
  loadProductOffers,
  addProductOffers,
  removeProductOffer
};
