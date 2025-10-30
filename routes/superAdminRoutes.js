import { Router } from "express";
import { authenticate, isSuperAdmin } from "../middlewares/authMiddleware.js";
import { verifyUser, blockUser, activateUser, getAllSaloons, createCategory, editCategory, getAllCategories } from "../controllers/superAdminController.js";

const router = Router();

router.get('/getAllSaloons', authenticate, isSuperAdmin, getAllSaloons);
router.post('/create-category', authenticate, isSuperAdmin, createCategory);
router.get('/getAllCategories', authenticate, isSuperAdmin, getAllCategories);
router.patch('/edit-category/:categoryId', authenticate, isSuperAdmin, editCategory);
router.patch('/verify-user/:userId', authenticate, isSuperAdmin, verifyUser);
router.patch('/block-user/:userId', authenticate, isSuperAdmin, blockUser);
router.patch('/activate-user/:userId', authenticate, isSuperAdmin, activateUser);

export default router;