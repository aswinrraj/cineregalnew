import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/cineregal';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });

    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.warn(`\n[MongoDB] Warning: Could not connect to MongoDB at ${uri}.`);
    console.warn(`[MongoDB] Error: ${error.message}`);
    console.warn(`[MongoDB] To use MongoDB persistence:`);
    console.warn(`  1. Install and start local MongoDB (mongod), OR`);
    console.warn(`  2. Set MONGO_URI in backend/.env with your MongoDB Atlas connection string.`);
    console.warn(`[MongoDB] The backend will continue running with fallback mock responses for API readiness.\n`);
    return null;
  }
};

export const getDBStatus = () => isConnected;

export default connectDB;
