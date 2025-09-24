import mongoose from "mongoose";
import validator, { trim } from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      minLength: [4, "First name must be at least 4 characters"],
      maxLength: [50, "First name cannot exceed 50 characters"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"], 
      minLength: [2, "Last name must be at least 2 characters"],
      maxLength: [50, "Last name cannot exceed 50 characters"],
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9._]+$/,
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
    location: { type: String, trim: true, maxlength: 100 },
    headline: { type: String, trim: true, maxlength: 100 },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "others"],
        message: "{VALUE} is not a valid gender type",
      },
    },
    phoneNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^\+?[\d\s\-\(\)]+$/.test(v);
        },
        message: 'Please enter a valid phone number'
      }
    },
    age: {
      type: Number,
      min: 18,
    },
    photoUrl: {
      type: String,
      default: null,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    membershipType: {
      type: String,
      enum: {
        values: ["basic", "premium", "gold", "platinum"],
        message: "{VALUE} is not a valid membership type",
      },
      default: "basic",
    },
    bio: {
      type: String,
      default: "This is a default about of the user!",
      maxLength: [500, "About section cannot exceed 500 characters"],
      trim: true,
    },
    experienceLevel: {
      type: String,
      enum: ["student", "junior", "mid", "senior", "lead", "freelancer"],
      default: "student",
    },
    socialLinks: {
      github: {
       type: String,
       trim:true
      },
      linkedin: {
       type: String,
       trim:true
      },
      portfolio: {
       type: String,
       trim:true
      },
      twitter:{
       type: String,
       trim:true
      },
    },

    refreshToken: {
      type: String,
    },
     isProfileComplete: {
      type: Boolean,
      default: false,
    },
    skills: {
      type: [String],
      validate: {
        validator: function (skills) {
          return !skills || skills.length <= 10;
        },
        message: "User can have up to 10 skills",
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);

  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      emailId: this.emailId,
      firstName: this.firstName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1h",
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    }
  );
};

export const User = mongoose.model("User", userSchema);
