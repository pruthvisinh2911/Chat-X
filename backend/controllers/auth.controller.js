import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import ApiError from "../utils/ApiError.utils.js";
import Session from "../models/session.model.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto";
import { sendOtpEmail } from "../utils/sendEmail.utils.js";
import AuditLog from "../models/AuditLog.model.js";
import mongoose from "mongoose";

export const registerUser = async (req, res) => {
  try {
    let { firstName, lastName, username, email, password } = req.body;

    // 🔹 Basic validation
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({ message: "Invalid input format" });
    }

    // 🔹 Normalize
    firstName = firstName.trim();
    lastName = lastName.trim();
    username = username.trim().toLowerCase();
    email = email.trim().toLowerCase();

    // 🔹 Validations
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({
        message: "Username must be between 3 and 20 characters",
      });
    }

    if (firstName.length < 2 || lastName.length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters",
      });
    }

    const usernameRegex = /^[a-z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        message: "Username can only contain letters, numbers, underscore",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include letter, number and special character",
      });
    }

    // ✅ 🔥 FIXED: separate checks
    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });

    const hashedPassword = await bcrypt.hash(password, 12);

    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(rawOtp, 10);

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const verificationExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 🔥 EMAIL EXISTS
    if (existingEmail) {
      // ✅ VERIFIED → BLOCK
      if (existingEmail.isVerified) {
        return res.status(409).json({
          message: "User already exists. Please login.",
        });
      }

      // 🔥 EXPIRED → DELETE
      if (
        existingEmail.verificationExpiresAt &&
        existingEmail.verificationExpiresAt < new Date()
      ) {
        await User.deleteOne({ _id: existingEmail._id });
      } else {
        // 🔁 RESEND OTP
        existingEmail.firstName = firstName;
        existingEmail.lastName = lastName;
        existingEmail.username = username;
        existingEmail.password = hashedPassword;
        existingEmail.otp = hashedOtp;
        existingEmail.otpExpiry = otpExpiry;
        existingEmail.otpAttempts = 0;
        existingEmail.verificationExpiresAt = verificationExpiresAt;

        await existingEmail.save();
        await sendOtpEmail(email, rawOtp);

        return res.status(200).json({
          message: "OTP resent. Please verify your email.",
          userId: existingEmail._id,
        });
      }
    }

    // 🔥 USERNAME EXISTS (ONLY IF EMAIL IS NEW)
    if (existingUsername) {
      return res.status(409).json({
        message: "Username already taken",
      });
    }

    // 🔥 CREATE NEW USER
    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      otp: hashedOtp,
      otpExpiry,
      otpAttempts: 0,
      isVerified: false,
      verificationExpiresAt,
    });

    await sendOtpEmail(email, rawOtp);

    return res.status(201).json({
      message: "Registration successful. Please verify your email.",
      userId: user._id,
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
export const refreshAccessToken = async (req, res) => {

    const oldRefreshToken = req.cookies?.refreshToken;

    if (!oldRefreshToken) {
      return res.status(401).json({
        message: "No refresh token",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        oldRefreshToken,
        process.env.JWT_REFRESH_SECRET
      );
    } catch (err) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const session = await Session.findById(decoded.sessionId);

    if (
      !session ||
      !session.isValid ||
      session.expiresAt < new Date()
    ) {
      return res.status(401).json({
        message: "Session expired",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      oldRefreshToken,
      session.refreshToken
    );
 
    if (!isMatch) {
      await Session.updateMany(
        { userId: session.userId },
        { isValid: false }
      );

      return res.status(403).json({
        message: "Token reuse detected. All sessions revoked.",
      });
    }

    const newAccessToken = jwt.sign(
      { id: user._id, sessionId: session._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { id: user._id, sessionId: session._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    session.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await session.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      accessToken: newAccessToken,
    });


    console.error("Refresh Token Error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  
};
export const verifyOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;

    // 🔹 Validation
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    if (typeof email !== "string" || typeof otp !== "string") {
      return res.status(400).json({
        message: "Invalid input",
      });
    }

    email = email.trim().toLowerCase();
    otp = otp.trim();

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        message: "Invalid OTP format",
      });
    }

    // 🔹 Find user
    const user = await User.findOne({ email }).select("+otp");

    if (!user) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "User already verified",
      });
    }

    // 🔹 Check OTP existence
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        message: "OTP expired or already used",
      });
    }

    // 🔹 Expiry check
    if (user.otpExpiry < new Date()) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      return res.status(400).json({
        message: "OTP expired. Please request a new one",
      });
    }

    // 🔹 Attempts check
    if (user.otpAttempts >= 3) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      return res.status(400).json({
        message: "Too many attempts. Request new OTP",
      });
    }

    // 🔹 Compare OTP
    const isMatch = await bcrypt.compare(otp, user.otp);

    if (!isMatch) {
      user.otpAttempts += 1;
      await user.save();

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

await User.updateOne(
  { _id: user._id },
  {
    $set: {
      isVerified: true,
      otp: null,
      otpExpiry: null,
      otpAttempts: 0,
      verificationExpiresAt: null, 
    },
  }
);

    return res.status(200).json({
      message: "Email verified successfully",
    });

  } catch (error) {
    console.error("OTP Verify Error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
export const resendOtp = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email }).select("+otp +otpExpiry");

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    // ✅ FIX: correct last OTP sent time calculation
    if (user.otpExpiry) {
      const otpDuration = 10 * 60 * 1000; // 10 min
      const lastOtpTime = new Date(user.otpExpiry.getTime() - otpDuration);
      const now = new Date();

      if (now - lastOtpTime < 60 * 1000) {
        return res.status(400).json({
          message: "Please wait 60 seconds before requesting a new OTP",
        });
      }
    }

    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(rawOtp, 10);

    user.otp = hashedOtp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otpAttempts = 0;

    await user.save();

    await sendOtpEmail(email, rawOtp);

    console.log("OTP SENT:", rawOtp, "to", email);

    return res.status(200).json({
      message: "OTP resent successfully",
    });

  } catch (error) {
    console.error("Resend OTP Error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};
export const loginUser = async (req, res) => {

    let { email, username, password } = req.body;

    if ((!email && !username) || !password) {
      return res.status(400).json({
        message: "Email/Username and password are required",
      });
    }

    if (
      (email && typeof email !== "string") ||
      (username && typeof username !== "string") ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid input",
      });
    }

    if (email) email = email.trim().toLowerCase();
    if (username) username = username.trim().toLowerCase();

    const user = await User.findOne({
      $or: [{ email }, { username }],
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        message: "Account temporarily locked. Try later.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000;
      }

      await user.save();

      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first",
      });
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const ACCESS_SECRET = process.env.JWT_SECRET;
    const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

    if (!ACCESS_SECRET || !REFRESH_SECRET) {
      return res.status(500).json({
        message: "JWT secrets missing",
      });
    }

    const session = await Session.create({
      userId: user._id,
      refreshToken: "temp",
      deviceInfo: req.headers["user-agent"] || "unknown",
      ipAddress: req.ip,
      isValid: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const accessToken = jwt.sign(
      { id: user._id, sessionId: session._id },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, sessionId: session._id },
      REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    session.refreshToken = await bcrypt.hash(refreshToken, 10);
    await session.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

try {
  await AuditLog.create({
    userId: user._id,
    action: "LOGIN",
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });
} catch (err) {
  console.error("Audit log failed:", err.message);
}
    console.error("Login Error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  
};
export const forgotPassword = async (req, res) => {

    let { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        message: "Valid email is required",
      });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: "If this email exists, a reset link has been sent",
      });
    }

    const tokenId = crypto.randomBytes(16).toString("hex");
    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = await bcrypt.hash(rawToken, 10);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordTokenId = tokenId;
    user.resetPasswordExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await user.save();

    const combinedToken = `${tokenId}.${rawToken}`;

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${combinedToken}`;

    await sendOtpEmail(email, `Reset your password: ${resetLink}`);

    return res.status(200).json({
      message: "If this email exists, a reset link has been sent",
    });

  
    console.error("Forgot Password Error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  
};
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include letter, number and special character",
      });
    }

    const [tokenId, rawToken] = token.split(".");

    if (!tokenId || !rawToken) {
      return res.status(400).json({
        message: "Invalid token format",
      });
    }

    const user = await User.findOne({
      resetPasswordTokenId: tokenId,
      resetPasswordExpiry: { $gt: new Date() },
    }).select("+resetPasswordToken +password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    const isMatch = await bcrypt.compare(
      rawToken,
      user.resetPasswordToken
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;

    user.resetPasswordToken = null;
    user.resetPasswordTokenId = null;
    user.resetPasswordExpiry = null;

    await user.save();

    // ✅ CRITICAL SECURITY (already correct)
    await Session.updateMany(
      { userId: user._id },
      { isValid: false }
    );

    return res.status(200).json({
      message: "Password reset successful. Please login again.",
    });
try {
  await AuditLog.create({
    userId: user._id,
    action: "LOGIN",
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });
} catch (err) {
  console.error("Audit log failed:", err.message);
}
  } catch (error) {
    console.error("Reset Password Error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
export const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      userId: req.user.id,
      isValid: true,
      expiresAt: { $gt: new Date() },
    }).select("-refreshToken");

    return res.status(200).json({
      sessions,
    });

  } catch (error) {
    console.error("Get Sessions Error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};
export const logoutUser = async (req, res) => {
  
    const token =
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : null;

    if (!token) {
      return res.status(400).json({
        message: "No token provided",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    await Session.findByIdAndUpdate(decoded.sessionId, {
      isValid: false,
    });

    res.clearCookie("refreshToken");

    return res.status(200).json({
      message: "Logged out successfully",
    });
try {
  await AuditLog.create({
    userId: user._id,
    action: "LOGIN",
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });
} catch (err) {
  console.error("Audit log failed:", err.message);
}
    console.error("Logout Error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
};
export const logoutAllDevices = async (req, res) => {

    const userId = req.user.id;

    const result = await Session.updateMany(
      { userId, isValid: true },
      { isValid: false }
    );

    res.clearCookie("refreshToken");

    return res.status(200).json({
      message: "Logged out from all devices",
      sessionsRevoked: result.modifiedCount,
    });

try {
  await AuditLog.create({
    userId: user._id,
    action: "LOGIN",
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });
} catch (err) {
  console.error("Audit log failed:", err.message);
}
  
    console.error("Logout All Error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  
};
export const logoutSingleSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    await Session.findOneAndUpdate(
      {
        _id: sessionId,
        userId: req.user.id,
      },
      { isValid: false }
    );

    return res.status(200).json({
      message: "Session logged out successfully",
    });

  } catch (error) {
    console.error("Logout Single Error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};
export const getMyAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({ logs });
  } catch (error) {
    console.error("Audit Fetch Error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};