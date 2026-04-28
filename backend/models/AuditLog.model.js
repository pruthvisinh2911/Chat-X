import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  action: {
    type: String,
    required: true,
  },
  ip: String,
  userAgent: String,
},
{ timestamps: true }
);

const AuditLog =
  mongoose.models.AuditLog ||
  mongoose.model("AuditLog", auditSchema);

export default AuditLog;