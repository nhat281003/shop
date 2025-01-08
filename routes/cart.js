const express = require('express') ;
const router = express.Router();
const Shop = require("../models/shop");
const Cart = require("../models/cart");
const jwt = require("jsonwebtoken");



// thêm giỏ hàng
router.post("/add", async (req, res) => {
    try {
      const { userId, productId, quantity } = req.body;
  
      // Kiểm tra đầu vào
      if (!userId || !productId || !quantity) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      // Kiểm tra sản phẩm có tồn tại không
      const product = await Shop.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      // Kiểm tra tồn kho sản phẩm
      if (product.stock < quantity) {
        return res.status(400).json({ message: "Not enough stock available" });
      }
  
      // Tìm giỏ hàng của người dùng
      let cart = await Cart.findOne({ userId });
  
      // Nếu chưa có giỏ hàng, tạo mới
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }
  
      // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
      const cartItemIndex = cart.item.findIndex((item) => item.productId.toString() === productId);
  
      if (cartItemIndex > -1) {
        // Nếu sản phẩm đã có trong giỏ, cập nhật số lượng
        cart.item[cartItemIndex].quantity += quantity;
      } else {
        // Nếu chưa có, thêm sản phẩm vào giỏ
        cart.item.push({ productId, quantity });
      }
  
      // Lưu giỏ hàng
      await cart.save();
  
      res.status(200).json({ message: "Added to cart", cart });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
  });


  // API lấy danh sách sản phẩm trong giỏ hàng
  router.get("/", authenticateToken, async (req, res) => {
    try {
      // Lấy userId từ token đã giải mã
      const userId = req.user.id;


      console.log(userId);
      
  
      // Tìm giỏ hàng theo userId
      const cart = await Cart.findOne({ userId }).populate("item.productId");
  
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
  
      res.status(200).json({
        message: "Cart fetched successfully",
        cart: cart.item.map((item) => ({
          productId: item.productId._id,
          productName: item.productId.name,
          price: item.productId.price,
          quantity: item.quantity,
        })),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", error: err });
    }
  });
  
  module.exports = router;
  



















// Middleware xác thực token
async function authenticateToken(req, res, next) {
    const token = req.header("Authorization")?.replace("Bearer ", "");
  
    if (!token) {
      return res.status(401).json({ message: "Access Denied. No token provided." });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; 


      console.log(req.user);  
      console.log(decoded);
      
      
      next();
    } catch (err) {
        console.log(err);
        
      res.status(403).json({ message: "Invalid or expired token." });
    }
  }
  
  module.exports = router;