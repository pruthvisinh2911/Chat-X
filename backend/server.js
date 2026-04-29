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
import requestRoutes from "./routes/request.routes.js";


connectDB();

const app = express();

app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", requestRoutes);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Chat X API is Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});