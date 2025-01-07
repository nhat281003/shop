const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // Đảm bảo rằng tên người dùng là duy nhất
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

// Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
userSchema.pre("save", async function (next) {
  next();
});

module.exports = mongoose.model("User", userSchema);
