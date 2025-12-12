import { Router } from "express";

import { registerSalesExecutive, getAllSalesExecutives } from "../controllers/salesExecutiveController.js";
import { authenticate, isSuperAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", authenticate, isSuperAdmin, registerSalesExecutive);
router.get("/get-all-sales-executives", authenticate, isSuperAdmin, getAllSalesExecutives);

export default router;