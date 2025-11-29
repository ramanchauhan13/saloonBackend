// models/Salon.js
import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema({
  name: String,
  contactNumber: String,
  whatsappNumber: String
});

const salonSchema = new mongoose. Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  shopType: { type: String, enum: ["personal", "partnership"], required: true },
  partners: [partnerSchema],

  shopName: { type: String, required: true },
  about: { type: String },
  contactNumber: String,
  whatsappNumber: String,

   salonCategory: {
    type: String,
    enum: ["men", "beautyParlour", "unisex", "spa"],
    required: true,
  },
  offersHomeService: { type: Boolean, default: false },
  numberOfStaff: Number,
  openingDate: Date,
  openingHours: [
  {
    day: { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
    start: { type: String },
    end: { type: String }
  }
],
  registrationNumber: String,

  // ✅ GeoJSON location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: "2dsphere",
      },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    logoUrl: String,
    coverImageUrl: String,
    galleryImages: [String],
  // ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
   governmentId: {
    idType: { type: String, enum: ["Aadhar", "PAN", "DL"], required: true },
    idNumber: { type: String, required: true },
    idImageUrl: { type: String, required: true },
  },
  subscription: {
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan", default: null },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  paymentStatus: { type: String, enum: ["paid", "pending", "expired"], default: "pending" },
},
  verifiedByAdmin: { type: Boolean, default: false },
}, { timestamps: true, toJSON: { virtuals: true },
  toObject: { virtuals: true } });

// ✅ Virtual populate for specialists
salonSchema.virtual("specialistsData", {
  ref: "Specialist",
  localField: "_id",
  foreignField: "salon",
});

// ✅ Virtual populate for service items
salonSchema.virtual("serviceItemData", {
  ref: "ServiceItem",
  localField: "_id",
  foreignField: "providerId",
  justOne: false,
  options: { match: { providerType: "salon" } }
});

salonSchema.virtual("reviewData", {
  ref: "Review",
  localField: "_id",
  foreignField: "salon",
});

export default mongoose.model("Salon", salonSchema);
