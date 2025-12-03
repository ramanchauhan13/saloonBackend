import mongoose from 'mongoose';
 
const citySchema = new mongoose.Schema(
    {
        name: {type: String, requires: true, unique: true},
        active: {type: Boolean, default: true}
    },
    {timestamp:true}
);

export default mongoose.model("City", citySchema);