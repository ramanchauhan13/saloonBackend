import {Router} from "express";

import { createState, createCity } from "../controllers/stateCityController.js";

const router = Router();

router.post("/create-state", createState);
router.post("/create-city", createCity);

export default router;