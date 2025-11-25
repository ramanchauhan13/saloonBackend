import { Router } from 'express';
import { giveReview } from '../controllers/userController.js';
import { getAllCategories } from '../controllers/categoryController.js';
import { getFeaturedSalons, getNearbySalons, getHomeSalonsByCategory, getSalonById } from '../controllers/salonController.js';

const router = Router();

router.post('/give-review', giveReview);
router.get('/get-featured-salons', getFeaturedSalons);
router.get('/get-nearby-salons', getNearbySalons);
router.get('/get-all-categories', getAllCategories);

router.get('/get-home-salons', getHomeSalonsByCategory);
router.get('/get-salon/:salonId', getSalonById);
export default router;