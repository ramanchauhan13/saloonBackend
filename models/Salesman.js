import mongoose from 'mongoose';

const salesmanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  // from which salon  s
  salon: { type: mongoose.Schema.Types.ObjectId, ref: "Salon", required: true },
  referlID: { type: String, unique: true, required: true },
});

const Salesman = mongoose.model('Salesman', salesmanSchema);

export default Salesman;