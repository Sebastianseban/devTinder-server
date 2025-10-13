import axios from "axios";
import { generateAccessAndRefreshToken } from "./auth.controller.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const githubAuthHandler = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) throw new ApiError(400, "Authorization code is required");

  try {
    // 1️⃣ Exchange code for GitHub access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const githubAccessToken = tokenResponse.data.access_token;
    if (!githubAccessToken)
      throw new ApiError(401, "GitHub access token not received");

    // 2️⃣ Fetch user info from GitHub API
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${githubAccessToken}` },
    });

    // Some GitHub users hide email; fetch separately
    const emailResponse = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${githubAccessToken}` },
    });

    const githubData = userResponse.data;
    const primaryEmail =
      emailResponse.data.find((e) => e.primary)?.email ||
      emailResponse.data[0]?.email;

    if (!primaryEmail) throw new ApiError(400, "GitHub email not found");

    // 3️⃣ Check if user exists
    let user = await User.findOne({ emailId: primaryEmail });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;

      // Generate unique username
      const baseUsername =
        githubData.login?.toLowerCase() ||
        githubData.name?.toLowerCase()?.replace(/\s+/g, "") ||
        "user";

      let username = baseUsername;
      let count = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${count++}`;
      }

      // Create user
      user = await User.create({
        firstName: githubData.name?.split(" ")[0] || "",
        lastName: githubData.name?.split(" ")[1] || "",
        username,
        emailId: primaryEmail,
        provider: "github",
        githubId: githubData.id,
        photoUrl: githubData.avatar_url,
        isProfileComplete: false,
      });
    }

    // 4️⃣ Generate tokens
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    const safeUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    // 5️⃣ Set refresh token cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    // 6️⃣ Respond
    return res
      .status(200)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { user: safeUser, accessToken },
          isNewUser ? "GitHub signup successful" : "GitHub login successful"
        )
      );
  } catch (error) {
    console.error("GitHub OAuth error:", error.response?.data || error.message);
    throw new ApiError(
      401,
      error.response?.data?.error_description || "GitHub authentication failed"
    );
  }
});
