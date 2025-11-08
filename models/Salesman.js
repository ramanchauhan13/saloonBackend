import mongoose from 'mongoose';


// salesman who sell salon app 
const salesmanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referralId: { type: String, unique: true, required: true },
  refersTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true }],
  commissionRate: { type: Number, default: 0.05 }, // 5% commission by default
  totalEarnings: { type: Number, default: 0 },
  
}, { timestamps: true });

const Salesman = mongoose.model('Salesman', salesmanSchema);

export default Salesman;