import User from "../models/User.js";
import Salesman from "../models/Salesman.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Secure random password (8 chars)
const generatePassword = () => crypto.randomBytes(4).toString('hex');

// Register new Salesman
export const registerSalesman = async (req, res) => {
    try {
        const { email, mobile, name, commissionRate = 0.05 } = req.body;

        if (!mobile || !name) {
            return res.status(400).json({ message: "Mobile and name are required." });
        }

        // if (commissionRate < 0 || commissionRate > 1) {
        //     return res.status(400).json({ message: "Commission rate must be between 0 and 1." });
        // }

        // Check if user exists
        const query = [{ phone: mobile }];
        if (email) query.push({ email: email.toLowerCase() });
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
            email: email?.toLowerCase(),
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

        // Clean user data (exclude password)
        const { password: _, ...userData } = newUser._doc;

        // Return response with plain password once
        res.status(201).json({
            user: userData,
            salesman: {
                ...newSalesman._doc,
                password, // plain password only for registration
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to register salesman.", error: error.message });
    }
};

// Get all salesmen
export const getAllSalesmen = async (req, res) => {
    console.log("Fetching all salesmen...");
    try {
        const salesmen = await Salesman.find()
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });
        res.status(200).json({ salesmen });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch salesmen.", error: error.message });
    }
};
