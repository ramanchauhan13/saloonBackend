// models/Salon.js
import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema({
  name: String,
  contactNumber: String,
  whatsappNumber: String
});

const salonSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  shopType: { type: String, enum: ["personal", "partnership"], required: true },
  partners: [partnerSchema],

  shopName: { type: String, required: true },
  about: { type: String },
  contactNumber: String,
  whatsappNumber: String,

  numberOfStaff: Number,
  openingDate: Date,
  openingHours: {
    open: String,
    close: String
  },
  registrationNumber: String,

  location: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: { type: [Number], index: "2dsphere" },
    
  },

  serviceItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "ServiceItem" }], 
  specialists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Specialist" }],
  galleryImages: [String],
  ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],

  verifiedByAdmin: { type: Boolean, default: false },
}, { timestamps: true });


export default mongoose.model("Salon", salonSchema);
