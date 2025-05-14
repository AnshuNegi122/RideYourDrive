const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    companyAddress: { type: String, required: true },
    companyEmail: { type: String, required: true },
    companyMobile: { type: String, required: true },
    ownerName: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    ownerMobile: { type: String, required: true },
    tradingLicense: { type: String, required: false },
    licenseRenewalDate: { type: Date, required: false },
});

module.exports = mongoose.model('Company', CompanySchema);
