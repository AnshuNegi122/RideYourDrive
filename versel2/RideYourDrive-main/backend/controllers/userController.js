import User from '../models/userModel.js';
import { generateToken } from '../middleware/authMiddleware.js';

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user & get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// controllers/userController.js - Add these functions

// @desc    Verify a user
// @route   POST /api/users/verify
// @access  Private
export const verifyUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      driverLicense,
      panCard,
      city,
      state,
      zipCode
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !driverLicense || !panCard || !city || !state || !zipCode) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user with verification details
    user.firstName = firstName;
    user.lastName = lastName;
    user.driverLicense = driverLicense;
    user.panCard = panCard;
    user.city = city;
    user.state = state;
    user.zipCode = zipCode;
    user.isVerified = true;
    user.verificationDate = Date.now();

    await user.save();

    res.status(200).json({
      message: 'User verified successfully',
      isVerified: true
    });
  } catch (error) {
    console.error('Error in verifyUser:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user verification status
// @route   GET /api/users/verification-status
// @access  Private
export const getVerificationStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      isVerified: user.isVerified,
      verificationData: user.isVerified ? {
        firstName: user.firstName,
        lastName: user.lastName,
        driverLicense: user.driverLicense,
        panCard: user.panCard,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        verificationDate: user.verificationDate
      } : null
    });
  } catch (error) {
    console.error('Error in getVerificationStatus:', error);
    res.status(500).json({ message: 'Server error' });
  }
};