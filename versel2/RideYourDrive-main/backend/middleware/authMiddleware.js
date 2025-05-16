import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Generate JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "your_jwt_secret", {
    expiresIn: "30d",
  });
};

// Protect routes middleware
export const protect = async (req, res, next) => {
  let token;
  // In the protect middleware
  console.log("User in protect middleware:", req.user);

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret"
      );

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Admin middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as an admin" });
  }
};

// Company middleware
export const company = async (req, res, next) => {
  // In the company middleware
  console.log("User role in company middleware:", req.user?.role);
  console.log("Company set in middleware:", req.company);
  try {
    // Check if user exists in request (set by the protect middleware)
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Check if user is a company
    if (req.user.role !== "company") {
      return res.status(401).json({ message: "Not authorized as a company" });
    }

    // Set req.company to the user object for company routes
    req.company = req.user;
    next();
  } catch (error) {
    console.error("Error in company middleware:", error);
    res.status(401).json({ message: "Not authorized as a company" });
  }
};
