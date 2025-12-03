// models/IndependentProfessional.js
import mongoose from "mongoose";

const independentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  experienceYears: Number,
  serviceTypes: [String],
  specializations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],

  profilePhoto: String,
  workPhotos: [String],

  location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        // required: true,
        index: "2dsphere",
      },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      radiusInKm: { type: Number, default: 10 },
    },

 availability: [
  {
    day: { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
    start: { type: String },
    end: { type: String }
  }
],
  governmentId: {
    idType: { type: String, enum: ["Aadhaar", "PAN", "DL"] },
    idNumber: String,
    idImageUrl: String,
  },
  subscription: {
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan", default: null },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  paymentStatus: { type: String, enum: ["paid", "pending", "expired"], default: "pending" },
},
  verifiedByAdmin: { type: Boolean, default: false },
}, { timestamps: true });


// ✅ Virtual populate for service items
independentSchema.virtual("serviceItemData", {
  ref: "ServiceItem",
  localField: "_id",
  foreignField: "providerId",
  justOne: false,
  options: { match: { providerType: "independent" } }
});

independentSchema.virtual("reviewData", {
  ref: "Review",
  localField: "_id",
  foreignField: "independent",
});

export default mongoose.model("IndependentProfessional", independentSchema);
