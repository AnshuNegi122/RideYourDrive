import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  pickupLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  dropoffLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  days: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("Booking", bookingSchema)
