import express from "express";
import { validate } from "../middleware/validate.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

import {
  registerUser,
  verifyOtp,
  loginUser,
  logoutUser,
  logoutAllDevices,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

import {
  registerValidation,
  loginValidation,
  verifyOtpValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} from "../validators/auth.validator.js";

import { loginLimiter,
  otpLimiter,
  forgotPasswordLimiter
 } from "../middleware/ratelimit.middleware.js";

const router = express.Router();

router.post(
  "/register",
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
  "/login",
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
  loginLimiter,
  resetPasswordValidation,
  validate,
  resetPassword
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
export default router;