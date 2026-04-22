import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 Prevent duplicate requests
requestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

// 🔥 Prevent self-request
requestSchema.pre("save", function (next) {
  if (this.senderId.equals(this.receiverId)) {
    return next(new Error("You cannot send request to yourself"));
  }
  next();
});

const Request = mongoose.models.Request || mongoose.model("Request", requestSchema);

export default Request;