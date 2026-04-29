import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    status: {
      type: String,
      enum: ["pending", "accepted", "blocked"],
      required: true,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

requestSchema.index({ members: 1 }, { unique: true });

const Request =
  mongoose.models.Request ||
  mongoose.model("Request", requestSchema);

export default Request;