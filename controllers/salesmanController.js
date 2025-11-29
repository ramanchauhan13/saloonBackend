import User from "../models/User.js";
import Salesman from "../models/Salesman.js";
import bcrypt from "bcryptjs";

// Generate random password (temporary)
const generatePassword = () => Math.random().toString(36).slice(-8);

export const registerSalesman = async (req, res) => {
    try {
        const { email, mobile, name, commissionRate = 0.05 } = req.body;

        if (!mobile || !name) {
            return res.status(400).json({ message: "Mobile and name are required." });
        }

        // Check existing user
        const query = [{ phone: mobile }];
        if (email) query.push({ email });
        const existingUser = await User.findOne({ $or: query });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists." });
        }

        // Generate password & hash
        const password = generatePassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const newUser = new User({
            name,
            phone: mobile,
            email,
            password: hashedPassword,
            role: 'salesman',
        });
        await newUser.save();

        // Generate unique referral ID
        const referralId = await Salesman.generateUniqueReferralId();

        // Create Salesman
        const newSalesman = new Salesman({
            user: newUser._id,
            commissionRate,
            referralId
        });
        await newSalesman.save();

        // Return user + salesman + plain password once
        res.status(201).json({ 
            user: newUser, 
            salesman: { 
                ...newSalesman._doc,
                password, // plain password only for registration response
            } 
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to register salesman.", error: error.message });
    }
};

export const getAllSalesmen = async (req, res) => {
    try {
        const salesmen = await Salesman.find()
            .populate('user', 'name email phone'); // populate user info
        res.status(200).json({ salesmen });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch salesmen.", error: error.message });
    }
};