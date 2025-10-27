// models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  providerType: {
    type: String,
    enum: ["salon", "independent"],
    required: true,
  },

  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "providerType", // dynamically refers to "Salon" or "IndependentProfessional"
  },

  serviceItems: [
    {
      service: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceItem", required: true },
      quantity: { type: Number, default: 1 },
      price: { type: Number, required: true },
    },
  ],

  totalAmount: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "online", "upi", "card"],
    default: "cash",
  },

  bookingType: {
    type: String,
    enum: ["in_salon", "home_service"],
    required: true,
  },

  date: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // e.g., "10:00-11:00"

  location: {
    address: String,
    coordinates: { type: [Number], index: "2dsphere" },
  },

  status: {
    type: String,
    enum: [
      "pending",       // awaiting provider confirmation
      "confirmed",     // accepted
      "in_progress",   // currently ongoing
      "completed",     // finished
      "cancelled"      // by user or provider
    ],
    default: "pending",
  },

  notes: String,

  rating: {
    score: { type: Number, min: 1, max: 5 },
    feedback: String,
  },

}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
