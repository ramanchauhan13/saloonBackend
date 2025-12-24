// models/ServiceItem.js
import mongoose from "mongoose";

const addOnSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  duration: { type: Number, default: 0 },
  isRecommended: { type: Boolean, default: false },
  isOptional: { type: Boolean, default: true }
}, { _id: false });

const serviceItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  // gender: {
  //   type: String,
  //   enum: ["men", "women", "unisex"],
  //   required: true
  // },
  price: { type: Number, required: true },
  durationMins: { type: Number, default: 30 },
  discountPercent: { type: Number, default: 0 },
  description: { type: String },
  image: String,
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  providerType: {
    type: String,
    enum: ["salon", "independent"],
    required: true
  },
  providerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  addOns: [addOnSchema],
}, { timestamps: true });

export default mongoose.model("ServiceItem", serviceItemSchema);
