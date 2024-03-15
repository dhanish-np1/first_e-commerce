const { render } = require("ejs");
const product = require("../models/productmodel");
const category = require("../models/catogerymodel");
const user = require("../models/usermodel");
const cart = require("../models/cartModel");
const address = require("../models/addressModel");
const order = require("../models/orderModel");
const coupons = require("../models/couponModel");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

// *************************************************
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// *************************************************

// ========================= LOAD PROCEED CHECKOUT===================================================

const loadProceedCheckout = async (req, res) => {
  try {
    console.log('wol');
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
      coupon: req.session.couponAmount,
    });
  } catch (error) {
    console.log(error.massage);
    res.status(500).json({ error: "Internal server error" });
  }
};
// ===========================PROCEED CHECKOUT=================================================

const proceedCheckout = async (req, res) => {
  try {
    console.log('woking pr');
    const Address = await address.findOne({ user: req.session.user_id });
    const userId = req.session.user_id;
    const cartData = await cart
      .findOne({ userId: userId })
      .populate("products.productId");
    console.log(cartData);
    if (cartData?.products?.length <= 0 || cartData ==null) {
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
// =====================LOAD SUCCESS=======================================================

const loadSuccess = async (req, res) => {
  try {
    res.render("user/successpage", { lay: true, name: req.session.name });
  } catch (error) {
    console.log(error.massage);
    res.status(500).json({ error: "Internal server error" });
  }
};
// ================PLACEORDER============================================================

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
    let afterOfferPrice;
    for (let i = 0; i < productsData.length; i++) {
      afterOfferPrice = productsData[i].discount==null?productsData[i].price: productsData[i].discount;
      orderProducts.push({
        productId: productsData[i]._id,
        quantity: cartData.products[i].count,
        categery: productsData[i].category,
        price: productsData[i].price,
        afterOffer: afterOfferPrice,
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
        "address.$": 1,
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
    if (totalamounts > 1000 && PaymentMethod == "COD") {
      return res.json({
        success: false,
        message: "order above 1000Rs not allowed in cash on delivery",
      });
    }
    if (PaymentMethod == "Wallet") {
      const userWalletDetails = await user.findOne({
        _id: req.session.user_id,
      });
      const userWallet = userWalletDetails.wallet;
      if (userWallet < totalamounts) {
        return res.json({
          success: false,
          message: "don't have enough money in wallet",
        });
      }
    }
    if (!deliveryAddress) {
      return res.json({
        success: false,
        message: "The selected address is not found ",
      });
    } else {
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
        // chekin coupon exist or not
        if (req.session.code) {
          const coupon = await coupons.findOne({
            couponCode: req.session.code,
          });
          // req.session.code = false;
          // req.session.couponAmount = false;
          const disAmount = coupon.discountAmount;
          await order.updateOne(
            { _id: orderId },
            { $set: { discount: disAmount } }
          );

          const totel = totalamounts - disAmount;
          totalamounts -= disAmount;

          // coupon.usedUsers.push(req.session.user_id);
          const coupen = await coupon.save();
          await order.updateOne(
            { _id: orderId },
            { $set: { totalAmount: totel } }
          );
          if (coupen) {
            await order.updateOne(
              { _id: orderId },
              { $set: { applied: "applied",couponAmount:coupon.discountAmount } }
            );
          }
        }

        // cash on delivery
        if (savedOrder.paymentMethod === "COD") {
          console.log("cod");
          if (req.session.code) {
            const coupon = await coupons.findOne({
              couponCode: req.session.code,
            });
            req.session.code = false;
            req.session.couponAmount = false;
            coupon.usedUsers.push(req.session.user_id);
            const coupen = await coupon.save();
          }
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
          if (req.session.code) {
            const coupon = await coupons.findOne({
              couponCode: req.session.code,
            });
            req.session.code = false;
            req.session.couponAmount = false;
            coupon.usedUsers.push(req.session.user_id);
            const coupen = await coupon.save();
          }
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
                    reason: "Product purchased.",
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

// ================ ORDER STATUS UPDATE============================================================

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
// ==========================CANCEL ORDERS==================================================

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.body.id;
    let orderData = await order.findOne({_id: orderId});
    await order.updateOne(
      { _id: orderId },
      { status: "cancelled", statusLevel: 0 }
    );
    if(orderData.paymentMethod!=='COD'){

     const chek = await user.updateOne(
        { _id: req.session.user_id },
        {
          $inc: { wallet: orderData.totalAmount },
          $push: {
            walletHistory: {
              date: new Date(),
              amount: orderData.totalAmount,
              reason: 'no reason',
              cancelOderId: orderData.uniqueId,
            },
          },
        }
      );
      console.log(chek);
      console.log('wolkldfjking');

    }
    return res.json({
      success: true,
    });
  } catch (error) {
    console.log(error.massage);
    res.status(500).json({ error: "Internal server error" });
  }
};
// ============== VARIFY ONLINE PAYMENT==============================================================

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
      if (req.session.code) {
        const coupon = await coupons.findOne({
          couponCode: req.session.code,
        });
        req.session.code = false;
        req.session.couponAmount = false;
        coupon.usedUsers.push(req.session.user_id);
        const coupen = await coupon.save();
      }
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
// =======================RETURN ORDER=====================================================

const returnOrder = async (req, res) => {
  try {
    console.log(req.body);
    const reason = req.body.reason;
    if (reason.trim() == "") {
      return res.json({ success: false, message: "please add your reason" });
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
      console.log("4");
      if (updatedData) {
        for (let i = 0; i < products.length; i++) {
          let pro = products[i].productId;
          let count = products[i].quantity;
          await product.updateOne({ _id: pro }, { $inc: { quantity: count } });
        }
      }
      return res.json({ success: true });
    } else {
      console.log("not");
    }
  } catch (error) {
    console.log(error.massage);
    res.status(500).json({ error: "Internal server error" });
  }
};
// ===================DOWNLOAD INVOICE=========================================================

const downloadInvoice = async (req, res) => {
  try {
    const orderId = req.query.id;
    const userData = await user.findOne({ _id: req.session.user_id });
    const orderData = await order
      .findOne({ _id: orderId })
      .populate("products.productId");
    const date = new Date();
    data = {
      order: orderData,
      users: userData,
      date,
    };
    console.log(orderData);
    res.render("user/invoice", {
      lay: false,
      name: req.session.name,
      order: orderData,
      users: userData,
      date,
    });
  } catch (error) {
    console.log(error.massage);
    res.status(500).json({ error: "Internal server error" });
  }
};
// ========================PAY FAILD PAYMENTS====================================================

const payFaildPayment = async (req, res) => {
  try {
    console.log("working");
    console.log(req.body);
    const order_id = req.body.order_Id;
    const orderData = await order.findOne({ _id: order_id });
    console.log(orderData);
    const options = {
      amount: orderData.totalAmount * 100,
      currency: "INR",
      receipt: "" + order_id,
    };
    const orders = instance.orders.create(options, function (err, order) {
      res.json({ success: false, order });
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
  cancelOrder,
  varifyPayment,
  returnOrder,
  downloadInvoice,
  payFaildPayment,
};
