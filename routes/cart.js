const express = require("express");
const router = express.Router();
const Shop = require("../models/shop");
const Order = require("../models/oder");
const Cart = require("../models/cart");
const jwt = require("jsonwebtoken");
const BaseResopnse = require("../base_reponse/response");

// thêm giỏ hàng
router.post("/add", authenticateToken ,async (req, res) => {
  try {
    const { product, quantity } = req.body;

   const userId = await req.user.userId;
    // Kiểm tra đầu vào
    if (!userId || !product || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Kiểm tra sản phẩm có tồn tại không
    const productss = await Shop.findById(product);
    if (!productss) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Kiểm tra tồn kho sản phẩm
    if (productss.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    // Tìm giỏ hàng của người dùng
    let cart = await Cart.findOne({ userId });

    // Nếu chưa có giỏ hàng, tạo mới
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    console.log(cart);
    

    // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
    const cartItemIndex = cart.item.findIndex(
      (item) => item.product.toString() === product
    );


    

    if (cartItemIndex > -1) {
      // Nếu sản phẩm đã có trong giỏ, cập nhật số lượng
      cart.item[cartItemIndex].quantity += quantity;
    } else {
      // Nếu chưa có, thêm sản phẩm vào giỏ
      cart.item.push({ product, quantity });
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
    const userId = await req.user.userId;

    // Tìm giỏ hàng theo userId
    const cart = await Cart.findOne({ userId }).populate({
      path: "item.product",
      model: "Shop",
    });

    console.log(cart);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    BaseResopnse.successResponse(
      res,
      200,
      "Cart fetched successfully",
      cart.item.map((item) => ({
        productId: item._id,
        productDetail: item.product,
        quantity: item.quantity,
      }))
    );



  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

module.exports = router;

// API update sản phẩm giỏ hàng

router.patch("/update", authenticateToken, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const userId = await req.user.userId;
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [
          {
            productId,
            quantity,
          },
        ],
      });
    } else {
      const itemIndex = cart.item.findIndex(
        (item) => item.product.toString() === productId
      );
      if (itemIndex > -1) {
        cart.item[itemIndex].quantity = quantity;
      } else {
        cart.item.push({ productId, quantity });
      }
    }

    const updateCart = await cart.save();
    BaseResopnse.successResponse(
      res,
      200,
      "Cart updated successfully",
      updateCart
    );
  } catch (error) {
    console.log(error);
    BaseResopnse.errorResponse(res, 500, error);
  }
});

// Api xóa sản phẩm giỏ hàng

router.delete("/delete/:productId", authenticateToken, async (req, res) => {
  const { productId } = req.params;
  try {
    const userId = await req.user.userId;
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return BaseResopnse.errorResponse(res, 404, "Cart not found");
    }

    const itemIndex = cart.item.findIndex(
      (item) => item.product.toString() === productId
    );

    cart.item.splice(itemIndex, 1);

    const updatedCart = await cart.save();

    BaseResopnse.successResponse(
      res,
      200,
      "Product deleted from cart",
      updatedCart
    );

    // Kiểm tra tồn kho sản phẩm
    const product = await Shop.findById(productId);
    if (product) {
      product.info.stock +=  updatedCart.item[itemIndex].quantity;;
      await product.save();
    }

  } catch (error) {
    console.log(error);
    BaseResopnse.errorResponse(res, 500, error);
  }
});


router.post("/purchase", authenticateToken, async (req, res) => {
  try {
    const { address, phoneNumber } = req.body;
    const userId = await req.user.userId;

    // Kiểm tra đầu vào
    if (!address || !phoneNumber) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Tìm giỏ hàng của người dùng
    const cart = await Cart.findOne({ userId }).populate("item.product");
    if (!cart || cart.item.length === 0) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    // Kiểm tra tồn kho sản phẩm và cập nhật stock
    for (const item of cart.item) {
      const product = await Shop.findById(item.product).populate();

      if (product.info.stock < item.quantity) {
        return res.status(400).json({
          message: `Product ${product.info.name} does not have enough stock`,
        });
      }

      // Cập nhật số lượng tồn kho
      product.info.stock -= item.quantity;
      await product.save();
    }

    // Tạo đơn hàng
  
    const newOrder = new Order({
      userId,
      items: cart.item.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
        price: item.product.info.price,
      })),
      address,
      phoneNumber,
      status: "Pending",
    });


    console.log(newOrder);
    

    // Lưu đơn hàng
    await newOrder.save();

    // Xóa giỏ hàng sau khi mua
    cart.item = [];
    await cart.save();


    BaseResopnse.successResponse(
      res, 200, "Purchase successful",newOrder
    )

    // res.status(200).json({
    //   message: "Purchase successful",
    //   order: newOrder,
    // });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});



router.get("/purchase_history", authenticateToken, async (req, res) => {
  try {
    // Lấy userId từ token
    const userId = await req.user.userId;

    const orders = await Order.find({ userId })
    .populate("userId", "username email")
      .populate("items.productId") 
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    // Trả về danh sách đơn hàng
    res.status(200).json({
      message: "Order history retrieved successfully",
     orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});



// Middleware xác thực token
async function authenticateToken(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    console.log(err);

    res.status(403).json({ message: "Invalid or expired token." });
  }
}

module.exports = router;
