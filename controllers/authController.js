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

// REGISTER USER / SALON / PROFESSIONAL
export const signup = async (req, res) => {
  try {
    const { name, email, phone, password, role, salonData, independentData } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser)
      return res.status(400).json({ message: "Phone number already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, password: hashedPassword, role });

    let roleDetails = null;

    if (role === "salon_owner" && salonData) {
      roleDetails = await Salon.create({ ...salonData, owner: user._id });
    } else if (role === "independent_beautician" && independentData) {
      roleDetails = await IndependentProfessional.create({ ...independentData, user: user._id });
    }

    const token = generateToken(user);

    res.status(201).json({
      message: "Registration successful",
      user: { ...user.toObject(), ...(role === "salon_owner" ? { salon: roleDetails } : { independentProfile: roleDetails }) },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed", error: err.message });
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
    } else if (user.role === "independent_beautician") {
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
        ...(user.role === "independent_beautician" ? { independentProfile: roleDetails } : {}),
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed", error: err.message });
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

export default router;
