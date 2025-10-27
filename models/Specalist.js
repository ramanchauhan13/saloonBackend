// models/Specialist.js
import mongoose from "mongoose";

const specialistSchema = new mongoose.Schema({
  salon: { type: mongoose.Schema.Types.ObjectId, ref: "Salon", required: true },
  name: { type: String, required: true },
  expertise: { type: String, enum: ["Hair", "Skin", "Makeup", "Massage", "Nails", "Other"], required: true },
  experienceYears: { type: Number, default: 0 },
  photoUrl: { type: String },
  certifications: [String],
  availability: {
    days: [String], // e.g., ["Mon", "Wed", "Fri"]
    time: { start: String, end: String },
  },
}, { timestamps: true });

export default mongoose.model("Specialist", specialistSchema);
