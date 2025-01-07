const express = require("express");
const router = express.Router();
const User = require("../models/user");
const BaseResopnse = require("../base_reponse/response");
const jwt = require('jsonwebtoken');

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
  });
  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});



router.post("/register", async (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
  });

  if (user.username == "" || user.email == "") {
    return BaseResopnse.errorResponse(
      res,
      500,
      "Please provide both username and password.",
      res.errorResponse
    );
  }

  if (user.password.length < 8) {
    return BaseResopnse.errorResponse(
      res,
      500,
      "Password must have at least 8 characters",
      res.errorResponse
    );
  }

  try {
    const newUser = await user.save();
    return BaseResopnse.successResponse(res, 200, "Register Success", newUser);
  } catch (error) {
    console.log(error);
    
    return BaseResopnse.errorResponse(
      res,
      500,
      "Register Error",
      res.errorResponse
    );
  }
});




router.post("/login", async (req, res) => {

  const userLogin = new User({
    username: req.body.username,
    password: req.body.password,

  });



  try {
    if(!userLogin.username || !userLogin.password) {
      return BaseResopnse.errorResponse(
        res,
        500,
        "Please provide both username and password.",
        res.errorResponse
      );
  
    }
    
    const user = await User.findOne({username : userLogin.username, password : userLogin.password});
  
  
    if(!user){
      return BaseResopnse.errorResponse(
        res,
        401,
        "user not avaliable",
        res.errorResponse
      );
    }

      // Tạo token
      const token = jwt.sign(
        { 
          userId: user._id,
          username: user.username
        },
        process.env.JWT_SECRET, // Thêm JWT_SECRET vào file .env
        { expiresIn: '24h' } // Token hết hạn sau 24h
      );
  
  
    return BaseResopnse.successResponse(res, 200, "Login Success", {
      token,
      user
    });
  } catch (error) {
    console.log(error);
    
    return BaseResopnse.errorResponse(res, 500, "Login Error", error);
  }


})

module.exports = router;
