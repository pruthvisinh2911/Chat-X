import User from "../models/User.model.js";
import Session from "../models/session.model.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { sendOtpEmail } from "../utils/sendEmail.utils.js";


export const registerUser = async (req, res) => {
  try {
    let { firstName, lastName, username, email, password } = req.body;

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

    firstName = firstName.trim();
    lastName = lastName.trim();
    username = username.trim().toLowerCase();
    email = email.trim().toLowerCase();

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


    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });


    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = await bcrypt.hash(rawOtp, 10);

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

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
    });

    
    await sendOtpEmail(email, rawOtp);


    return res.status(201).json({
      message: "Registration successful. Please verify your email.",
      userId: user._id,
      otp:rawOtp,
    });

  } catch (error) {
    console.error("Register Error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


export const verifyOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;

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

    const user = await User.findOne({ email });

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

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        message: "OTP not found or already used",
      });
    }

    if (user.otpExpiry < new Date()) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      return res.status(400).json({
        message: "OTP expired",
      });
    }

    if (user.otpAttempts >= 3) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      return res.status(400).json({
        message: "Too many attempts. Request new OTP",
      });
    }

    const isMatch = await bcrypt.compare(otp, user.otp);

    if (!isMatch) {
      user.otpAttempts += 1;
      await user.save();

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;

    await user.save();

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

export const loginUser = async (req, res) => {
  try {
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
    });

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

    const accessToken = jwt.sign(
      { id: user._id },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    
    await Session.create({
      userId: user._id,
      refreshToken: hashedRefreshToken,
      deviceInfo: req.headers["user-agent"] || "unknown",
      ipAddress: req.ip,
      isValid: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

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

  } catch (error) {
    console.error("Login Error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        message: "No refresh token found",
      });
    }

    const sessions = await Session.find({ isValid: true });

    let sessionFound = false;

    for (const session of sessions) {
      const isMatch = await bcrypt.compare(
        refreshToken,
        session.refreshToken
      );

      if (isMatch) {
        session.isValid = false;
        await session.save();
        sessionFound = true;
        break;
      }
    }

    res.clearCookie("refreshToken");

    if (!sessionFound) {
      return res.status(400).json({
        message: "Session already invalid",
      });
    }

    return res.status(200).json({
      message: "Logged out successfully",
    });

  } catch (error) {
    console.error("Logout Error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
export const logoutAllDevices = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Session.updateMany(
      { userId, isValid: true },
      { isValid: false }
    );

    if (result.matchedCount === 0) {
      return res.status(400).json({
        message: "No active sessions found",
      });
    }

    return res.status(200).json({
      message: "Logged out from all devices",
      sessionsRevoked: result.modifiedCount,
    });

  } catch (error) {
    console.error("Logout All Error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};