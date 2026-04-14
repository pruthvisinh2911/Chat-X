import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected!");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB runtime error:", err);
    });

  } catch (error) {
    console.error("DB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;