import express from 'express';
import {
  createBooking,
  getBookingById,
  getUserBookings,
  updateBookingStatus,
  updatePaymentStatus,
  getAllBookings,
  getCompanyBookings
} from '../controllers/bookingController.js';
import { protect, admin, company } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.route('/')
  .post(protect, createBooking)
  .get(protect, getUserBookings);


// User routes
router.route('/').post(protect, createBooking);
router.route('/').get(protect, getUserBookings);
router.route('/:id').get(protect, getBookingById);


router.get('/admin', protect, admin, getAllBookings);
router.get('/company', protect, company, getCompanyBookings);

// Company routes - Make sure protect middleware runs before company middleware
router.route('/company').get(protect, company, getCompanyBookings);

router.route('/:id')
  .get(protect, getBookingById);

router.put('/:id/status', protect, admin, updateBookingStatus);
router.put('/:id/payment', protect, admin, updatePaymentStatus);

export default router;