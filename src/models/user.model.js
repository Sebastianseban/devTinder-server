import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    minLength: [4, "First name must be at least 4 characters"],
    maxLength: [50, "First name cannot exceed 50 characters"],
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  emailId: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: (props) => `Invalid email address: ${props.value}`,
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [8, "Password must be at least 8 characters"],
  },
  gender: {
    type: String,
    enum: {
      values: ["male", "female", "others"],
      message: "{VALUE} is not a valid gender type",
    },
  },
});

export const User = mongoose.model("User", userSchema);
