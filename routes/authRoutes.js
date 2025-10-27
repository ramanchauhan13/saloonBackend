import { Router } from "express";
import { signup, login, forgotPassword, verifyOTP, resetPassword } from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";


const router = Router();

router.post("/signup", signup);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);           
router.post("/reset-password", resetPassword);

export default router;
