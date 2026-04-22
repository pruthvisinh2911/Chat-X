import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },

  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },

  password: {
    type: String,
    required: true,
    select: false, // 🔒 hide by default
  },

  profilePic: {
    type: String,
    default: "",
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  otp: {
    type: String,
    default: null,
    select: false, // 🔒 sensitive
  },

  otpExpiry: {
    type: Date,
    default: null,
  },

  otpAttempts: {
    type: Number,
    default: 0,
  },

  loginAttempts: {
    type: Number,
    default: 0,
  },

  lockUntil: {
    type: Date,
    default: null,
  },

  // 🔥 PASSWORD RESET
  resetPasswordToken: {
    type: String,
    default: null,
    select: false, // 🔒 hide token
  },

  resetPasswordExpiry: {
    type: Date,
    default: null,
    index: true, // ⚡ helps with cleanup queries
  },

},
{
  timestamps: true,
});

// Optional: auto cleanup expired reset tokens (TTL)
userSchema.index(
  { resetPasswordExpiry: 1 },
  { expireAfterSeconds: 0 }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;