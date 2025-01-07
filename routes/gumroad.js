const express = require("express");
const router = express.Router();
const Gumroad = require("../models/gumroad");

router.get("/", async (req, res) => {
  try {
    const gumroads = await Gumroad.find();
    res.json(gumroads);
  } catch (err) {
    res.status(400).json({ message: err.message });

  }
});

router.get("/:id", getGumroad, (req, res) => {
  res.json(res.gumroad);
});

router.post("/", async (req, res) => {
  const gumroad = new Gumroad({
    name: req.body.name,
    price: req.body.price,
  });
  try {
    const newGumroad = await gumroad.save();
    res.status(201).json(newGumroad);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch("/:id", getGumroad, async (req, res) => {
  if (req.body.name != null) {
    res.gumroad.name = req.body.name;
  }
  if (req.body.price != null) {
    res.gumroad.price = req.body.price;
  }
  try {
    const updatedGumroad = await res.gumroad.save();
    res.json(updatedGumroad);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", getGumroad, async (req, res) => {
  try {
    await res.gumroad.deleteOne();
    res.json({ message: "Delete gumroad successful!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

async function getGumroad(req, res, next) {
  let gumroad;
  try {
    gumroad = await Gumroad.findById(req.params.id);
    if (gumroad == null) {
      return res.status(404).json({ message: "Cannot find gumroad" });
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  res.gumroad = gumroad;
  next();
}

module.exports = router;
