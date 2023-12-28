const { render } = require("ejs");
const product = require("../models/productmodel");
const category = require("../models/catogerymodel");

const loadOrder = async (req,res) => {
  try {
    const products = await product.find();
    res.render('admin/order',{lay:false,products})
  } catch (error) {
    console.log(error.massage);
  }
};

module.exports = {
  loadOrder,
};
