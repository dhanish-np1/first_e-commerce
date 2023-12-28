const { render } = require("ejs");
const product = require("../models/productmodel");
const category = require("../models/catogerymodel");
const user = require("../models/usermodel");
const cart = require("../models/cartModel");

//==================================RESEND OTP===================================================

const loadCart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const cartData = await cart
      .findOne({ userId: userId })
      .populate("products.productId");
    const productCount = cartData?.products.length;
    res.render("user/shoping-cart", { lay: true, cartData, productCount });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addToCart = async (req, res) => {
  try {
  
    const userId = req.session.user_id;
    const userData = await user.findOne({ _id: userId });
    const proId = req.body.productId;
    const productData = await product.findOne({ _id: proId });
    const productQuantity = productData.quantity;
    if (userId === undefined) {
      return res.json({
        success: false,
        redirectTo: "/login",
      });
    }
    const cartData = await cart.findOneAndUpdate(
      { userId: userId },
      {
        $setOnInsert: {
          userId: userId,
          userName: userData.fullname,
          products: [],
        },
      },
      { upsert: true, new: true }
    );
    const updatedProduct = cartData.products.find(
      (product) => product.productId === proId
    );
    const updatedQuantity = updatedProduct ? updatedProduct.count : 0;
    if (updatedQuantity + 1 > productQuantity) {
      return res.json({
        success: false,
        message: "Quantity limit reached!",
      });
    }

    const price = productData.price;
    const total = price;

    if (updatedProduct) {
      await cart.updateOne(
        { userId: userId, "products.productId": proId },
        {
          $inc: {
            "products.$.count": 1,
            "products.$.totalPrice": total,
          },
        }
      );
    } else {
      cartData.products.push({
        productId: proId,
        productPrice: total,
        totalPrice: total,
      });
      await cartData.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const removeCart =async ()=>{
  try {
    

    
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  loadCart,
  addToCart,
  removeCart
};
