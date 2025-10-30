import { Router } from "express";
import {
  addSpecialist,
  getSpecialistsBySalon,
  getSaloonDetails,
  addOrUpdateSalonLocation,
} from "../controllers/salonAdminController.js";
import {
  authenticate,
  isSalonOwner,
  isSalonVerifiedByAdmin,
} from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/getSaloonDetails", authenticate, getSaloonDetails);
router.put(
  "/add-specialist/:salonId",
  authenticate,
  isSalonOwner,
  isSalonVerifiedByAdmin,
  addSpecialist
);
router.get(
  "/get-specialists/:salonId",
  authenticate,
  isSalonOwner,
  isSalonVerifiedByAdmin,
  getSpecialistsBySalon
);

router.patch('/add-location/:salonId', addOrUpdateSalonLocation);

export default router;
