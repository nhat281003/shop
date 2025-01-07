const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  item: [
    {
      quantity: {
        type: Number.parseInt,
        require: true,
        default: 0,
      },

      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
      },
    },
  ],
});

module.exports = mongoose.model("Cart", cartSchema);
