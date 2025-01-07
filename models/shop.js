const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
  category: {
    type: {
      categoryId: {
        type: String,
        required: true,
      },
      categoryName: {
        type: String,
        required: true,
      },
    },
    required: true,
  },

  list: {
    type: {
      name: {
        type: String,
        required: true,
      },

      url_image: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },

      description: {
        type: String,
        required: true,
      },
    },
    required: true,
    default: {},
  },
});

module.exports = mongoose.model("Shop", shopSchema);
