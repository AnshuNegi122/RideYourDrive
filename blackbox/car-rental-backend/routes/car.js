const express = require('express');
const Car = require('../models/Car'); // Ensure the path is correct

const router = express.Router();

// Add Car
router.post('/', async (req, res) => {
    const newCar = new Car(req.body);
    try {
        await newCar.save();
        res.status(201).json({ message: 'Car added successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get All Cars
router.get('/', async (req, res) => {
    try {
        const cars = await Car.find(); // Fetch all cars from the database
        res.status(200).json({ cars }); // Send the cars as a JSON response
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle errors
    }
});

module.exports = router;
