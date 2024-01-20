const { render } = require("ejs");
const product = require("../models/productmodel");
const category = require("../models/catogerymodel");
const user = require("../models/usermodel");
const cart = require("../models/cartModel");
const address = require("../models/addressModel");
const order = require("../models/orderModel");

const loadProceedCheckout = async (req, res) => {
  try {
    const Address = await address.findOne({ user: req.session.user_id });
    const userId = req.session.user_id;
    const cartData = await cart
      .findOne({ userId: userId })
      .populate("products.productId");
    const productCount = cartData?.products.length;
    res.render("user/checkout", {
      lay: true,
      cartData,
      productCount,
      Address,
      name: req.session.name,
    });
  } catch (error) {
    console.log(error.massage);
    res.status(500).json({ error: "Internal server error" });
  }
};

const proceedCheckout = async (req, res) => {
  try {
    const Address = await address.findOne({ user: req.session.user_id });
    const userId = req.session.user_id;
    const cartData = await cart
      .findOne({ userId: userId })
      .populate("products.productId");
    console.log(cartData);
    if (cartData.products.length <= 0) {
      return res.json({
        success: false,
        message: "No products in the cart",
      });
    }
    // cheking any prodect blocked
    const productsData = await product.find({
      _id: { $in: cartData.products.map((item) => item.productId) },
    });
    for (let i = 0; i < productsData.length; i++) {
      if (productsData[i].blocked !== 0) {
        return res.json({
          success: false,
          message: "Sorry, some products are no longer available for sale.",
        });
      }
    }
    // cheking is stock left
    for (let i = 0; i < productsData.length; i++) {
      if (cartData.products[i].count > productsData[i].quantity) {
        return res.json({
          success: false,
          message: "Insufficient stock for some products in the order",
        });
      }
    }
    return res.json({
      success: true,
      message: "no problem",
    });
  } catch (error) {
    console.log(error.massage);
    res.status(500).json({ error: "Internal server error" });
  }
};

const loadSuccess = async (req, res) => {
  try {
    res.render("user/successpage", { lay: true, name: req.session.name });
  } catch (error) {
    console.log(error.massage);
    res.status(500).json({ error: "Internal server error" });
  }
};

const placeOrder = async (req, res) => {
  try {
    const { address_id, PaymentMethod } = req.body;
    const userId = req.session.user_id;
    if (!address_id || !PaymentMethod) {
      return res.json({
        success: false,
        message: "Address and paymentMethod are required fields.",
      });
    }
    const cartData = await cart.findOne({ userId: userId });
    if (cartData && cartData.products) {
      cartData.products.sort((a, b) => a.productPrice - b.productPrice);
    }
    const productsData = await product
      .find({
        _id: { $in: cartData.products.map((item) => item.productId) },
      })
      .sort({ price: 1 });
    // cheking there is any products in the cart
    if (cartData?.products.length == 0) {
      return res.json({
        success: false,
        message: "No products in the cart",
      });
    }
    // cheking product blocked or not
    for (let i = 0; i < productsData.length; i++) {
      if (productsData[i].blocked !== 0) {
        return res.json({
          success: false,
          message: "Sorry, some products are no longer available for sale.",
        });
      }
    }
    // cheking is stock left
    for (let i = 0; i < productsData.length; i++) {
      if (cartData.products[i].count > productsData[i].quantity) {
        return res.json({
          success: false,
          message: "Insufficient stock for some products in the order",
        });
      }
    }

    let orderProducts = [];
    for (let i = 0; i < productsData.length; i++) {
      let updatedStock = productsData[i].quantity - cartData.products[i].count;
      console.log(productsData[i]);
      await product.updateOne(
        { _id: productsData[i]._id },
        { $set: { quantity: updatedStock } }
      );
      orderProducts.push({
        productId: productsData[i]._id,
        quantity: cartData.products[i].count,
        price: productsData[i].price,
        product_name: productsData[i].name,
        image: productsData[i].images.image1,
      });
    }

    let deliveryAddress = await address.findOne(
      {
        user: userId,
        "address._id": address_id,
      },
      {
        "address.$": 1, // This projects only the matched address in the result
      }
    );

    if (!deliveryAddress) {
      return res.json({
        success: false,
        message: "The selected address is not found ",
      });
    } else {
      const cartTotal = await cart
        .findOne({ userId: userId })
        .populate("products.productId");
      let Total = cartTotal.products.reduce((total, product) => {
        return total + product.productId.price * product.count;
      }, 0);
      const uniNum = Math.floor(Math.random() * 900000) + 100000;
      console.log(deliveryAddress);
      const Order = new order({
        address: {
          Name: deliveryAddress.address[0].fullname,
          city: deliveryAddress.address[0].city,
          state: deliveryAddress.address[0].state,
          pin: deliveryAddress.address[0].pin,
          phone: deliveryAddress.address[0].mobile,
          email: deliveryAddress.address[0].email,
          houseNo: deliveryAddress.address[0].houseName,
        },
        uniqueId: uniNum,
        userId: userId,
        userName: req.session.name,
        products: orderProducts,
        deliveryDate: new Date(),
        paymentMethod: "COD",
        totalAmount: Total,
        status: "placed",
      });
      let savedOrder = await Order.save();
      res.json({ success: true, message: "Order placed successfully" });
      await cart.updateOne({ userId: userId }, { $set: { products: [] } });
    }
  } catch (error) {
    console.log(error.massage);
    res.status(500).json({ error: "Internal server error" });
  }
};

const statusUpdate = async (req, res) => {
  try {
    const orderId = req.body.id;
    const orderData = await order.findOne({ _id: orderId });
    const userId = orderData.userId;
    const statusLevel = req.body.level;
    const amount = orderData.totalAmount;
    const products = orderData.products;
    console.log(statusLevel);
    console.log(orderId);
    if (statusLevel == 1) {
      console.log("w1");
      await order.updateOne(
        { _id: orderId },
        { status: "cancelled", statusLevel: 0 }
      );
    } else if (statusLevel == 2) {
      console.log("w2");
      await order.updateOne(
        { _id: orderId },
        { status: "shipped", statusLevel: 1 }
      );
    } else if (statusLevel == 3) {
      console.log("w3");
      await order.updateOne(
        { _id: orderId },
        { status: "delivered", statusLevel: 2, deliveryDate: new Date() }
      );
    }
    const orders = await order.find();
    return res.json({
      success: true,
      orders
      
    });
  } catch (error) {
    console.log(error.massage);
    res.status(500).json({ error: "Internal server error" });
  }
};


const cancelOrder = async (req, res) => {
  try {
    const orderId=req.body.id;
    await order.updateOne(
      { _id: orderId },
      { status: "cancelled", statusLevel: 0 }
    );
    return res.json({
      success: true,
    });
  } catch (error) {
    console.log(error.massage);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  loadProceedCheckout,
  loadSuccess,
  placeOrder,
  proceedCheckout,
  statusUpdate,
  cancelOrder
};
