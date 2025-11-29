import { Router } from "express";
import { registerSalesman, getAllSalesmen } from "../controllers/salesmanController.js";
import { authentice, isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register-salesman", authentice, isAdmin, registerSalesman);
router.get("/get-all-salesmen", authentice, isAdmin, getAllSalesmen);


export default router;