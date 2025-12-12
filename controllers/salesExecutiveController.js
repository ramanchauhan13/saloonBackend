import User from "../models/User.js";
import SalesExecutive from "../models/SalesExecutive.js";
import crypto from "crypto";

// Secure random password (8 chars)
const generatePassword = () => crypto.randomBytes(4).toString('hex');

// Register new Salesman
export const registerSalesExecutive = async (req, res) => {
  try {
    const { email, mobile, name, city, commissionRate } = req.body;

    if (!mobile || !name || !email || !city) {
      return res.status(400).json({ message: "Mobile, name, email, and city are required." });
    }

    const existingUser = await User.findOne({
      $or: [{ phone: mobile }, { email: email.toLowerCase() }]
    }).lean();

    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Generate secure password
    const password = generatePassword(); // use robust function with letters, digits, symbols

    const newUser = await new User({
      name,
      phone: mobile,
      email: email.toLowerCase(),
      password,
      role: "sales_executive"
    }).save();

    // Generate referralId to return immediately
    const referralId = await SalesExecutive.generateUniqueReferralId();

    const newSalesExecutive = await new SalesExecutive({
      user: newUser._id,
      city,
      commissionRate: commissionRate ?? 0,
      referralId
    }).save();

    const { password: _, ...userData } = newUser._doc;

    res.status(201).json({
      user: userData,
      salesExecutive: {
        ...newSalesExecutive._doc,
        password, // only for registration
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register sales executive.", error: error.message });
  }
};


// Get all sales executives
export const getAllSalesExecutives = async (req, res) => {
    console.log("Fetching all sales executives...");
    try {
        const salesExecutives = await SalesExecutive.find()
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });
        res.status(200).json({ salesExecutives });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch sales executives.", error: error.message });
    }
};

