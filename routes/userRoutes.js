import { Router } from 'express';
import { giveReview, getFeaturedSalons, getNearbySalons, getHomeSalons } from '../controllers/userController.js';
import { getAllCategories } from '../controllers/userController.js';

const router = Router();

router.post('/give-review', giveReview);
router.get('/get-featured-salons', getFeaturedSalons);
router.get('/get-nearby-salons', getNearbySalons);
router.get('/get-all-categories', getAllCategories);

router.get('/get-home-salons', getHomeSalons);
export default router;