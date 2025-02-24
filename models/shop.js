const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId, // Sử dụng ObjectId để tham chiếu
    ref: "Category", // Tên model của bảng Category
    required: true,
  },

  info: {
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
      stock : {
        type : Number,
      },
      trademark : {
        type : String,
      }
    },
    required: true,
    default: {},
  },
});

module.exports = mongoose.model("Shop", shopSchema);
