import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true, // 🔥 faster lookups
  },

  refreshToken: {
    type: String,
    required: true,
  },

  deviceInfo: {
    type: String,
    default: "unknown",
  },

  ipAddress: {
    type: String,
    default: "",
  },

  isValid: {
    type: Boolean,
    default: true,
    index: true, // 🔥 important for queries
  },

  expiresAt: {
    type: Date,
    required: true,
  },
},
{
  timestamps: true,
}
);

// 🔥 Auto-delete expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 🔥 Prevent duplicate active sessions with same token (extra safety)
sessionSchema.index({ userId: 1, refreshToken: 1 });

const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);

export default Session;