import { body } from "express-validator";

const usernameRegex = /^[a-z0-9_]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

export const registerValidation = [
  body("firstName")
    .isString().withMessage("First name must be string")
    .isLength({ min: 2 }).withMessage("First name too short")
    .trim(),

  body("lastName")
    .isString().withMessage("Last name must be string")
    .isLength({ min: 2 }).withMessage("Last name too short")
    .trim(),

  body("username")
    .isString()
    .matches(usernameRegex).withMessage("Invalid username format")
    .isLength({ min: 3, max: 20 })
    .trim()
    .toLowerCase(),

  body("email")
    .isEmail().withMessage("Invalid email")
    .normalizeEmail(),

  body("password")
    .matches(passwordRegex)
    .withMessage("Weak password"),
];

export const loginValidation = [
  body("password")
    .notEmpty().withMessage("Password required"),

  body()
    .custom((value) => {
      if (!value.email && !value.username) {
        throw new Error("Email or Username required");
      }
      return true;
    }),
];

export const verifyOtpValidation = [
  body("email").isEmail(),
  body("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits"),
];

export const forgotPasswordValidation = [
  body("email")
    .isEmail()
    .withMessage("Valid email required"),
];

export const resetPasswordValidation = [
  body("token")
    .notEmpty().withMessage("Token required"),

  body("newPassword")
    .matches(passwordRegex)
    .withMessage("Weak password"),

  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];