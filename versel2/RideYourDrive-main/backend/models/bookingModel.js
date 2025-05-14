import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  pickupLocation: {
    type: String,
    required: [true, 'Pickup location is required']
  },
  dropoffLocation: {
    type: String,
    required: [true, 'Dropoff location is required']
  },
  pickupDate: {
    type: Date,
    required: [true, 'Pickup date is required']
  },
  returnDate: {
    type: Date,
    required: [true, 'Return date is required']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required']
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  bookingStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Pending'
  },
  driverLicense: {
    type: String,
    required: [true, 'Driver license is required']
  },
  panCard: {
    type: String,
    required: [true, 'PAN card is required']
  },
  city: String,
  state: String,
  zipCode: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;