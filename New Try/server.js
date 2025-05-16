import express from "express";
import path from "path";
import mongoose from "mongoose";
import session from "express-session";
import bcrypt from "bcrypt";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import crypto from "crypto";

// Models
import User from "./models/User.js";
import Vehicle from "./models/Vehicle.js";
import Company from "./models/Company.js";
import Booking from "./models/Booking.js";
import Verification from "./models/Verification.js";
import Payment from "./models/Payment.js";
import Location from "./models/Location.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://admin:admin%40123@testdb.xjyhi3g.mongodb.net/rental?retryWrites=true&w=majority&appName=testdb",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  session({
    secret: "vehicle-rental-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
  })
);

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.redirect("/login");
};

const isRenter = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);
    if (user && user.userType === "renter") {
      return next();
    }
    res.redirect("/dashboard");
  } catch (error) {
    res.redirect("/login");
  }
};

const isOwner = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);
    if (user && user.userType === "owner") {
      return next();
    }
    res.redirect("/dashboard");
  } catch (error) {
    res.redirect("/login");
  }
};

// Initialize default locations if none exist
const initializeLocations = async () => {
  const count = await Location.countDocuments();
  if (count === 0) {
    const defaultLocations = [
      { name: "New York" },
      { name: "Los Angeles" },
      { name: "Chicago" },
      { name: "Houston" },
      { name: "Phoenix" },
      { name: "Philadelphia" },
      { name: "San Antonio" },
      { name: "San Diego" },
      { name: "Dallas" },
      { name: "San Jose" },
      { name: "Dehradun" },
      { name: "Mumbai" },
      { name: "Delhi" },
      { name: "Bangalore" },
      { name: "Hyderabad" },
    ];

    await Location.insertMany(defaultLocations);
    console.log("Default locations initialized");
  }
};

initializeLocations();

// Routes
app.get("/", async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true });

    let vehicles = [];
    if (req.session.userId) {
      vehicles = await Vehicle.find({ isAvailable: true })
        .populate("companyId")
        .sort({ createdAt: -1 })
        .limit(6);
    }

    res.render("index", {
      user: req.session.userId,
      locations,
      vehicles,
    });
  } catch (error) {
    console.error(error);
    res.render("index", {
      user: req.session.userId,
      locations: [],
      vehicles: [],
    });
  }
});

// Auth routes
app.get("/register", (req, res) => {
  res.render("register", { error: null });
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("register", { error: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      userType,
    });

    await user.save();
    req.session.userId = user._id;
    res.redirect("/dashboard");
  } catch (error) {
    res.render("register", { error: "Registration failed" });
  }
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.render("login", { error: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", { error: "Invalid email or password" });
    }

    req.session.userId = user._id;

    // Redirect renters to search page, owners to dashboard
    if (user.userType === "renter") {
      res.redirect("/search");
    } else {
      res.redirect("/dashboard");
    }
  } catch (error) {
    res.render("login", { error: "Login failed" });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Profile routes
app.get("/profile", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    let verification = null;
    let company = null;

    if (user.userType === "renter") {
      verification = await Verification.findOne({ userId: user._id });
    } else {
      company = await Company.findOne({ userId: user._id });
    }

    res.render("profile", { user, verification, company });
  } catch (error) {
    console.error(error);
    res.redirect("/dashboard");
  }
});

app.post("/profile/update", isAuthenticated, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    await User.findByIdAndUpdate(req.session.userId, {
      name,
      email,
      phone,
    });

    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.redirect("/profile");
  }
});

app.post("/profile/password", isAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return res.redirect("/profile");
    }

    // Get user and check current password
    const user = await User.findById(req.session.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.redirect("/profile");
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.redirect("/profile");
  }
});

// Dashboard
app.get("/dashboard", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    if (user.userType === "renter") {
      const verification = await Verification.findOne({ userId: user._id });
      const vehicles = await Vehicle.find({ isAvailable: true }).populate(
        "companyId"
      );
      const bookings = await Booking.find({ userId: user._id }).populate(
        "vehicleId"
      );

      res.render("renter-dashboard", {
        user,
        verification,
        vehicles,
        bookings,
        isVerified: verification && verification.isVerified,
      });
    } else {
      const company = await Company.findOne({ userId: user._id });
      let vehicles = [];

      if (company) {
        vehicles = await Vehicle.find({ companyId: company._id });
      }

      const bookings = await Booking.find()
        .populate("vehicleId")
        .populate("userId");
      const pendingBookings = bookings.filter(
        (booking) =>
          vehicles.some(
            (v) => v._id.toString() === booking.vehicleId._id.toString()
          ) && booking.status === "pending"
      );

      res.render("owner-dashboard", {
        user,
        company,
        vehicles,
        pendingBookings,
        hasCompany: !!company,
      });
    }
  } catch (error) {
    console.error(error);
    res.redirect("/login");
  }
});

// Verification routes
app.get("/verification", isAuthenticated, isRenter, async (req, res) => {
  try {
    const verification = await Verification.findOne({
      userId: req.session.userId,
    });
    res.render("verification", { verification });
  } catch (error) {
    res.redirect("/dashboard");
  }
});

app.post(
  "/verification",
  isAuthenticated,
  isRenter,
  upload.fields([
    { name: "drivingLicense", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const drivingLicense = req.files.drivingLicense[0].path;
      const panCard = req.files.panCard[0].path;

      let verification = await Verification.findOne({
        userId: req.session.userId,
      });

      if (verification) {
        verification.drivingLicense = drivingLicense;
        verification.panCard = panCard;
        verification.isVerified = false; // Reset verification status
        verification.status = "pending";
      } else {
        verification = new Verification({
          userId: req.session.userId,
          drivingLicense,
          panCard,
          isVerified: false,
          status: "pending",
        });
      }

      await verification.save();
      res.redirect("/dashboard");
    } catch (error) {
      res.redirect("/verification");
    }
  }
);

// Company routes
app.get("/company", isAuthenticated, isOwner, async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.session.userId });
    res.render("company", { company, error: null });
  } catch (error) {
    res.redirect("/dashboard");
  }
});

app.post(
  "/company",
  isAuthenticated,
  isOwner,
  upload.single("logo"),
  async (req, res) => {
    try {
      const { name, address, description } = req.body;
      const logo = req.file ? req.file.path : null;

      let company = await Company.findOne({ userId: req.session.userId });

      if (company) {
        company.name = name;
        company.address = address;
        company.description = description;
        if (logo) company.logo = logo;
      } else {
        company = new Company({
          userId: req.session.userId,
          name,
          address,
          description,
          logo,
        });
      }

      await company.save();
      res.redirect("/dashboard");
    } catch (error) {
      const company = await Company.findOne({ userId: req.session.userId });
      res.render("company", {
        company,
        error: "Failed to save company details",
      });
    }
  }
);

// Vehicle routes
app.get("/vehicles/add", isAuthenticated, isOwner, async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.session.userId });

    if (!company) {
      return res.redirect("/company");
    }

    res.render("add-vehicle", { error: null });
  } catch (error) {
    res.redirect("/dashboard");
  }
});

app.post(
  "/vehicles/add",
  isAuthenticated,
  isOwner,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const company = await Company.findOne({ userId: req.session.userId });

      if (!company) {
        return res.redirect("/company");
      }

      const { type, make, model, year, price, description } = req.body;
      const images = req.files.map((file) => file.path);

      const vehicle = new Vehicle({
        companyId: company._id,
        type,
        make,
        model,
        year,
        price,
        description,
        images,
        isAvailable: true,
      });

      await vehicle.save();
      res.redirect("/dashboard");
    } catch (error) {
      res.render("add-vehicle", { error: "Failed to add vehicle" });
    }
  }
);

app.get("/vehicles/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate("companyId");

    if (!vehicle) {
      return res.redirect("/");
    }

    let userVerified = false;
    const locations = await Location.find({ isActive: true });

    // Get query parameters for booking
    const selectedPickup =
      req.query.pickupLocation ||
      (locations.length > 0 ? locations[0]._id.toString() : "");
    const selectedDropoff =
      req.query.dropoffLocation ||
      (locations.length > 0 ? locations[0]._id.toString() : "");
    const startDate =
      req.query.startDate || new Date().toISOString().split("T")[0];
    const endDate =
      req.query.endDate ||
      new Date(Date.now() + 86400000).toISOString().split("T")[0];

    if (req.session.userId) {
      const user = await User.findById(req.session.userId);

      if (user.userType === "renter") {
        const verification = await Verification.findOne({
          userId: req.session.userId,
          isVerified: true,
        });

        userVerified = !!verification;
      }
    }

    res.render("vehicle-details", {
      vehicle,
      isAuthenticated: !!req.session.userId,
      userVerified,
      locations,
      selectedPickup,
      selectedDropoff,
      startDate,
      endDate,
    });
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

// Search routes
app.get("/search", async (req, res) => {
  try {
    const {
      pickupLocation,
      dropoffLocation,
      startDate,
      endDate,
      type,
      minPrice,
      maxPrice,
      sort,
    } = req.query;

    // Get all locations
    const locations = await Location.find({ isActive: true });

    // Build query
    const query = { isAvailable: true };

    // Filter by type
    if (type && type !== "all") {
      query.type = type;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number.parseInt(minPrice);
      if (maxPrice) query.price.$lte = Number.parseInt(maxPrice);
    }

    // Sort options
    let sortOption = {};
    if (sort === "price_asc") {
      sortOption = { price: 1 };
    } else if (sort === "price_desc") {
      sortOption = { price: -1 };
    } else {
      sortOption = { createdAt: -1 }; // newest first by default
    }

    // Get vehicles
    const vehicles = await Vehicle.find(query)
      .populate("companyId")
      .sort(sortOption);

    res.render("search", {
      user: req.session.userId,
      vehicles,
      locations,
      selectedPickup:
        pickupLocation ||
        (locations.length > 0 ? locations[0]._id.toString() : ""),
      selectedDropoff:
        dropoffLocation ||
        (locations.length > 0 ? locations[0]._id.toString() : ""),
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate:
        endDate || new Date(Date.now() + 86400000).toISOString().split("T")[0],
      type: type || "all",
      minPrice: minPrice || 0,
      maxPrice: maxPrice || 500,
      sort: sort || "newest",
    });
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

// Booking routes
app.post("/book/:vehicleId", isAuthenticated, isRenter, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId);

    if (!vehicle || !vehicle.isAvailable) {
      return res.redirect("/dashboard");
    }

    const verification = await Verification.findOne({
      userId: req.session.userId,
      isVerified: true,
    });

    if (!verification) {
      return res.redirect("/verification");
    }

    const { pickupLocation, dropoffLocation, startDate, endDate } = req.body;

    // Calculate booking details
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const subtotal = vehicle.price * days;
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    // Create booking
    const booking = new Booking({
      userId: req.session.userId,
      vehicleId: vehicle._id,
      startDate,
      endDate,
      pickupLocation,
      dropoffLocation,
      days,
      subtotal,
      tax,
      total,
      status: "pending",
    });

    await booking.save();

    // Redirect to payment page
    res.redirect(`/payment/${booking._id}`);
  } catch (error) {
    console.error(error);
    res.redirect("/dashboard");
  }
});

// Payment routes
app.get("/payment/:bookingId", isAuthenticated, isRenter, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate(
      "vehicleId"
    );

    if (
      !booking ||
      booking.userId.toString() !== req.session.userId.toString()
    ) {
      return res.redirect("/dashboard");
    }

    const pickupLocation = await Location.findById(booking.pickupLocation);
    const dropoffLocation = await Location.findById(booking.dropoffLocation);

    res.render("payment", {
      bookingId: booking._id,
      vehicle: booking.vehicleId,
      pickupLocation: pickupLocation.name,
      dropoffLocation: dropoffLocation.name,
      startDate: booking.startDate,
      endDate: booking.endDate,
      days: booking.days,
      subtotal: booking.subtotal,
      tax: booking.tax,
      total: booking.total,
    });
  } catch (error) {
    console.error(error);
    res.redirect("/dashboard");
  }
});

app.post("/payment/process", isAuthenticated, isRenter, async (req, res) => {
  try {
    const { bookingId, amount, tax, total, paymentMethod } = req.body;

    const booking = await Booking.findById(bookingId);

    if (
      !booking ||
      booking.userId.toString() !== req.session.userId.toString()
    ) {
      return res.redirect("/dashboard");
    }

    // Generate a transaction ID
    const transactionId = crypto.randomBytes(8).toString("hex");

    // Create payment record
    const payment = new Payment({
      bookingId,
      userId: req.session.userId,
      amount: Number.parseFloat(amount),
      tax: Number.parseFloat(tax),
      totalAmount: Number.parseFloat(total),
      paymentMethod,
      transactionId,
      status: "completed",
    });

    await payment.save();

    // Update booking status
    booking.status = "approved";
    await booking.save();

    // Mark vehicle as unavailable
    const vehicle = await Vehicle.findById(booking.vehicleId);
    vehicle.isAvailable = false;
    await vehicle.save();

    res.redirect(`/payment/success/${payment._id}`);
  } catch (error) {
    console.error(error);
    res.redirect("/dashboard");
  }
});

app.get(
  "/payment/success/:paymentId",
  isAuthenticated,
  isRenter,
  async (req, res) => {
    try {
      const payment = await Payment.findById(req.params.paymentId);

      if (
        !payment ||
        payment.userId.toString() !== req.session.userId.toString()
      ) {
        return res.redirect("/dashboard");
      }

      const booking = await Booking.findById(payment.bookingId).populate(
        "vehicleId"
      );

      res.render("payment-success", {
        payment,
        booking,
      });
    } catch (error) {
      console.error(error);
      res.redirect("/dashboard");
    }
  }
);

app.post("/booking/:id/approve", isAuthenticated, isOwner, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.redirect("/dashboard");
    }

    booking.status = "approved";
    await booking.save();

    res.redirect("/dashboard");
  } catch (error) {
    res.redirect("/dashboard");
  }
});

app.post("/booking/:id/reject", isAuthenticated, isOwner, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.redirect("/dashboard");
    }

    booking.status = "rejected";
    await booking.save();

    // Make vehicle available again
    const vehicle = await Vehicle.findById(booking.vehicleId);
    vehicle.isAvailable = true;
    await vehicle.save();

    res.redirect("/dashboard");
  } catch (error) {
    res.redirect("/dashboard");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
