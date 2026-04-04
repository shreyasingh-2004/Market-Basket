import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('Database connected');
      // Optional: Log which database you're using
      console.log('Using database:', mongoose.connection.db.databaseName);
    });
    
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not set in environment');
    
    await mongoose.connect(uri);
    
  } catch (error) {
    console.error('MongoDB connection error:', error.message || error);
    throw error;
  }
};

export default connectDB;