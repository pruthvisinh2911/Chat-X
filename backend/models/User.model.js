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
    },

    profilePic: {
      type: String,
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // 🔐 OTP SYSTEM
    otp: {
      type: String,
    },

    otpExpiry: {
      type: Date,
    },

    otpAttempts: {
      type: Number,
      default: 0,
    },

    // 🔐 LOGIN SECURITY
    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String
}
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;