import express from "express";
import {
  registerUser,
  verifyOtp,
  loginUser,
  logoutUser,
  logoutAllDevices
} from "../controllers/auth.controller.js";


import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Register new user
router.post("/register", registerUser);

// Verify OTP
router.post("/verify-otp", verifyOtp);

// Login user (creates JWT + session)
router.post("/login", loginUser);

// Logout current session
router.post("/logout", protect, logoutUser);

// Logout from all devices
router.post("/logout-all", protect, logoutAllDevices);

// Test protected route (profile)
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Profile fetched successfully",
    user: req.user,
  });
});

export default router;