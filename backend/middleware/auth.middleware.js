import jwt from "jsonwebtoken";
import Session from "../models/session.model.js";
import User from "../models/User.model.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // 🔹 Extract token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Not authorized, no token",
      });
    }

    // 🔹 Verify access token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    // 🔹 Check if user has ANY valid session
    const session = await Session.findOne({
      userId: decoded.id,
      isValid: true,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(401).json({
        message: "Session expired, please login again",
      });
    }

    // 🔹 Fetch user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // 🔹 Attach user
    req.user = {
      id: user._id,
      email: user.email,
      username: user.username,
    };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      message: "Not authorized",
    });
  }
};