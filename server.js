require("dotenv").config();

const express = require("express");
const cors = require('cors');
const app = express();
const mongoose = require("mongoose");


const PORT = 8080;

// Lắng nghe trên 0.0.0.0 để cho phép mọi IP truy cập
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://192.168.1.240:${PORT}`);
});

mongoose.connect(process.env.MONGO_DB);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("db connected"));

app.use(express.json());
app.use(cors());

const userRouter = require("./routes/user");
app.use("/user", userRouter);

const gumroadRouter = require("./routes/gumroad");
app.use("/gumroad", gumroadRouter);

const shopRouter = require("./routes/shop");
app.use("/product", shopRouter);

const categoryRouter = require("./routes/category");
app.use("/category", categoryRouter);




const cartRouter = require("./routes/cart");
app.use("/cart", cartRouter);

app.listen(3000, () => console.log("3000 listening..."));
