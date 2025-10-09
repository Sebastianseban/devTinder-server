
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { generateAccessAndRefreshToken } from "./auth.controller.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const googleAuthHandler = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    throw new ApiError(400, "Authorization code is required");
  }

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code: code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: "postmessage",
        grant_type: "authorization_code",
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const idToken = tokenResponse.data.id_token;

    if (!idToken) {
      throw new ApiError(400, "Invalid ID Token received from Google");
    }

    // Verify the ID token
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name, family_name } = payload;

    if (!email) {
      throw new ApiError(400, "Email not provided by Google");
    }

    // Check if user exists
    let user = await User.findOne({ emailId: email });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;

      // Generate unique username
      const baseUsername =
        (given_name + (family_name || ""))
          .toLowerCase()
          .replace(/\s+/g, "")
          .replace(/[^a-z0-9]/g, "") || "user";

      let username = baseUsername;
      let count = 1;

      while (await User.findOne({ username })) {
        username = `${baseUsername}${count++}`;
      }

      // Create new user
      user = await User.create({
        firstName: given_name || "",
        lastName: family_name || "",
        emailId: email,
        username,
        provider: "google",
        googleId,
        isProfileComplete: false,
      });
    }

    // Generate JWT tokens
    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);
    const safeUser = await User.findById(user._id).select("-password -refreshToken");

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
          isNewUser ? "Google signup successful" : "Google login successful"
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      error.response?.data?.error_description ||
        error.message ||
        "Google authentication failed"
    );
  }
});