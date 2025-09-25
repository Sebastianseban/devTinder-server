import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";


export const completeProfile = asyncHandler(async (req, res) => {
  const {
    gender,
    age,
    location,
    headline,
    phoneNumber,
    experienceLevel,
    skills,
    bio,
    socialLinks,
  } = req.body;

  const userId = req.user._id;
  const errors = [];

  // -------------------- Validation --------------------
  if (age && (isNaN(age) || age < 18 || age > 100)) {
    errors.push({ field: "age", message: "Age must be between 18 and 100" });
  }

  if (gender && !["male", "female", "others"].includes(gender)) {
    errors.push({ field: "gender", message: "Invalid gender selection" });
  }

  if (
    experienceLevel &&
    !["student", "junior", "mid", "senior", "lead", "freelancer"].includes(experienceLevel)
  ) {
    errors.push({ field: "experienceLevel", message: "Invalid experience level" });
  }

  if (headline && headline.length > 100) {
    errors.push({ field: "headline", message: "Headline cannot exceed 100 characters" });
  }

  if (bio && bio.length > 500) {
    errors.push({ field: "bio", message: "Bio cannot exceed 500 characters" });
  }

  if (errors.length > 0) {
    throw new ApiError(400, "Invalid field values", errors);
  }

  // -------------------- Skills --------------------
  let processedSkills = [];
  if (skills) {
    if (Array.isArray(skills)) {
      processedSkills = skills
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0)
        .slice(0, 10);
    } else if (typeof skills === "string") {
      processedSkills = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0)
        .slice(0, 10);
    }
  }

  // -------------------- File Upload --------------------
  let photoUrl = null;
  if (req.file && req.file.path) {
    const uploaded = await uploadToCloudinary(req.file.path, "devTinder");
    photoUrl = uploaded ? uploaded.secure_url : null;
  }

  // -------------------- Update DB --------------------
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      gender,
      age,
      location,
      headline,
      phoneNumber,
      experienceLevel,
      skills: processedSkills,
      bio,
      socialLinks,
      photoUrl,
      isProfileComplete: true,
    },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  // -------------------- Response Shaping --------------------
  const userResponse = {
    _id: updatedUser._id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    username: updatedUser.username,
    emailId: updatedUser.emailId,
    location: updatedUser.location,
    headline: updatedUser.headline,
    gender: updatedUser.gender,
    age: updatedUser.age,
    phoneNumber: updatedUser.phoneNumber,
    experienceLevel: updatedUser.experienceLevel,
    skills: updatedUser.skills,
    bio: updatedUser.bio,
    socialLinks: updatedUser.socialLinks,
    photoUrl: updatedUser.photoUrl,
    isProfileComplete: updatedUser.isProfileComplete,
  };

  // -------------------- Final Response --------------------
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: userResponse,
        isProfileComplete: true,
      },
      "Profile completed successfully"
    )
  );
});
