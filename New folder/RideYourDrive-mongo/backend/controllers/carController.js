import Car from '../models/carModel.js';
import Company from '../models/companyModel.js';

// @desc    Add a new car
// @route   POST /api/cars
// @access  Private/Company
export const addCar = async (req, res) => {
  try {
    // Find company by user ID
    const company = await Company.findOne({ userId: req.user._id });
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    if (!company.isVerified) {
      return res.status(400).json({ message: 'Company is not verified yet' });
    }

    const {
      registrationNumber,
      brand,
      model,
      modelYear,
      color,
      vehicleType,
      numberOfSeats,
      engineNumber,
      chasisNumber,
      engineCapacity,
      engineType,
      transmissionType,
      insurancePolicyType,
      insurancePolicyNumber,
      policyStartDate,
      policyEndDate,
      images,
      dailyRate,
      location,
      features
    } = req.body;

    // Check if car already exists with this registration number
    const carExists = await Car.findOne({ registrationNumber });

    if (carExists) {
      return res.status(400).json({ message: 'Car already exists with this registration number' });
    }

    // Create new car
    const car = await Car.create({
      companyId: company._id,
      registrationNumber,
      brand,
      model,
      modelYear,
      color,
      vehicleType,
      numberOfSeats,
      engineNumber,
      chasisNumber,
      engineCapacity,
      engineType,
      transmissionType,
      insurancePolicyType,
      insurancePolicyNumber,
      policyStartDate,
      policyEndDate,
      images,
      dailyRate,
      location,
      features
    });

    if (car) {
      res.status(201).json(car);
    } else {
      res.status(400).json({ message: 'Invalid car data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all cars
// @route   GET /api/cars
// @access  Public
export const getCars = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    
    const keyword = req.query.keyword
      ? {
          $or: [
            { brand: { $regex: req.query.keyword, $options: 'i' } },
            { model: { $regex: req.query.keyword, $options: 'i' } },
            { vehicleType: { $regex: req.query.keyword, $options: 'i' } },
            { location: { $regex: req.query.keyword, $options: 'i' } }
          ]
        }
      : {};
      
    const vehicleType = req.query.vehicleType
      ? { vehicleType: req.query.vehicleType }
      : {};
      
    const location = req.query.location
      ? { location: req.query.location }
      : {};
      
    const count = await Car.countDocuments({ ...keyword, ...vehicleType, ...location });
    
    const cars = await Car.find({ ...keyword, ...vehicleType, ...location })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });
      
    res.json({
      cars,
      page,
      pages: Math.ceil(count / pageSize),
      count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get car by ID
// @route   GET /api/cars/:id
// @access  Public
export const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    
    if (car) {
      res.json(car);
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update car
// @route   PUT /api/cars/:id
// @access  Private/Company
export const updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    // Find company by user ID
    const company = await Company.findOne({ userId: req.user._id });
    
    // Check if the car belongs to the company
    if (car.companyId.toString() !== company._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this car' });
    }
    
    // Update car fields
    Object.keys(req.body).forEach(key => {
      car[key] = req.body[key];
    });
    
    const updatedCar = await car.save();
    res.json(updatedCar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private/Company
export const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid car ID format' });
    }

    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const company = await Company.findOne({ userId: req.user._id });
    if (!company && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Company not found and not admin' });
    }

    const isOwner = car.companyId?.toString() === company?._id?.toString();

    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this car' });
    }

    await Car.deleteOne({ _id: id });
    res.json({ message: 'Car removed successfully' });

  } catch (error) {
    console.error('DeleteCar Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @desc    Get company cars
// @route   GET /api/cars/company
// @access  Private/Company
export const getCompanyCars = async (req, res) => {
  try {
    // Find company by user ID
    const company = await Company.findOne({ userId: req.user._id });
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    const cars = await Car.find({ companyId: company._id });
    res.json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};