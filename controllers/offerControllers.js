const { render } = require("ejs");
const mongoose = require("mongoose");
const product = require("../models/productmodel");
const category = require("../models/catogerymodel");
const user = require("../models/usermodel");
const cart = require("../models/cartModel");
const address = require("../models/addressModel");
const order = require("../models/orderModel");
const Offer = require("../models/offerModel");

// ======================LOAD OFFERS======================================================
const loadOffers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;

    const totalCount = await Offer.countDocuments();
    const totalPages = Math.ceil(totalCount / perPage);
    const offers = await Offer.find()
      .skip((page - 1) * perPage)
      .limit(perPage);
    res.render("admin/offers", {
      lay: false,
      offers,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
// ====================LOAD ADD OFFERS PAGE========================================================

const loadAddOffers = async (req, res) => {
  try {
    res.render("admin/addOffer", { lay: false });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
// ===================ADD OFFERS=========================================================

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
// ======================BLOCK OFFER======================================================

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
// ===================== LOAD EDIT OFFER=======================================================

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
// ==================EDIT OFFER==========================================================

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
// =============LOAD PRODUCT OFFERS===============================================================

const loadProductOffers = async (req, res) => {
  try {
    const id = req.query.id;
    const offer = await Offer.find({ blocked: 0 });
    const productDetail = await product.findOne({ _id: id });
    console.log(productDetail);
    res.render("admin/productOffer", { lay: false, productDetail, offer });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
// ==================== ADD PRODUCT OFFERS========================================================

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
      productData.offer = convertedOfferId;
      productData.discount =
        productData.price - (offerData.percentages * productData.price) / 100;
      const saveOffer = await productData.save();
      if (saveOffer) {
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
// ====================REMOVE PRODUCT OFFER========================================================

const removeProductOffer = async (req, res) => {
  try {
    const proId = req.body.proId;
    const proData = await product.findOne({ _id: proId });
    if (proData) {
      proData.offer = null;
      proData.discount = null;
      await proData.save();
      return res.json({
        success: true,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
// ===============ADD CATEGERY OFFERS=============================================================

const addCategeryOffers = async (req, res) => {
  try {
    console.log("working");
    console.log(req.body);
    const offerId = req.body.offerId;
    const categeryId = req.body.categeryId;
    const offerData = await Offer.findOne({ _id: offerId });
    const categeryData = await category.findOne({ _id: categeryId });
    console.log(offerData);
    console.log(categeryData);
    if (offerData && categeryData) {
      categeryData.offer = offerData._id;
      const proData = await product
        .find({ category: categeryData.name })
        .populate("offer");
      for (const product of proData) {
        if (product.category == categeryData.name) {
          if (
            !product.offer ||
            offerData.percentages > product.offer.percentages
          ) {
            product.discount =
              product.price - (offerData.percentages * product.price) / 100;
            product.offer = offerData._id;
          }
          await product.save();
        }
      }
      const updatedCategory = await categeryData.save();
    } else {
    }
    res.redirect("catogery");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// =====================REMOVE CATEGERY OFFERS=======================================================

const removeCategeryOffers = async (req, res) => {
  try {
    console.log(req.body);
    const categeryId = req.body.categeryId;
    const categeryName = req.body.name;
    const cateData = await category
      .findOne({ _id: categeryId })
      .populate("offer");
    const proData = await product
      .find({ category: categeryName })
      .populate("offer");
    for (const product of proData) {
      if (product.offer === null) {
        product.discount = null;
      } else if (product.offer && product.offer.percentages) {
        if (product.offer.percentages > cateData.offer.percentages) {
          product.discount =
            product.price - (product.offer.percentages * product.price) / 100;
        } else {
          product.offer = null;
          product.discount = null;
        }
      }

      await product.save();
    }
    if (cateData) {
      // Remove category offer
      cateData.offer = null;
      const updateData = await cateData.save();

      if (updateData) {
        res.json({ success: true });
      }
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
  removeProductOffer,
  addCategeryOffers,
  removeCategeryOffers,
};
