// import mongoose from "mongoose";
// import validator from "validator";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";

// const userSchema = new mongoose.Schema(
//   {
//     firstName: {
//       type: String,
//       required: [true, "First name is required"],
//       minLength: [4, "First name must be at least 4 characters"],
//       maxLength: [50, "First name cannot exceed 50 characters"],
//       trim: true,
//     },
//     lastName: {
//       type: String,
//       required: [true, "Last name is required"],
//       minLength: [2, "Last name must be at least 2 characters"],
//       maxLength: [50, "Last name cannot exceed 50 characters"],
//       trim: true,
//     },
//     username: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//       minlength: 3,
//       maxlength: 30,
//       match: /^[a-zA-Z0-9._]+$/,
//     },
//     emailId: {
//       type: String,
//       required: [true, "Email is required"],
//       unique: true,
//       lowercase: true,
//       trim: true,
//       index: true,
//       validate: {
//         validator: (value) => validator.isEmail(value),
//         message: (props) => `Invalid email address: ${props.value}`,
//       },
//     },
//   password: {
//      type: String,
//      required: function() {
//        return this.provider !== 'google';
//      },
//    },
//     location: { type: String, trim: true, maxlength: 100 },
//     headline: { type: String, trim: true, maxlength: 100 },
//     gender: {
//       type: String,
//       enum: {
//         values: ["male", "female", "others"],
//         message: "{VALUE} is not a valid gender type",
//       },
//     },
//     phoneNumber: {
//       type: String,
//       trim: true,
//       validate: {
//         validator: function (v) {
//           return !v || /^\+?[\d\s\-\(\)]+$/.test(v);
//         },
//         message: "Please enter a valid phone number",
//       },
//     },
//     age: {
//       type: Number,
//       min: 18,
//     },
//     photoUrl: {
//       type: String,
//       default: null,
//     },
//     isPremium: {
//       type: Boolean,
//       default: false,
//     },
//     membershipType: {
//       type: String,
//       enum: {
//         values: ["basic", "premium", "gold", "platinum"],
//         message: "{VALUE} is not a valid membership type",
//       },
//       default: "basic",
//     },
//     bio: {
//       type: String,
//       default: "This is a default about of the user!",
//       maxLength: [500, "About section cannot exceed 500 characters"],
//       trim: true,
//     },
//     experienceLevel: {
//       type: String,
//       enum: ["student", "junior", "mid", "senior", "lead", "freelancer"],
//       default: "student",
//     },
//     socialLinks: {
//       github: {
//         type: String,
//         trim: true,
//       },
//       linkedin: {
//         type: String,
//         trim: true,
//       },
//       portfolio: {
//         type: String,
//         trim: true,
//       },
    
//       twitter: {
//         type: String,
//         trim: true,
//       },
//     },

//     refreshToken: {
//       type: String,
//     },
//       googleId: {
//         type: String,
//         unique: true,
//         sparse: true, // allows null for local users
//       },

//       provider: {
//         type: String,
//         enum: ["local", "google"],
//         default: "local",
//       },
//     isProfileComplete: {
//       type: Boolean,
//       default: false,
//     },
//     skills: {
//       type: [String],
//       validate: {
//         validator: function (skills) {
//           return !skills || skills.length <= 10;
//         },
//         message: "User can have up to 10 skills",
//       },
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   this.password = await bcrypt.hash(this.password, 10);

//   next();
// });

// userSchema.methods.isPasswordCorrect = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

// userSchema.methods.generateAccessToken = function () {
//   return jwt.sign(
//     {
//       _id: this._id,
//       emailId: this.emailId,
//       firstName: this.firstName,
//     },
//     process.env.ACCESS_TOKEN_SECRET,
//     {
//       expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1h",
//     }
//   );
// };

// userSchema.methods.generateRefreshToken = function () {
//   return jwt.sign(
//     {
//       _id: this._id,
//     },
//     process.env.REFRESH_TOKEN_SECRET,
//     {
//       expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
//     }
//   );
// };

// export const User = mongoose.model("User", userSchema);
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: function () {
        return this.provider === "local"; // only required for local users
      },
      minLength: [2, "First name must be at least 2 characters"],
      maxLength: [50, "First name cannot exceed 50 characters"],
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
      maxLength: [50, "Last name cannot exceed 50 characters"],
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
      required: function () {
        return this.provider === "local"; // only local users need password
      },
    },
    location: { type: String, trim: true, maxlength: 100 },
    headline: { type: String, trim: true, maxlength: 100 },
    gender: {
      type: String,
      enum: ["male", "female", "others"],
    },
    phoneNumber: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || /^\+?[\d\s\-\(\)]+$/.test(v),
        message: "Please enter a valid phone number",
      },
    },
    age: { type: Number, min: 18 },
    photoUrl: { type: String, default: null },
    isPremium: { type: Boolean, default: false },
    membershipType: {
      type: String,
      enum: ["basic", "premium", "gold", "platinum"],
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
      github: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      portfolio: { type: String, trim: true },
      twitter: { type: String, trim: true },
    },

    refreshToken: { type: String },

    // ✅ Added GitHub fields
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows null
    },
    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },

    provider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },

    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    skills: {
      type: [String],
      validate: {
        validator: (skills) => !skills || skills.length <= 10,
        message: "User can have up to 10 skills",
      },
    },
  },
  { timestamps: true }
);

// ✅ Hash password only for local users
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.provider !== "local") return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Compare password (only for local login)
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// ✅ Generate JWT Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      emailId: this.emailId,
      firstName: this.firstName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1h" }
  );
};

// ✅ Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );
};

export const User = mongoose.model("User", userSchema);
