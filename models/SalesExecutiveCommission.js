import mongoose from "mongoose";

const cityExecutiveCommissionSchema = new mongoose.Schema(
  {
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },

    // commission FOR sales executive only
    registrationCommission: { type: Number, default: 0 },
    monthlySalesCommission: { type: Number, default: 0 },
    subscriptionCommission: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // super admin
  },
  { timestamps: true }
);

export default mongoose.model("CityExecutiveCommission", cityExecutiveCommissionSchema);
