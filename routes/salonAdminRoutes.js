import { Router } from "express";

import {
  addSpecialist,
  getSpecialistsBySalon,
  updateSpecialist,
  deleteSpecialist,
} from "../controllers/specialistController.js";

import {
  createServiceItem,
  updateServiceItem,
  deleteServiceItem,
  getServiceItemsBySalon,
} from "../controllers/serviceItemController.js";

import { addOrUpdateSalonLocation } from "../controllers/locationController.js";

import { checkSubscriptionStatus, subscribePlan, getSubscriptionPlans } from "../controllers/subscriptionController.js";

import { getSaloonDetails } from "../controllers/salonController.js";

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

router.get("/get-subscription-plans", authenticate, isSalonOwner, getSubscriptionPlans);
router.get("/subscription-status", authenticate, isSalonOwner, checkSubscriptionStatus);
router.patch("/subscribe-plan", authenticate, isSalonOwner, subscribePlan);

router.post("/create-service-item", authenticate, isSalonOwner, isSalonVerifiedByAdmin, createServiceItem);
router.put("/update-service-item/:serviceId", authenticate, isSalonOwner, isSalonVerifiedByAdmin, updateServiceItem);
router.delete("/delete-service-item/:serviceId", authenticate, isSalonOwner, isSalonVerifiedByAdmin, deleteServiceItem);
router.get("/get-service-items", authenticate, isSalonOwner, isSalonVerifiedByAdmin, getServiceItemsBySalon);

export default router;
