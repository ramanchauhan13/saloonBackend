import { Router } from "express";
import { authenticate, isSuperAdmin } from "../middlewares/authMiddleware.js";

import {
  createCategory,
  getAllCategories,
  editCategory,
} from "../controllers/categoryController.js";

import {
  createOffer,
  deleteOffer,
  updateOffer,
  getAllOffers,
} from "../controllers/offerController.js";

import { verifyUser, blockUser, activateUser,  getAllUsers } from "../controllers/userController.js";

import { getAllSaloons, getUnverifiedSalons } from "../controllers/salonController.js";

const router = Router();

router.get("/getAllSaloons", authenticate, isSuperAdmin, getAllSaloons);
router.post("/create-category", authenticate, isSuperAdmin, createCategory);
router.get("/getAllCategories", authenticate, isSuperAdmin, getAllCategories);
router.patch(
  "/update-category/:categoryId",
  authenticate,
  isSuperAdmin,
  editCategory
);
router.patch("/verify-user/:userId", authenticate, isSuperAdmin, verifyUser);
router.patch("/block-user/:userId", authenticate, isSuperAdmin, blockUser);
router.patch(
  "/activate-user/:userId",
  authenticate,
  isSuperAdmin,
  activateUser
);

router.post("/create-offer", authenticate, isSuperAdmin, createOffer);
router.delete("/delete-offer/:offerId", authenticate, isSuperAdmin, deleteOffer);
router.put("/update-offer/:offerId", authenticate, isSuperAdmin, updateOffer);
router.get("/get-all-offers", authenticate, getAllOffers);

router.get('/get-all-users', authenticate, isSuperAdmin, getAllUsers);

router.get('/get-unverified-salons', authenticate, isSuperAdmin, getUnverifiedSalons);

export default router;
