import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true, 
  },

  refreshToken: {
    type: String,
    required: true,
    select: false, 
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
    index: true, 
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

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

sessionSchema.index({ userId: 1, refreshToken: 1 });

// sessionSchema.index({ userId: 1, isValid: 1 });

const Session =
  mongoose.models.Session ||
  mongoose.model("Session", sessionSchema);

export default Session;