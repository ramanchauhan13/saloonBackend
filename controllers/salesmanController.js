import User from "../models/User.js";
import Salesman from "../models/Salesman.js";
import bcrypt from "bcryptjs";

const commissionRate = 0.05; // Default commission rate of 5%

const generatePassword = () => {
    return Math.random().toString(36).slice(-8);
}

export const createSalesman = async (req, res) => {
    try {
        const { email, mobile, name } = req.body;

        if (!mobile || !name || !email) {
            return res.status(400).json({ message: "Mobile, name, and email are required." });
        }

        const existingUser = await User.findOne({ $or: [{ phone: mobile }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists." });
        }

        const password = generatePassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            phone: mobile,
            email,
            password: hashedPassword,
            role: 'salesman',
        });
        await newUser.save();

        const newSalesman = new Salesman({
            user: newUser._id,
            email,
            mobile,
            name,
            password, // store plain password if needed for display
            commissionRate
        });

        await newSalesman.save();

        // Send referralId in response
        res.status(201).json({ 
            user: newUser, 
            salesman: { 
                ...newSalesman._doc, 
                password, // optional: plain password for login
                referralId: newSalesman.referralId 
            } 
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to create salesman.", error: error.message });
    }
};
