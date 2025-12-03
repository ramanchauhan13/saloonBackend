import mongoose from "mongoose";

const salesMemberCommissionSchema = new mongoose.Schema(
  {
    executive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesExecutive",
      required: true,
    },

    level: {
      type: String,
      enum: ["junior", "senior", "team_lead"],
      required: true,
    },

    registrationCommission: { type: Number, default: 0 },
    monthlySalesCommission: { type: Number, default: 0 },
    subscriptionCommission: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // sales executive
  },
  { timestamps: true }
);

export default mongoose.model("SalesMemberCommission", salesMemberCommissionSchema);
