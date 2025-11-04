import { Router } from 'express';
import { giveReview, getFeaturedSalons, getNearbySalons } from '../controllers/userController.js';
import { getAllCategories } from '../controllers/userController.js';

const router = Router();

router.post('/give-review', giveReview);
router.get('/get-featured-salons', getFeaturedSalons);
router.get('/get-nearby-salons', getNearbySalons);
router.get('/get-all-categories', getAllCategories);

export default router;