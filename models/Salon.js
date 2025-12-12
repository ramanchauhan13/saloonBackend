// models/Salon.js
import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema({
  name: String,
  contactNumber: String,
  whatsappNumber: String
});

const salonSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    shopType: { type: String, enum: ["personal", "partnership"], required: true },
    partners: [partnerSchema],

    shopName: { type: String, required: true },
    about: String,

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
        day: { type: String, enum: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },
        start: String,
        end: String,
      }
    ],

    registrationNumber: String,

    city_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true
    },
    // GeoJSON
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number], required: true, index: "2dsphere" },
      address: { type: String, required: true },
      // city: String,
      // state: String,
      // pincode: String,
    },

    logoUrl: String,
    coverImageUrl: String,
    galleryImages: [String],

    governmentId: {
      idType: {
        type: String,
        enum: ["Aadhar", "PAN", "DL", "GST Certificate"],
        required: true,
      },
      idNumber: { type: String, required: true },
      idImageUrl: { type: String, required: true },
    },

    subscription: {
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubscriptionPlan",
        default: null,
      },
      startDate: Date,
      endDate: Date,
      paymentStatus: {
        type: String,
        enum: ["paid", "pending", "expired"],
        default: "pending",
      },
    },

    onboardedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    verifiedByAdmin: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Specialists virtual
salonSchema.virtual("specialistsData", {
  ref: "Specialist",
  localField: "_id",
  foreignField: "salon",
});

// Service items virtual
salonSchema.virtual("serviceItemData", {
  ref: "ServiceItem",
  localField: "_id",
  foreignField: "providerId",
  options: { match: { providerType: "salon" } }
});

// Reviews virtual
salonSchema.virtual("reviewData", {
  ref: "Review",
  localField: "_id",
  foreignField: "salon",
});

export default mongoose.model("Salon", salonSchema);
