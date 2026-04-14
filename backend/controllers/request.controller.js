import Request from "../models/request.model.js";

export const acceptRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.receiverId.toString() !== userId) {
      return res.status(403).json({
        message: "Not authorized to accept this request",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Request already handled",
      });
    }

    request.status = "accepted";
    await request.save();

    res.json({
      message: "Request accepted",
    });
  } catch (error) {
    console.error("Accept Request Error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};