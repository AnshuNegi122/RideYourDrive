import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required']
  },
  companyAddress: {
    type: String,
    required: [true, 'Company address is required']
  },
  companyEmail: {
    type: String,
    required: [true, 'Company email is required'],
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  companyMobile: {
    type: String,
    required: [true, 'Company mobile number is required']
  },
  ownerName: {
    type: String,
    required: [true, 'Owner name is required']
  },
  ownerAddress: {
    type: String,
    required: [true, 'Owner address is required']
  },
  ownerEmail: {
    type: String,
    required: [true, 'Owner email is required'],
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  ownerMobile: {
    type: String,
    required: [true, 'Owner mobile number is required']
  },
  tradingLicense: {
    type: String,
    required: [true, 'Trading license is required']
  },
  licenseRenewalDate: {
    type: Date,
    required: [true, 'License renewal date is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  website: String,
  numberOfEmployees: Number,
  postalCode: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Company = mongoose.model('Company', companySchema);

export default Company;