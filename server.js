import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Change this to your MySQL password
  database: 'car_rental'
});

console.log('Connected to MySQL database');

// Create database tables if they don't exist
await initDatabase();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'car_rental_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/myprofile', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'myprofile.html'));
});

app.get('/addcar', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'addcar.html'));
});

app.get('/addcompany', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'addcompany.html'));
});

// API Routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user into database
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user in database
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Set session
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };
    
    res.status(200).json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.get('/api/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/api/user', isAuthenticated, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [req.session.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user: users[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Car management routes
app.post('/api/cars', isAuthenticated, async (req, res) => {
  try {
    const {
      companyName,
      registrationNo,
      carBrand,
      carModel,
      modelYear,
      carColor,
      vehicleType,
      seats,
      engineNo,
      chasisNo,
      engineCapacity,
      engineType,
      insurancePolicyType,
      insurancePolicyNumber,
      policyStartDate,
      policyEndDate
    } = req.body;
    
    const [result] = await db.execute(
      `INSERT INTO cars (
        user_id, company_name, registration_no, car_brand, car_model, 
        model_year, car_color, vehicle_type, seats, engine_no, 
        chasis_no, engine_capacity, engine_type, insurance_policy_type, 
        insurance_policy_number, policy_start_date, policy_end_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.session.userId, companyName, registrationNo, carBrand, carModel,
        modelYear, carColor, vehicleType, seats, engineNo,
        chasisNo, engineCapacity, engineType, insurancePolicyType,
        insurancePolicyNumber, policyStartDate, policyEndDate
      ]
    );
    
    res.status(201).json({ 
      message: 'Car added successfully',
      carId: result.insertId 
    });
  } catch (error) {
    console.error('Error adding car:', error);
    res.status(500).json({ message: 'Server error while adding car' });
  }
});

app.get('/api/cars', isAuthenticated, async (req, res) => {
  try {
    const [cars] = await db.execute(
      'SELECT * FROM cars WHERE user_id = ?',
      [req.session.userId]
    );
    
    res.status(200).json({ cars });
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ message: 'Server error while fetching cars' });
  }
});

// Company management routes
app.post('/api/companies', isAuthenticated, async (req, res) => {
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
      employees,
      postalCode
    } = req.body;
    
    const [result] = await db.execute(
      `INSERT INTO companies (
        user_id, company_name, company_address, company_email, company_mobile,
        owner_name, owner_address, owner_email, owner_mobile, trading_license,
        license_renewal_date, start_date, end_date, website, employees, postal_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.session.userId, companyName, companyAddress, companyEmail, companyMobile,
        ownerName, ownerAddress, ownerEmail, ownerMobile, tradingLicense,
        licenseRenewalDate, startDate, endDate, website, employees, postalCode
      ]
    );
    
    res.status(201).json({ 
      message: 'Company added successfully',
      companyId: result.insertId 
    });
  } catch (error) {
    console.error('Error adding company:', error);
    res.status(500).json({ message: 'Server error while adding company' });
  }
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

// Initialize database tables
async function initDatabase() {
  try {
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create cars table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS cars (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        registration_no VARCHAR(50) NOT NULL,
        car_brand VARCHAR(100) NOT NULL,
        car_model VARCHAR(100) NOT NULL,
        model_year VARCHAR(20) NOT NULL,
        car_color VARCHAR(50) NOT NULL,
        vehicle_type VARCHAR(50) NOT NULL,
        seats INT NOT NULL,
        engine_no VARCHAR(100) NOT NULL,
        chasis_no VARCHAR(100) NOT NULL,
        engine_capacity VARCHAR(50) NOT NULL,
        engine_type VARCHAR(50) NOT NULL,
        insurance_policy_type VARCHAR(100) NOT NULL,
        insurance_policy_number VARCHAR(100) NOT NULL,
        policy_start_date DATE NOT NULL,
        policy_end_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    // Create companies table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        company_address TEXT NOT NULL,
        company_email VARCHAR(255) NOT NULL,
        company_mobile VARCHAR(20) NOT NULL,
        owner_name VARCHAR(255) NOT NULL,
        owner_address TEXT NOT NULL,
        owner_email VARCHAR(255) NOT NULL,
        owner_mobile VARCHAR(20) NOT NULL,
        trading_license VARCHAR(100) NOT NULL,
        license_renewal_date DATE NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        website VARCHAR(255),
        employees INT,
        postal_code VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});