const express = require("express");
const router = express.Router();
const Shop = require("../models/shop");
const BaseResopnse = require("../base_reponse/response");


// lấy danh sách sản phẩm
router.get("/", async (req, res) => {
  const { categoryId, name } = req.query;

  try {
    const filter = {};

    if (categoryId) {
      filter["category.categoryId"] = categoryId;
    }

    if (name) {
      filter["list.name"] = { $regex: name, $options: "i" };
    }

    const shops = await Shop.find(filter).populate("category.categoryId");
    res.status(200).json({
        success: true,
        data: shops,
        messages: "Product find success"
    });
  } catch (e) {
    console.log(e.message);

    res.status(500).json({ message: error.message ?? "" });
  }

  
});


// thêm sp
router.post("/", async (req, res) => {
  console.log(req.body);
  const shop = new Shop({
    category: req.body.category,
    list: req.body.list,
  });

  try {
    const newProduct = await shop.save();
    res.status(200).send({
        success: true,
        data: newProduct,
        messages: "Product added successfully"
    });
  } catch (error) {
    res.status(400).json({ message: error.message ?? "" });
  }
});


//update sp
router.patch("/update/:id",getShop ,async (req, res) => {

  if (req.body.category != null) {
    res.shop.category = req.body.category;
  }

  if (req.body.list != null) {
    res.shop.list = req.body.list;
  }

  try {
    const updatedShop = await res.shop.save();
    BaseResopnse.successResponse(res,200,"Update Success",updatedShop); 
  } catch (err) {
    console.log(err);
    
    BaseResopnse.errorResponse(res, 500, "Update Error",err);
  }
});



// xóa sp
router.delete("/delete/:id", getShop, async (req, res) => {
  try {
    await res.shop.deleteOne();
    BaseResopnse.successResponse(res, 200, "Delete Success");
  } catch (err) {
    console.log(err);
    BaseResopnse.errorResponse(res, 500, "Delete Error", err);
  }
});



// chi tiết sp
router.get("/detail/:productId", async (req, res) => {
    console.log(req.body);
  
    const { productId } = req.params;
  
    try {
      const detailProducts = await Shop.findById(productId);
      if (!detailProducts) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json({
          success: true,
          message: "Product found successfully",
          data: detailProducts
      });
    
      
    } catch (error) {
      console.error(error); // Log lỗi để debug
      res.status(500).send("Server error");
    }
  });







async function getShop(req, res, next) {
    console.log(req);
    
  try {    
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).send("Cannot find product");
    res.shop = shop;
    next();
  } catch (error) {
 
    res.status(500).send("Server error");
  }
}

module.exports = router;
