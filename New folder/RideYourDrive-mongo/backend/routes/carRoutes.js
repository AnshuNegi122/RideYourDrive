import express from 'express';
import {
  addCar,
  getCars,
  getCarById,
  updateCar,
  deleteCar,
  getCompanyCars
} from '../controllers/carController.js';
import { protect, company } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getCars);
router.get('/:id', getCarById);

// Protected routes
router.post('/', protect, company, addCar);
router.route('/:id')
  .put(protect, company, updateCar)
  .delete(protect, company, deleteCar);

router.get('/company/cars', protect, company, getCompanyCars);

export default router;