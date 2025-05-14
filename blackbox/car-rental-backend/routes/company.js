const express = require('express');
const Company = require('../models/Company');

const router = express.Router();

// Add Company
router.post('/', async (req, res) => {
    const newCompany = new Company(req.body);
    try {
        await newCompany.save();
        res.status(201).json({ message: 'Company registered successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ✅ Get Company by name (used to fetch _id for car registration)
router.get('/', async (req, res) => {
    try {
        const companyName = req.query.name;
        if (!companyName) {
            return res.status(400).json({ message: 'Company name is required' });
        }

        const company = await Company.findOne({ companyName });

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.json(company); // returns the full company object, including _id
    } catch (error) {
        console.error('Error fetching company:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
