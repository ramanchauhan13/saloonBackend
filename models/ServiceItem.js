// models/ServiceItem.js
import mongoose from "mongoose";

const serviceItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
  price: { type: Number, required: true },
  durationMins: { type: Number, default: 30 },
  discountPercent: { type: Number, default: 0 },
  description: { type: String },
  imageURL: String,
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  providerType: {
    type: String,
    enum: ["Salon", "IndependentProfessional"],
    required: true
  },
  providerId: { type: mongoose.Schema.Types.ObjectId, refPath: "providerType", required: true },
  addOns: [{ type: mongoose.Schema.Types.ObjectId, ref: "AddOn" }],
}, { timestamps: true });

export default mongoose.model("ServiceItem", serviceItemSchema);
