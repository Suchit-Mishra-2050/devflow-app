import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const MONGO_URL = process.env.MONGODB_URI;

    await mongoose.connect(MONGO_URL);

    console.log("MongoDb is Connected successfully");
  } catch (error) {
    console.log("MongoDB Connection error", error.message);
  }
};

export default connectDB;
