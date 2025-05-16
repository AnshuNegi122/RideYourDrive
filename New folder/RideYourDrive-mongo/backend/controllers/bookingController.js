import Booking from '../models/bookingModel.js';
import Car from '../models/carModel.js';

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const {
      carId,
      pickupLocation,
      dropoffLocation,
      pickupDate,
      returnDate,
      driverLicense,
      panCard,
      city,
      state,
      zipCode
    } = req.body;

    // Check if car exists
    const car = await Car.findById(carId);
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    if (!car.isAvailable) {
      return res.status(400).json({ message: 'Car is not available for booking' });
    }
    
    // Calculate total amount
    const pickupDateTime = new Date(pickupDate);
    const returnDateTime = new Date(returnDate);
    const diffTime = Math.abs(returnDateTime - pickupDateTime);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalAmount = diffDays * car.dailyRate;
    
    // Create new booking
    const booking = await Booking.create({
      userId: req.user._id,
      carId,
      pickupLocation,
      dropoffLocation,
      pickupDate,
      returnDate,
      totalAmount,
      driverLicense,
      panCard,
      city,
      state,
      zipCode
    });
    
    if (booking) {
      // Update car availability
      car.isAvailable = false;
      await car.save();
      
      res.status(201).json(booking);
    } else {
      res.status(400).json({ message: 'Invalid booking data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('carId', 'brand model vehicleType images dailyRate')
      .populate('userId', 'name email');
    
    if (booking) {
      // Check if the booking belongs to the user or the user is an admin
      if (booking.userId._id.toString() === req.user._id.toString() || req.user.role === 'admin') {
        res.json(booking);
      } else {
        res.status(401).json({ message: 'Not authorized to view this booking' });
      }
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('carId', 'brand model vehicleType images dailyRate')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (booking) {
      booking.bookingStatus = status;
      
      // If booking is cancelled or completed, make the car available again
      if (status === 'Cancelled' || status === 'Completed') {
        const car = await Car.findById(booking.carId);
        if (car) {
          car.isAvailable = true;
          await car.save();
        }
      }
      
      const updatedBooking = await booking.save();
      res.json(updatedBooking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update payment status
// @route   PUT /api/bookings/:id/payment
// @access  Private/Admin
export const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (booking) {
      booking.paymentStatus = status;
      const updatedBooking = await booking.save();
      res.json(updatedBooking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings/admin
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('carId', 'brand model vehicleType images dailyRate')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get company bookings
// @route   GET /api/bookings/company
// @access  Private/Company
export const getCompanyBookings = async (req, res) => {
  try {
    // Find cars owned by the company
    const cars = await Car.find({ companyId: req.company._id }).select('_id');
    const carIds = cars.map(car => car._id);
    
    // Find bookings for those cars
    const bookings = await Booking.find({ carId: { $in: carIds } })
      .populate('carId', 'brand model vehicleType images dailyRate')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};