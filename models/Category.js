import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g. Haircut, Nails
  icon: { type: String }, // URL or frontend reference for icon
  active: { type: Boolean, default: true }, // allows soft delete
}, { timestamps: true });

export default mongoose.model("Category", categorySchema);
