import { OAuth2Client } from "google-auth-library";


import { generateAccessAndRefreshToken } from "./auth.controller.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage"
);

export const googleAuthHandler = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    throw new ApiError(400, "Authorization code is required");
  }


  const { tokens } = await client.getToken(code);
  const idToken = tokens.id_token;

  if (!idToken) {
    throw new ApiError(400, "Invalid ID Token");
  }


  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { sub: googleId, email, given_name, family_name } = payload;

  
  let user = await User.findOne({ emailId: email });

  if (!user) {
    
    const baseUsername =
      (given_name + family_name || given_name || "user").toLowerCase().replace(/\s+/g, "");
    let username = baseUsername;
    let count = 1;


    while (await User.findOne({ username })) {
      username = `${baseUsername}${count++}`;
    }

 
    user = await User.create({
      firstName: given_name,
      lastName: family_name || "",
      emailId: email,
      username,
      provider: "google",
      googleId,
      isProfileComplete: false,
    });
  }

 
  const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);

  const safeUser = await User.findById(user._id).select("-password -refreshToken");

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: safeUser,
          accessToken,
        },
        user.isNew ? "Google signup successful" : "Google login successful"
      )
    );
});
