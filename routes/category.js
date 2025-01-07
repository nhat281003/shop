const express = require("express");
const router = express.Router();
const Category = require("../models/category");

router.get("/", async (req, res) => {
  console.log(res.body);

  try {
    const categories = await Category.find();
    res.status(200).json({
        success: true,
        data: categories,
        message: "Categories fetched successfully",
    });
  } catch (err) {
    console.log(err.message);

    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  const category = new Category({
    name: req.body.name,
  });
  try {
    const newCategory = await category.save();
    res.status(201).json({
        success: true,
        data: newCategory,
        message: "Category created successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
