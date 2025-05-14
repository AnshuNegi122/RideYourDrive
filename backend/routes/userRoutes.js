import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/userModel.js';

const router = express.Router();

// ===== Public Routes =====
router.post('/', registerUser);
router.post('/login', loginUser);

// ===== Protected Routes =====
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// ===== User Verification =====

// @desc    Verify user for car booking
// @route   POST /api/users/verify
// @access  Private
router.post("/verify", protect, async (req, res) => {
  try {
    const { firstName, lastName, driverLicense, panCard, city, state, zipCode } = req.body;

    if (!firstName || !lastName || !driverLicense || !panCard || !city || !state || !zipCode) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.driverLicense = driverLicense;
    user.panCard = panCard;
    user.city = city;
    user.state = state;
    user.zipCode = zipCode;
    user.isVerified = true;

    await user.save();

    res.status(200).json({
      message: "User verified successfully",
      isVerified: true,
    });
  } catch (error) {
    console.error("Error in user verification:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
});

// @desc    Check if user is verified
// @route   GET /api/users/verify
// @access  Private
router.get("/verify", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      isVerified: user.isVerified || false,
      verificationData: user.isVerified
        ? {
            firstName: user.firstName,
            lastName: user.lastName,
            driverLicense: user.driverLicense,
            panCard: user.panCard,
            city: user.city,
            state: user.state,
            zipCode: user.zipCode,
          }
        : null,
    });
  } catch (error) {
    console.error("Error checking verification status:", error);
    res.status(500).json({ message: "Server error checking verification status" });
  }
});

export default router;
