import Company from '../models/companyModel.js';
import User from '../models/userModel.js';

// @desc    Register a new company
// @route   POST /api/companies
// @access  Private
export const registerCompany = async (req, res) => {
  try {
    const {
      companyName,
      companyAddress,
      companyEmail,
      companyMobile,
      ownerName,
      ownerAddress,
      ownerEmail,
      ownerMobile,
      tradingLicense,
      licenseRenewalDate,
      startDate,
      endDate,
      website,
      numberOfEmployees,
      postalCode
    } = req.body;

    // Check if company already exists with this email
    const companyExists = await Company.findOne({ companyEmail });

    if (companyExists) {
      return res.status(400).json({ message: 'Company already exists with this email' });
    }

    // Create new company
    const company = await Company.create({
      userId: req.user._id,
      companyName,
      companyAddress,
      companyEmail,
      companyMobile,
      ownerName,
      ownerAddress,
      ownerEmail,
      ownerMobile,
      tradingLicense,
      licenseRenewalDate,
      startDate,
      endDate,
      website,
      numberOfEmployees,
      postalCode
    });

    if (company) {
      // Update user role to company
      await User.findByIdAndUpdate(req.user._id, { role: 'company' });
      
      res.status(201).json(company);
    } else {
      res.status(400).json({ message: 'Invalid company data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get company profile
// @route   GET /api/companies/profile
// @access  Private
export const getCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });

    if (company) {
      res.json(company);
    } else {
      res.status(404).json({ message: 'Company not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update company profile
// @route   PUT /api/companies/profile
// @access  Private
export const updateCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });

    if (company) {
      company.companyName = req.body.companyName || company.companyName;
      company.companyAddress = req.body.companyAddress || company.companyAddress;
      company.companyEmail = req.body.companyEmail || company.companyEmail;
      company.companyMobile = req.body.companyMobile || company.companyMobile;
      company.ownerName = req.body.ownerName || company.ownerName;
      company.ownerAddress = req.body.ownerAddress || company.ownerAddress;
      company.ownerEmail = req.body.ownerEmail || company.ownerEmail;
      company.ownerMobile = req.body.ownerMobile || company.ownerMobile;
      company.tradingLicense = req.body.tradingLicense || company.tradingLicense;
      company.licenseRenewalDate = req.body.licenseRenewalDate || company.licenseRenewalDate;
      company.startDate = req.body.startDate || company.startDate;
      company.endDate = req.body.endDate || company.endDate;
      company.website = req.body.website || company.website;
      company.numberOfEmployees = req.body.numberOfEmployees || company.numberOfEmployees;
      company.postalCode = req.body.postalCode || company.postalCode;

      const updatedCompany = await company.save();
      res.json(updatedCompany);
    } else {
      res.status(404).json({ message: 'Company not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private/Admin
export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({});
    res.json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify a company
// @route   PUT /api/companies/:id/verify
// @access  Private/Admin
export const verifyCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (company) {
      company.isVerified = true;
      const updatedCompany = await company.save();
      res.json(updatedCompany);
    } else {
      res.status(404).json({ message: 'Company not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};