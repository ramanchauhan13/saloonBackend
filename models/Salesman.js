import mongoose from 'mongoose';
import crypto from 'crypto';

// Salesman schema
const salesmanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referralId: { type: String, unique: true, required: true },
  refersTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Salon' }],
  commissionRate: { type: Number, default: 0.05, min: 0, max: 1 }, // must be 0-1
  totalEarnings: { type: Number, default: 0 },
}, { timestamps: true });

// Generate unique referral ID
salesmanSchema.statics.generateUniqueReferralId = async function() {
    let referralId;
    let exists = true;

    while (exists) {
        const year = new Date().getFullYear();
        const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
        referralId = `SP-${year}-${randomPart}`;
        exists = await this.findOne({ referralId });
    }

    return referralId;
};

const Salesman = mongoose.model('Salesman', salesmanSchema);
export default Salesman;
