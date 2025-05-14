const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    registrationNo: { type: String, required: true },
    carBrand: { type: String, required: true },
    carModel: { type: String, required: true },
    modelYear: { type: Number, required: true },
    carColor: { type: String, required: true },
    vehicleType: { type: String, required: true },
    noOfSeats: { type: Number, required: true },
    engineNo: { type: String, required: true },
    chasisNo: { type: String, required: true },
    engineCapacity: { type: String, required: true },
    engineType: { type: String, required: true },
    insurancePolicyType: { type: String, required: true },
    insurancePolicyNumber: { type: String, required: true },
    policyStartDate: { type: Date, required: false },
    policyEndDate: { type: Date, required: false },
});

module.exports = mongoose.model('Car', CarSchema);
