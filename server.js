require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_DB);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("db connected"));

app.use(express.json());

const userRouter = require("./routes/user");
app.use("/user", userRouter);

const gumroadRouter = require("./routes/gumroad");
app.use("/gumroad", gumroadRouter);

const shopRouter = require("./routes/shop");
app.use("/product", shopRouter);

const categoryRouter = require("./routes/category");
app.use("/category", categoryRouter);


app.listen(3000, () => console.log("3000 listening..."));
