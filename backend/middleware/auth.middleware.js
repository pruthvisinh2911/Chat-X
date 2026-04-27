import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Session from "../models/Session.model.js";
export const protect = async (req, res, next) => {

    let token;

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

    let decoded;

  decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("DECODED:", decoded);

  console.log("JWT ERROR:", err.message); 
  return res.status(401).json({
    message: "Invalid or expired token",
  });
}
    const session = await Session.findOne({
      _id: decoded.sessionId,
      userId: decoded.id,
      isValid: true,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(401).json({
        message: "Session expired, please login again",
      });
    }

    console.log("TOKEN:", token);
console.log("SECRET:", process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = {
      id: user._id,
      email: user.email,
      username: user.username,
    };

    next();

    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      message: "Not authorized",
    });
  
