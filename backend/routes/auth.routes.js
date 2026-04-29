import express from "express";
import { validate } from "../middleware/validate.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

import {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  logoutUser,
  logoutAllDevices,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  getMySessions,
  logoutSingleSession,
  getMyAuditLogs
} from "../controllers/auth.controller.js";

import {
  registerValidation,
  loginValidation,
  verifyOtpValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} from "../validators/auth.validator.js";

import {
  loginLimiter,
  otpLimiter,
  forgotPasswordLimiter
} from "../middleware/ratelimit.middleware.js";

const router = express.Router();

router.post(
  "/register",
  loginLimiter, 
  registerValidation,
  validate,
  registerUser
);

router.post(
  "/verify-otp",
  otpLimiter,
  verifyOtpValidation,
  validate,
  verifyOtp
);

router.post(
  "/resend-otp",
  otpLimiter,
  resendOtp
);

router.post(
  "/login",
  loginLimiter, 
  loginValidation,
  validate,
  loginUser
);

router.post(
  "/logout",
  protect,
  logoutUser
);

router.post(
  "/logout-all",
  protect,
  logoutAllDevices
);

router.post(
  "/refresh-token",
  refreshAccessToken
);

router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  forgotPasswordValidation,
  validate,
  forgotPassword
);

router.post(
  "/reset-password",
  resetPasswordValidation, 
  validate,
  resetPassword
);

router.get("/sessions", protect, getMySessions);

router.post(
  "/logout-session",
  protect,
  logoutSingleSession
);

router.get(
  "/profile",
  protect,
  (req, res) => {
    res.json({
      message: "Profile fetched successfully",
      user: req.user,
    });
  }
);

router.get("/audit-logs", protect, getMyAuditLogs);

export default router;