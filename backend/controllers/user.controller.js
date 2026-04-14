import User from "../models/User.model.js"

export const searchUsers = async (req, res) => {
  try {
    let { search } = req.query;
    const currentUserId = req.user.id;

    if (!search || typeof search !== "string") {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    search = search.trim();

    if (search.length < 2) {
      return res.status(400).json({
        message: "Search must be at least 2 characters",
      });
    }

    if (search.length > 20) {
      return res.status(400).json({
        message: "Search too long",
      });
    }

    const escapeRegex = (text) => {
      return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    const safeSearch = escapeRegex(search);

    const users = await User.find({
      username: { $regex: safeSearch, $options: "i" },
      _id: { $ne: currentUserId },
    })
      .select("-password -otp -otpExpiry -loginAttempts -lockUntil")
      .limit(10);

    res.json(users);
  } catch (error) {
    console.error("Search Error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};