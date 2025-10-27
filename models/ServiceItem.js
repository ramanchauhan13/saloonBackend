// models/ServiceItem.js
import mongoose from "mongoose";

const serviceItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String }, // e.g. Haircut, Makeup, Grooming
  price: { type: Number, required: true },
  durationMins: { type: Number, default: 30 },
  discountPercent: { type: Number, default: 0 },
  description: { type: String },
  image: String,

  providerType: {
    type: String,
    enum: ["salon", "independent"],
    required: true
  },
  providerId: { type: mongoose.Schema.Types.ObjectId, required: true }, // points to Salon or IndependentProfessional
}, { timestamps: true });

export default mongoose.model("ServiceItem", serviceItemSchema);
