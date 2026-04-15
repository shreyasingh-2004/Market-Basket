import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./configs/db.js";
import { connectCloudinary } from "./configs/cloudinary.js";

// Routes
import userRouter from "./routes/UserRoute.js";
import sellerRouter from "./routes/SellerRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import addressRouter from "./routes/addressRoute.js";
import orderRouter from "./routes/orderRoute.js";

const app = express();
const PORT = process.env.PORT || 4000;

/* ---------------- CORS ---------------- */
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(origin => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

/* ---------------- MIDDLEWARES ---------------- */
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

/* ---------------- HEALTH CHECK ---------------- */
app.get("/", (req, res) => {
  res.send("API is running...");
});

/* ---------------- ROUTES ---------------- */
app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);

/* ---------------- 404 ---------------- */
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not Found" });
});

/* ---------------- START SERVER ---------------- */
const startServer = async () => {
  try {
    await connectDB();
    await connectCloudinary();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err.message);
    process.exit(1);
  }
};

startServer();
