let placeOrder = async (req, res) => {
  try {
    
    
    let deliveryAddress = await address.findOne({
      "addresses._id": addressId,
      user: req.session.user_id,
    });
    if (!deliveryAddress) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery address not found" });
    } else {
      let order = new Order({
        userId: req.session.user_id,
        address: {
          firstName: deliveryAddress.addresses[0].firstName,
          lastName: deliveryAddress.addresses[0].lastName,
          address: deliveryAddress.addresses[0].address,
          city: deliveryAddress.addresses[0].city,
          state: deliveryAddress.addresses[0].state,
          pin: deliveryAddress.addresses[0].pin,
          phone: deliveryAddress.addresses[0].phone,
          email: deliveryAddress.addresses[0].email,
          additional: deliveryAddress.addresses[0].additional,
        },
        products: orderProducts,
        amount: amount,
        paymentType: paymentMethod,
      });

      let savedOrder = await order.save();
      if (paymentMethod === "cod") {
        res.json({ success: true, message: "Order placed successfully" });
        await Cart.updateOne(
          { userid: req.session.user_id },
          { $set: { products: [] } }
        );
      } else if (savedOrder.paymentType == "paypal") {
        await Cart.updateOne(
          { userid: req.session.user_id },
          { $set: { products: [] } }
        );
        const options = {
          amount: savedOrder.amount * 100,
          currency: "INR",
          receipt: savedOrder._id,
          payment_capture: 1,
        };

        razorpay.orders.create(options, (err, order) => {
          if (err) {
            throw new Error("something went wrong, try again later");
          } else {
            res.json({ order });
          }
        });
      } else if (paymentMethod === "wallet") {
        if (userDa.wallet < amount) {
          res.json({
            success: false,
            message: "Insufficient balance in wallet",
          });
        } else {
          userDa.wallet = userDa.wallet - amount;
          await userDa.save();
          await Cart.updateOne(
            { userid: req.session.user_id },
            { $set: { products: [] } }
          );
          res.json({ success: true, message: "Order placed successfully" });
        }
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
