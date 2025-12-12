import { Router } from "express";
import { registerSalesman, getAllSalesmen } from "../controllers/salesmanController.js";
import { authenticate, isSuperAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register-salesman", authenticate, registerSalesman);
router.get("/get-all-salesmen", authenticate, getAllSalesmen);

export default router;