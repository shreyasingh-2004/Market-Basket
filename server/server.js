import dotenv from 'dotenv';
dotenv.config();

import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
// import dotenv from 'dotenv';
import userRouter from './routes/UserRoute.js';
import sellerRouter from './routes/SellerRoute.js';
import { connectCloudinary } from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';


const app = express();
const PORT = process.env.PORT || 4000;


try {
    await connectDB();
    await connectCloudinary();
} catch (err) {
    console.error('Failed to connect to database:', err?.message || err);
}

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map(origin => origin.trim());
// middleware config
app.use(express.json());
app.use(cookieParser());
// simple request logger for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.get('/', (req, res) => res.send("API is running...."));
app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);
console.log('Routes registered: /api/order should handle POST /stripe');

// 404 handler for unknown routes
app.use((req, res) => {
    console.warn('Unhandled request', req.method, req.originalUrl);
    res.status(404).json({ success: false, message: 'Not Found' });
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});