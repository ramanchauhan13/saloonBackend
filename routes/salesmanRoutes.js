import { Router } from "express";
import { registerSalesman, getAllSalesman } from "../controllers/salesmanController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register-salesman", authenticate, registerSalesman);
router.get("/get-all-salesman", authenticate, getAllSalesman);

export default router;