const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    address: {
        Name: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        pin: {
            type: String,
            required: true,
        },
        phone: {
            type: Number,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        houseNo: {
            type: String,
        }
    },
  user: {
    type: mongoose.Types.ObjectId,
  },
  uniqueId: {
    type: Number,
  },
  userId: {
    type: String,
    ref: 'user',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  products: [
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true,
        },
        quantity: {
            type: Number,
            default: 1,
        },
        categery: {
          type: String,
          default: 1,
      },
        price:{
          type:Number,
          required: true,
        },
        afterOffer:{
          type:Number
        },
        product_name: {
            type: String,  // Add this field to store the product name
            required: true,
        },
        image: {
            type: String,  // Add this field to store the product image
            required: true,
        }
    }
],
  
  deliveryDate: {
    type: Date,
  },
  cancelReason: {
    type: String
  },
  returnReason: {
    type: String
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
  },
  statusLevel: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
  },
  orderId: {
    type: String,
  },
  paymentId: {
    type: String
  },
  applied:{
    type: String,
  },
  couponAmount:{
    type:Number,
  },
  discount: {
    type: String
  }
});

module.exports = mongoose.model("order", orderSchema);