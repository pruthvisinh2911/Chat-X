import express from "express"

import { registerUser , loginUser , verifyOtp} from "../controllers/auth.controller.js"

import { protect } from "../middleware/auth.middleware.js"

const router = express.Router();

router.post("/register",registerUser)
router.post("/login",loginUser)
router.post("/verify-otp",verifyOtp)

router.get("/profile", protect , (req,res)=>{
    res.json({
        message:"Protected route accessed",
        user:req.user,
    })
})
export default router;