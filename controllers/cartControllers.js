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
    let totalAmount = 0;
    if (cartData) {
      let cartTotal = cartData.products.reduce((total, product) => {
        return total + product.productId.price * product.count;
      }, 0);
      // calculating discount amout
      for (let i = 0; i < cartData.products.length; i++) {
        let cartItem = cartData.products[i];
        
        if (
          cartItem.productId.discount !== null &&
          cartItem.productId.discount !== undefined
        ) {
          let productprice = cartItem.productId.discount;
          totalAmount += cartItem.count * productprice;
        } else {
          let productprice = cartItem.productId.price;
          totalAmount += cartItem.count * productprice;
        }
        
      }
      console.log(totalAmount);
      const productCount = cartData?.products.length;
      console.log(cartData.products);
      res.render("user/shoping-cart", {
        lay: true,
        cartData,
        productCount,
        cartTotal,
        totalAmount,
        name: req.session.name,
      });
    } else {
      res.render("user/shoping-cart", {
        lay: true,
        cartData:null,
        productCount:0,
        cartTotal:0,
        name: req.session.name,
      });
    }
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
    if (productQuantity <= 0) {
      return res.json({
        success: true,
        stock: false,
        messege: "quantity limit reached",
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
    if (updatedQuantity + 1 > productQuantity || updatedQuantity + 1 > 5) {
      return res.json({
        success: true,
        message: "Quantity limit reached!",
      });
    }

    const price = productData.price;

    if (updatedProduct) {
      await cart.updateOne(
        { userId: userId, "products.productId": proId },
        {
          $inc: {
            "products.$.count": 1,
          },
        }
      );
    } else {
      cartData.products.push({
        productId: proId,
        productPrice: price,
      });
      await cartData.save();
    }

    return res.json({ success: true, stock: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const removeCart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const proId = req.body.product;
    const cartData = await cart.findOne({ userId: userId });
    if (cartData) {
      await cart.findOneAndUpdate(
        { userId: userId },
        {
          $pull: { products: { productId: proId } },
        }
      );
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const quantityUpdate = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const proId = req.body.id;
    const count = req.body.quantity;
    const currentvalue = req.body.curval;
    const productData = await product.findOne({ _id: proId, blocked: 0 });
    if (!productData) {
      return res
        .status(200)
        .json({ success: false, message: "Product not found or blocked" });
    }
    if (
      (currentvalue >= productData.quantity && count == 1) ||
      (count == 1 && currentvalue >= 5) ||
      (count == -1 && currentvalue <= 1)
    ) {
      return res.status(200).json({
        success: false,
        message: "Invalid quantity or stock exceeded",
      });
    }
    await cart.updateOne(
      { userId: userId, "products.productId": proId },
      { $inc: { "products.$.count": count } }
    );
    const updateCart = await cart
      .findOne({ userId: userId })
      .populate("products.productId");
    let cartTotal = updateCart.products.reduce((total, product) => {
      return total + product.productId.price * product.count;
    }, 0);

    return res.json({
      success: true,
      updateCart,
      cartTotal,
    });
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  loadCart,
  addToCart,
  removeCart,
  quantityUpdate,
};
