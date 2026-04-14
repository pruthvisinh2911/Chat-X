import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import helmet from "helmet";
import { authLimiter } from "./middleware/ratelimit.middleware.js";
import connectDB from "./config/db.js"
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"

dotenv.config()
connectDB()

const app = express();

app.use(helmet());
app.use(cors())
app.use(express.json())
app.use("/api/auth",authRoutes)
app.use("/api/users",userRoutes)
app.use("/api/auth", authLimiter);


app.get("/",(req,res)=>{
    res.send("Chat X API is Running...")

  })

    const PORT = process.env.PORT || 5000

    app.listen(PORT,()=>{
        console.log(`server is running on port ${PORT}`)
  
})