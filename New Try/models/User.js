import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  userType: {
    type: String,
    enum: ["owner", "renter"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("User", userSchema)
