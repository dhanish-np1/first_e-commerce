const { render } = require("ejs");
const product = require("../models/productmodel");
const category = require("../models/catogerymodel");
const user = require("../models/usermodel");
const cart = require("../models/cartModel");
const address = require("../models/addressModel");
const order = require("../models/orderModel");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// *************************************************
var instance = new Razorpay({
  key_id: "rzp_test_2lSCohy0YKKPBl",
  key_secret: "ekUWYBIr8D5eGhamgHe1ZcDg",
});
// *************************************************

const loadProceedCheckout = async (req, res) => {
  try {
    const Address = await address.findOne({ user: req.session.user_id });
    const userId = req.session.user_id;
    const cartData = await cart
      .findOne({ userId: userId })
      .populate("products.productId");
    const productCount = cartData?.products.length;
    let cartTotal = cartData.products.reduce((total, product) => {
      return total + product.productId.price * product.count;
    }, 0);
    let totalAmount = 0;
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
    res.render("user/checkout", {
      lay: true,
      cartData,
      productCount,
      Address,
      cartTotal,
      totalAmount,
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
    const cartData = await cart
      .findOne({ userId: userId })
      .populate("products.productId");
    // to avoid wrong count decreasing
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
    let totalamounts = 0;
    for (let i = 0; i < cartData.products.length; i++) {
      let cartItem = cartData.products[i];
      if (
        cartItem.productId.discount !== null &&
        cartItem.productId.discount !== undefined
      ) {
        let productprice = cartItem.productId.discount;
        totalamounts += cartItem.count * productprice;
      } else {
        let productprice = cartItem.productId.price;
        totalamounts += cartItem.count * productprice;
      }
    }
    if (!deliveryAddress) {
      return res.json({
        success: false,
        message: "The selected address is not found ",
      });
    } else {
      console.log(totalamounts);
      const payMethod = PaymentMethod === "COD" ? "placed" : "pending";
      const statusLevel = payMethod === "placed" ? 1 : 0;
      const uniNum = Math.floor(Math.random() * 900000) + 100000;

      console.log("qq");
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
        paymentMethod: PaymentMethod,
        totalAmount: totalamounts,
        status: payMethod,
        statusLevel: statusLevel,
      });

      let savedOrder = await Order.save();
      const orderId = savedOrder._id;

      //after save the order
      if (savedOrder) {
        // cash on delivery
        if (savedOrder.paymentMethod === "COD") {
          console.log("cod");
          // decreasing the quntity from the product
          for (let i = 0; i < productsData.length; i++) {
            let updatedStock =
              productsData[i].quantity - cartData.products[i].count;
            await product.updateOne(
              { _id: productsData[i]._id },
              { $set: { quantity: updatedStock } }
            );
          }
          await cart.updateOne({ userId: userId }, { $set: { products: [] } });
          return res.json({
            success: true,
            message: "Order placed successfully",
          });
        } else if (savedOrder.paymentMethod === "online_Payment") {
          console.log("online");
          // online payment delivery
          const options = {
            amount: totalamounts * 100,
            currency: "INR",
            receipt: "" + orderId,
          };
          const orders = instance.orders.create(options, function (err, order) {
            res.json({ success: false, order });
          });
        } else if (savedOrder.paymentMethod === "Wallet") {
          // Wallet delivery
          const userDetails = await user.findOne({ _id: req.session.user_id });
          const wallet = userDetails.wallet;
          if (wallet >= totalamounts) {
            await user.updateOne(
              { _id: userId },
              {
                $inc: { wallet: -totalamounts },
                $push: {
                  walletHistory: {
                    date: new Date(),
                    amount: totalamounts,
                    reason: "Purchased Amount Debited.",
                    cancelOderId: uniNum,
                  },
                },
              },
              { new: true }
            );

            await order.findByIdAndUpdate(
              orderId,
              { status: "placed", statusLevel: 1 },
              { new: true }
            );

            for (let i = 0; i < productsData.length; i++) {
              let updatedStock =
                productsData[i].quantity - cartData.products[i].count;
              await product.updateOne(
                { _id: productsData[i]._id },
                { $set: { quantity: updatedStock } }
              );
            }
            await cart.updateOne(
              { userId: userId },
              { $set: { products: [] } }
            );
            return res.json({
              success: true,
              message: "Order placed successfully",
            });
          } else {
            return res.json({
              success: false,
              message: "don't have enough money in wallet",
            });
          }
        } else {
          return res.json({ success: false, message: "somthing went wrong" });
        }
      } else {
        return res.json({ success: false, message: "somthing went wrong" });
      }
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
    const amount = orderData.totalAmounts;
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
      orders,
    });
  } catch (error) {
    console.log(error.massage);
    res.status(500).json({ error: "Internal server error" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.body.id;
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

const varifyPayment = async (req, res) => {
  try {
    console.log(req.body);
    const userId = req.session.user_id;
    let orderId = req.body.order.receipt;
    const cartData = await cart
      .findOne({ userId: userId })
      .populate("products.productId");
    const details = req.body;
    const hmac = crypto.createHmac("sha256", "YgtIcUty8k3ACrcGRnadqtK4");
    const dataToHash =
      details.payment.razorpay_order_id +
      "|" +
      details.payment.razorpay_payment_id;
    hmac.update(dataToHash);
    const hmacValue = hmac.digest("hex");
    console.log(`${details.payment.razorpay_signature}`);
    console.log(`${hmacValue}`);

    if (hmacValue !== details.payment.razorpay_signature) {
      console.log("working");
      const productsData = await product
        .find({
          _id: { $in: cartData.products.map((item) => item.productId) },
        })
        .sort({ price: 1 });
      //update quantity
      for (let i = 0; i < productsData.length; i++) {
        let updatedStock =
          productsData[i].quantity - cartData.products[i].count;
        await product.updateOne(
          { _id: productsData[i]._id },
          { $set: { quantity: updatedStock } }
        );
      }
      // count total and discount
      let totalamounts = 0;
      for (let i = 0; i < cartData.products.length; i++) {
        let cartItem = cartData.products[i];
        if (
          cartItem.productId.discount !== null &&
          cartItem.productId.discount !== undefined
        ) {
          let productprice = cartItem.productId.discount;
          totalamounts += cartItem.count * productprice;
        } else {
          let productprice = cartItem.productId.price;
          totalamounts += cartItem.count * productprice;
        }
      }
      const Total = totalamounts;
      await order.findByIdAndUpdate(
        { _id: details.order.receipt },
        {
          status: "placed",
          statusLevel: 1,
          paymentId: details.payment.razorpay_payment_id,
        },
        { new: true }
      );

      const orderid = details.order.receipt;
      await cart.updateOne({ userId: userId }, { $set: { products: [] } });
      return res.json({
        success: true,
        orderid,
        message: "Order placed successfully",
      });
    } else {
      console.log("false");
      await order.findByIdAndDelete({ _id: details.order.receipt });
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error.massage);
    res.status(500).json({ error: "Internal server error" });
  }
};

const returnOrder = async (req, res) => {
  try {
    console.log(req.body);
    const reason = req.body.reason;
    if (reason.trim() == '') {
      return res.json({ success: false, message: "please add your reason" })
    }
    const orderId = req.body.ordId;
    const orderData = await order.findOne({ _id: orderId });
    const amount = orderData.totalAmount;
    const products = orderData.products;
    const result = await user.updateOne(
      { _id: req.session.user_id },
      {
        $inc: { wallet: amount },
        $push: {
          walletHistory: {
            date: new Date(),
            amount: amount,
            reason: reason,
            cancelOderId: orderData.uniqueId,
          },
        },
      }
    );

    if (result) {
      const updatedData = await order.updateOne(
        { _id: orderId },
        {
          $set: {
            returnReason: reason,
            status: "Returned",
            statusLevel: 0,
          },
        }
      );
      console.log('4');
      if (updatedData) {
        for (let i = 0; i < products.length; i++) {
          let pro = products[i].productId;
          let count = products[i].quantity;
          await product.updateOne({ _id: pro }, { $inc: { quantity: count } });
        }
      }
      return res.json({ success: true })
    } else {
      console.log("not");
    }
  } catch (error) {
    console.log(error.massage);
    res.status(500).json({ error: "Internal server error" });
  }
};

const downloadInvoice = async (req, res) => {
  try {
    const orderId=req.query.id;
    const userData = user.findOne({_id:req.session.user_id})
    const orderData = order.findOne({_id:orderId}).populate("products.productId")
    console.log(userData);
    console.log(orderData);
      res.render("user/invoice", { lay: false, name: req.session.name,userData,orderData })
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
  cancelOrder,
  varifyPayment,
  returnOrder,
  downloadInvoice
};
