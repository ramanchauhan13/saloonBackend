// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, required: true },
  whatsapp: { type: String },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ["customer", "salon_owner", "independent_beautician", "super_admin"],
    default: "customer"
  },
  status: { type: String, enum: ["active", "blocked"], default: "active" },
  resetPasswordOTP: { type: String },
  resetPasswordExpire: { type: Date },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
