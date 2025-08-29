import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "user not found while generating tokens");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error in generateAccessAndRefreshToken:", error.message);
    throw new ApiError(
      500,
      "something went wrong while generating refresh and access token"
    );
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !emailId || !password) {
    throw new ApiError(400, "Required fields are missing", [
      { field: "firstName", message: "First name is required" },
      { field: "emailId", message: "Email is required" },
      { field: "password", message: "Password is required" },
    ]);
  }

  const existingUser = await User.findOne({ emailId });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const user = await User.create({
    firstName,
    lastName,
    emailId,
    password,
  });

  if (!user) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "User creation failed");
  }

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(201)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        201,
        {
          user: createdUser,
          accessToken,
        },
        "User registered and logged in successfully"
      )
    );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { emailId, password } = req.body;

  if (!emailId || !password) {
    throw new ApiError(400, "Required fields are missing", [
      { field: "emailId", message: "Email is required" },
      { field: "password", message: "Password is required" },
    ]);
  }

  const user = await User.findOne({ emailId });

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        "User logged in Successfully"
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, NewRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("refreshToken", NewRefreshToken, options)
      .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token");
  }
});

export const getCurrentUser = asyncHandler(async (req,res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized access");
  }

  const user = await User.findById(userId).select("-password -refreshToken" )

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
  .status(200)
  .json(new ApiResponse(200, user, "User fetched successfully"));
})
