import mongoose from 'mongoose';
import crypto from 'crypto';

// Salesman schema
const salesmanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referralId: { type: String, unique: true, required: true },
  refersTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Salon' }], // removed required:true inside array
  commissionRate: { type: Number, default: 0.05 }, // 5% commission by default
  totalEarnings: { type: Number, default: 0 },
}, { timestamps: true });

// Generate unique referral ID before saving
salesmanSchema.pre('save', function(next) {
    if (!this.referralId) {
        const year = new Date().getFullYear();
        // 6-character alphanumeric string (very low chance of collision)
        const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase(); 
        this.referralId = `SP-${year}-${randomPart}`;
    }
    next();
});

const Salesman = mongoose.model('Salesman', salesmanSchema);

export default Salesman;
