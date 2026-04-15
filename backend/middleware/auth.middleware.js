import jwt from "jsonwebtoken";
import Session from "../models/session.model.js";
import User from "../models/User.model.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Extract token
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

    // 2. Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    // 3. Find session (VERY IMPORTANT SECURITY CHECK)
    const session = await Session.findOne({
      token,
      userId: decoded.id,
      isValid: true,
    });

    if (!session) {
      return res.status(401).json({
        message: "Session expired or invalid",
      });
    }

    // 4. Get user safely
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // 5. Attach full user context (better than only id)
    req.user = {
      id: user._id,
      email: user.email,
      username: user.username,
      sessionId: session._id,
    };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      message: "Not authorized",
    });
  }
};