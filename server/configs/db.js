import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // log when the underlying mongoose connection emits 'connected'
    mongoose.connection.on('connected', () => console.log('Database connected'));
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not set in environment');
    await mongoose.connect(`${uri}/MarketBasket`, {
      // recommended options are enabled by default in Mongoose v6+
    });
  } catch (error) {
    console.error('MongoDB connection error:', error.message || error);
    throw error; // rethrow so caller can handle it
  }
};

export default connectDB;