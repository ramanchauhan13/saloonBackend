import { Router } from "express";
import {
  addSpecialist,
  getSpecialistsBySalon,
  updateSpecialist,
  deleteSpecialist,

  getSaloonDetails,

  addOrUpdateSalonLocation,
  checkSubscriptionStatus,

  createServiceItem,
  updateServiceItem,
  deleteServiceItem,
  getServiceItemsBySalon,
} from "../controllers/salonAdminController.js";
import {
  authenticate,
  isSalonOwner,
  isSalonVerifiedByAdmin,
} from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/getSaloonDetails", authenticate, getSaloonDetails);

router.post(
  "/add-specialist",
  authenticate,
  isSalonOwner,
  isSalonVerifiedByAdmin,
  addSpecialist
);
router.get(
  "/get-specialists", authenticate, isSalonOwner,
  isSalonVerifiedByAdmin,
  getSpecialistsBySalon
);

router.put("/update-specialist/:specialistId", authenticate, isSalonOwner, isSalonVerifiedByAdmin, updateSpecialist);
router.delete("/delete-specialist/:specialistId", authenticate, isSalonOwner, isSalonVerifiedByAdmin, deleteSpecialist);

router.patch("/add-location/:salonId", addOrUpdateSalonLocation);

router.get("/subscription-status", authenticate, isSalonOwner, checkSubscriptionStatus);

router.post("/create-service-item", authenticate, isSalonOwner, isSalonVerifiedByAdmin, createServiceItem);
router.put("/update-service-item/:serviceId", authenticate, isSalonOwner, isSalonVerifiedByAdmin, updateServiceItem);
router.delete("/delete-service-item/:serviceId", authenticate, isSalonOwner, isSalonVerifiedByAdmin, deleteServiceItem);
router.get("/get-service-items", authenticate, isSalonOwner, isSalonVerifiedByAdmin, getServiceItemsBySalon);

export default router;
