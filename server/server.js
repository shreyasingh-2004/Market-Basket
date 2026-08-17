import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

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

/* ---------------- CORS CONFIGURATION ---------------- */
const isProduction = process.env.NODE_ENV === 'production';

// Define allowed origins based on environment
const allowedOrigins = isProduction
  ? (process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0)
  : [
      'http://localhost:5173',
      'http://localhost:3000', 
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://localhost:4000'
    ];

// Add production origins if they exist in development
if (!isProduction && process.env.ALLOWED_ORIGINS) {
  const prodOrigins = process.env.ALLOWED_ORIGINS
    .split(",")
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);
  allowedOrigins.push(...prodOrigins);
}

// Validate CORS configuration in production
if (isProduction && allowedOrigins.length === 0) {
  console.error('❌ ERROR: ALLOWED_ORIGINS not set in production!');
  console.error('Please set ALLOWED_ORIGINS environment variable.');
  process.exit(1);
}

console.log(`🔒 CORS allowed origins (${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}):`, allowedOrigins);

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow requests with no origin (like mobile apps, curl, etc.)
  if (!origin) {
    return next();
  }
  
  // Check if origin is allowed
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Cookie');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
  } else {
    console.log(`❌ CORS blocked: ${origin} (not in allowed list)`);
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    if (allowedOrigins.includes(origin)) {
      return res.sendStatus(200);
    } else {
      return res.status(403).json({
        success: false,
        message: 'CORS policy: Origin not allowed'
      });
    }
  }
  
  next();
});

// Fallback CORS using cors package (for compatibility)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200
  })
);

/* ---------------- MIDDLEWARES ---------------- */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      console.log('  Body: multipart/form-data');
    } else {
      const bodyPreview = req.body ? JSON.stringify(req.body).substring(0, 200) : '{}';
      console.log('  Body:', bodyPreview);
    }
  }
  next();
});

// Error handling middleware for CORS
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    console.error(`❌ CORS Error: ${err.message}`);
    return res.status(403).json({
      success: false,
      message: 'CORS policy: Origin not allowed'
    });
  }
  next(err);
});

/* ---------------- HEALTH CHECK ---------------- */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running...",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/* ---------------- ROUTES ---------------- */
app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);

/* ---------------- 404 HANDLER ---------------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl
  });
});

/* ---------------- GLOBAL ERROR HANDLER ---------------- */
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: err.errors
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate key error',
      field: Object.keys(err.keyPattern)[0]
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

/* ---------------- START SERVER ---------------- */
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Connect to Cloudinary
    await connectCloudinary();
    console.log('✅ Cloudinary connected successfully');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`🔗 http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔒 CORS allowed origins: ${allowedOrigins.join(', ')}`);
      console.log(`\n📚 Available endpoints:`);
      console.log(`  - GET  /`);
      console.log(`  - GET  /health`);
      console.log(`  - POST /api/user/register`);
      console.log(`  - POST /api/user/login`);
      console.log(`  - GET  /api/product/list`);
      console.log(`  - and more...\n`);
    });
  } catch (err) {
    console.error('❌ Startup error:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

startServer();
