import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/error.middleware.js";

connectDB();

const app = express();

app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(express.json());

// ✅ Routes (with route-level rate limiting inside)
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// ✅ Error handler should be LAST
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Chat X API is Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});