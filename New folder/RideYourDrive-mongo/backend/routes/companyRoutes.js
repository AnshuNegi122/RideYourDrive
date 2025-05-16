import express from 'express';
import {
  registerCompany,
  getCompanyProfile,
  updateCompanyProfile,
  getCompanies,
  verifyCompany
} from '../controllers/companyController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.route('/')
  .post(protect, registerCompany)
  .get(protect, admin, getCompanies);

router.route('/profile')
  .get(protect, getCompanyProfile)
  .put(protect, updateCompanyProfile);

router.put('/:id/verify', protect, admin, verifyCompany);

export default router;