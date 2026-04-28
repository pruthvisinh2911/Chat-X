import rateLimit from "express-rate-limit";

const rateLimitConfig = {
  standardHeaders: true, 
  legacyHeaders: false,  
};

export const loginLimiter = rateLimit({
  ...rateLimitConfig,
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts, try again later.",
  },
});

export const otpLimiter = rateLimit({
  ...rateLimitConfig,
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many OTP attempts, try again later.",
  },
});

export const forgotPasswordLimiter = rateLimit({
  ...rateLimitConfig,
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many requests, try later.",
  },
});