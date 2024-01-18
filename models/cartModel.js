const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: "user",
  },
  userName: {
    type: String,
    required: true,
  },
  applied:{
    type: String,
    default: "not"
  },
  products: [
    {
      productId: {
        type: String,
        required: true,
        ref: "product",
      },
      count: {
        type: Number,
        default: 1,
      },
      productPrice: {
        type: Number,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("cart", cartSchema);