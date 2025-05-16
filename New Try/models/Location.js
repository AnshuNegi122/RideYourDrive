import mongoose from "mongoose"

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("Location", locationSchema)
