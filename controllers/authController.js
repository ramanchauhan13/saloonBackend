// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Salon from "../models/Salon.js";
import IndependentProfessional from "../models/IndependentProfessional.js";
import { generateOTP } from "../utils/otp.js";
import { sendEmail } from "../utils/email.js";
import { hashString } from "../utils/hash.js";

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, // include role
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const signup = async (req, res) => {
  console.log("Signup request body:", req.body);

  try {
    const { name, email, phone, password, role, salonData, independentData } = req.body;

    // -----------------------
    // Basic validations
    // -----------------------
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Name, email, phone, password are required" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already registered" });
    }

    // VALIDATE ROLE BEFORE CREATE
    let roleDetails = null;

    if (role === "salon_owner") {

      if (!salonData) {
        return res.status(400).json({ message: "Salon data is required for salon owner" });
      }

      const requiredFields = ["shopType", "shopName", "salonCategory", "location"];
      for (const field of requiredFields) {
        if (!salonData[field]) {
          return res.status(400).json({ message: `Salon field '${field}' is required` });
        }
      }

      // Check government ID
      const govId = salonData.governmentId;
      if (!govId || !govId.idType || !govId.idNumber || !govId.idImageUrl) {
        return res.status(400).json({
          message: "Government ID (idType, idNumber, idImageUrl) is required for salon owner"
        });
      }
    }

    if (role === "independent_pro") {
      if (!independentData) {
        return res.status(400).json({ message: "Independent profile data required" });
      }

      const requiredFields = ["specializations", "experienceYears"];
      for (const field of requiredFields) {
        if (!independentData[field]) {
          return res.status(400).json({ message: `Independent profile field '${field}' is required` });
        }
      }
    }

    // ===========================
    // NOW CREATE USER
    // ===========================
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    // ===========================
    // CREATE ROLE DOCUMENT
    // ===========================
    if (role === "salon_owner") {
      roleDetails = await Salon.create({ ...salonData, owner: user._id });
      user.salonId = roleDetails._id;
      await user.save();
    }

    if (role === "independent_pro") {
      roleDetails = await IndependentProfessional.create({ ...independentData, user: user._id });
    }

    // Generate token
    const token = generateToken(user);

    console.log("User registered successfully:", user, salonData);

    return res.status(201).json({
      message: "Registration successful",
      user: {
        ...user.toObject(),
        ...(role === "salon_owner"
          ? { salon: roleDetails }
          : role === "independent_pro"
          ? { independentProfile: roleDetails }
          : {}),
      },
      token,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find user by email
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 2️⃣ Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const userData  =  user.toObject();
    delete userData.password;

    // 3️⃣ Fetch role-specific data
    let roleDetails = null;
    if (user.role === "salon_owner") {
      roleDetails = await Salon.findOne({ owner: user._id }).lean();
    } else if (user.role === "independent_pro") {
      roleDetails = await IndependentProfessional.findOne({ user: user._id }).lean();
    }

    // 4️⃣ Generate JWT token
    const token = generateToken(user);

    // 5️⃣ Return unified user object
    res.status(200).json({
      message: "Login successful",
      user: {
        ...userData,
        ...(user.role === "salon_owner" ? { salon: roleDetails } : {}),
        ...(user.role === "independent_pro" ? { independentProfile: roleDetails } : {}),
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

export const toggleOffersHomeService = async (req, res) => {

  console.log("Toggling home service for user:", req.userId);
  try {
    const userId = req.userId;
    const salon = await Salon.findOne({ owner: userId });
    if (!salon) {
      return res.status(404).json({ message: "Salon not found" });
    }

    salon.offersHomeService = !salon.offersHomeService;
    await salon.save();

    res.status(200).json({
      message: "Home service status updated successfully",
      offersHomeService: salon.offersHomeService,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update home service status", error: err.message });
  }
};

// ===== FORGOT PASSWORD (SEND OTP) =====
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP(4);
    user.resetPasswordOTP = hashString(otp);
    user.resetPasswordExpire = Date.now() + 5 * 60 * 1000; // 5 min
    await user.save();

    await sendEmail({
      to: email,
      subject: "Password Reset OTP",
      html: `<p>Hello ${user.name || ""},</p>
             <p>Your OTP for password reset is <b>${otp}</b>.</p>
             <p>This OTP will expire in 5 minutes.</p>`,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== VERIFY OTP =====
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.resetPasswordOTP || hashString(otp) !== user.resetPasswordOTP) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if(user.resetPasswordExpire < Date.now()){
        return res.status(400).json({ message: "OTP Expired" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== RESET PASSWORD =====
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({ message: "OTP Expired" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// In-memory OTP store
// Format: { "otpValue": { mobile: "9876543210", expiresAt: timestamp } }
const otpStore = {};

// Generate OTP

// ----------------- SEND OTP -----------------
export const sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ message: "Mobile is required" });

    const otp = generateOTP(6);
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    // Store OTP internally
    otpStore[otp] = { mobile, expiresAt };

    // TODO: Send OTP via SMS gateway
    console.log(`OTP sent to ${mobile}: ${otp}`);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------- VERIFY OTP -----------------
export const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ message: "OTP is required" });

    const record = otpStore[otp];
    if (!record) return res.status(400).json({ message: "Invalid OTP" });

    if (Date.now() > record.expiresAt) {
      delete otpStore[otp];
      return res.status(400).json({ message: "OTP expired" });
    }

    const mobile = record.mobile;

    // OTP verified → delete OTP
    delete otpStore[otp];

    // Check if user exists
    const user = await User.findOne({ mobile });

    if (user) {
      // Existing user → generate JWT token for login
      const token = jwt.sign({ userId: user._id, mobile }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ message: "Login successful", existing: true, token });
    } else {
      // New user → generate short-lived token for registration
      const regToken = jwt.sign({ mobile }, JWT_SECRET, { expiresIn: "10m" });
      return res.json({ message: "OTP verified. Complete registration", existing: false, token: regToken });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------- COMPLETE NEW USER -----------------
export const completeNewUser = async (req, res) => {
  try {
    const { token, name, email, password, role } = req.body;
    if (!token) return res.status(400).json({ message: "Token is required" });

    // Verify registration token
    const decoded = jwt.verify(token, JWT_SECRET);
    const mobile = decoded.mobile;

    // Optional: check if user already exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword, role, mobile });

    // Generate login token for the new user
    const loginToken = jwt.sign({ userId: user._id, mobile }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ message: "User created successfully", user, token: loginToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



export default router;
