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
    enum: ["customer", "salon_owner", "independent_beautician", "admin"],
    default: "customer"
  },
  isVerified: { type: Boolean, default: false },
  governmentId: {
    type: {
      idType: { type: String, enum: ["Aadhaar", "PAN", "DL"] },
      idNumber: { type: String },
      idImageUrl: { type: String },
    },
    default: null,
  },
  resetPasswordOTP: { type: String },
  resetPasswordExpire: { type: Date },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
