// models/IndependentProfessional.js
import mongoose from "mongoose";

const independentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  gender: { type: String, enum: ["male", "female", "other"] },
  experienceYears: Number,
  serviceTypes: [String],

  profilePhoto: String,
  workPhotos: [String],

  location: {
    area: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: { type: [Number], index: "2dsphere" },
    radiusKm: { type: Number, default: 10 }, // how far they can travel
  },

  availableDays: [String], // ["Mon", "Tue", ...]
  availableTimeSlots: [String], // ["10:00-12:00", "14:00-16:00"]
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: "ServiceItem" }],

  verifiedByAdmin: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("IndependentProfessional", independentSchema);
