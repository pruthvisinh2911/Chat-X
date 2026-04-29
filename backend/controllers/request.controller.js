import Request from "../models/request.model.js";

export const sendRequest = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.userId;

    if (currentUserId === targetUserId) {
      return res.status(400).json({
        message: "You cannot send request to yourself",
      });
    }

    const members = [currentUserId, targetUserId].sort();


    const existing = await Request.findOne({ members });

    if (existing) {
      return res.status(400).json({
        message: `Request already exists (${existing.status})`,
      });
    }

    const request = await Request.create({
      members,
      status: "pending",
      requestedBy: currentUserId,
    });

    return res.status(201).json({
      message: "Request sent",
      request,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const requestId = req.params.id;

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Request already handled",
      });
    }

    if (request.requestedBy.toString() === currentUserId) {
      return res.status(403).json({
        message: "You cannot accept your own request",
      });
    }

    request.status = "accepted";

    await request.save();

    return res.json({
      message: "Request accepted",
      request,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};
export const rejectRequest = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const requestId = req.params.id;

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Request already handled",
      });
    }

    if (request.requestedBy.toString() === currentUserId) {
      return res.status(403).json({
        message: "You cannot reject your own request",
      });
    }

    await request.deleteOne();

    return res.json({
      message: "Request rejected",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const blockUser = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.userId;

    if (currentUserId === targetUserId) {
      return res.status(400).json({
        message: "You cannot block yourself",
      });
    }

    const members = [currentUserId, targetUserId].sort();

    let request = await Request.findOne({ members });

    if (!request) {
      request = await Request.create({
        members,
        status: "blocked",
        blockedBy: currentUserId,
      });
    } else {
      request.status = "blocked";
      request.blockedBy = currentUserId;
      await request.save();
    }

    return res.json({
      message: "User blocked",
      request,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};  