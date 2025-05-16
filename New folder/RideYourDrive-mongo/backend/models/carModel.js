import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true
  },
  brand: {
    type: String,
    required: [true, 'Car brand is required']
  },
  model: {
    type: String,
    required: [true, 'Car model is required']
  },
  modelYear: {
    type: Number,
    required: [true, 'Model year is required']
  },
  color: {
    type: String,
    required: [true, 'Car color is required']
  },
  vehicleType: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: ['Sedan', 'SUV', 'Hatchback', 'Crossover', 'Minivan', 'Coupe', 'Sport Cars', 'Pickup Truck']
  },
  numberOfSeats: {
    type: Number,
    required: [true, 'Number of seats is required']
  },
  engineNumber: {
    type: String,
    required: [true, 'Engine number is required']
  },
  chasisNumber: {
    type: String,
    required: [true, 'Chasis number is required']
  },
  engineCapacity: String,
  engineType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
    required: [true, 'Engine type is required']
  },
  transmissionType: {
    type: String,
    enum: ['Manual', 'Automatic'],
    default: 'Manual'
  },
  insurancePolicyType: {
    type: String,
    required: [true, 'Insurance policy type is required']
  },
  insurancePolicyNumber: {
    type: String,
    required: [true, 'Insurance policy number is required']
  },
  policyStartDate: {
    type: Date,
    required: [true, 'Policy start date is required']
  },
  policyEndDate: {
    type: Date,
    required: [true, 'Policy end date is required']
  },
  images: [String],
  dailyRate: {
    type: Number,
    required: [true, 'Daily rate is required']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  features: [String],
  ratings: {
    type: Number,
    default: 0
  },
  numberOfReviews: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Car = mongoose.model('Car', carSchema);

export default Car;