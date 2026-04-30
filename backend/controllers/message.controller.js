import Message from "../models/message.model.js";
import Request from "../models/request.model.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id; // ✅ FIXED
    const receiverId = req.params.userId;
    const { content } = req.body;

    if (!content || typeof content !== "string") {
      return res.status(400).json({
        message: "Message content is required",
      });
    }

    if (senderId === receiverId) {
      return res.status(400).json({
        message: "You cannot send message to yourself",
      });
    }

    const members = [senderId, receiverId].sort(); // ✅ FIXED

    const relation = await Request.findOne({ members }); // ✅ FIXED

    if (!relation) {
      return res.status(403).json({
        message: "You can only message friends",
      });
    }

    if (relation.status === "blocked") {
      return res.status(403).json({
        message: "User is blocked",
      });
    }

    if (relation.status !== "accepted") {
      return res.status(403).json({
        message: "You can only message friends",
      });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
    });

    return res.status(201).json({
      message: "Message sent",
      data: message,
    });

  } catch (error) {
    console.error("send message error", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const members = [currentUserId, otherUserId].sort();

    const relation = await Request.findOne({ members });

    if (!relation) {
      return res.status(403).json({
        message: "You can only view chats with friends",
      });
    }

    if (relation.status === "blocked") {
      return res.status(403).json({
        message: "User is blocked",
      });
    }

    if (relation.status !== "accepted") {
      return res.status(403).json({
        message: "You can only view chats with friends",
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
      isDeleted: false,
    }).sort({ createdAt: 1 }); // oldest → newest

    return res.json({
      messages,
    });

  } catch (error) {
    console.error("get messages error", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const markAsSeen = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const result = await Message.updateMany(
      {
        sender: otherUserId,
        receiver: currentUserId,
        seen: false,
      },
      {
        $set: { seen: true },
      }
    );

    return res.json({
      message: "Messages marked as seen",
      updated: result.modifiedCount,
    });

  } catch (error) {
    console.error("mark seen error", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};