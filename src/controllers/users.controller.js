import { ConnectionRequest } from "../models/connectionRequest.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildPaginatedResponse, getPaginationParams } from "../utils/helpers.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getFeed = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const { page, limit, skip } = getPaginationParams(req);

  const existingConnections = await ConnectionRequest.find({
    $or: [{ fromUserId: userId }, { toUserId: userId }],
  }).select("fromUserId toUserId");

  const excludedUserIds = new Set([userId.toString()]);
  existingConnections.forEach((conn) => {
    excludedUserIds.add(conn.fromUserId.toString());
    excludedUserIds.add(conn.toUserId.toString());
  });

  const filters = {
    _id: { $nin: Array.from(excludedUserIds) },
    isProfileComplete: true,
  };

  if (req.query.experienceLevel) {
    filters.experienceLevel = req.query.experienceLevel;
  }

  if (req.query.skills) {
    const skillsArray = Array.isArray(req.query.skills)
      ? req.query.skills
      : [req.query.skills];
    filters.skills = { $in: skillsArray };
  }

  if (req.query.location) {
    filters.location = { $regex: req.query.location, $options: "i" };
  }

  const totalCount = await User.countDocuments(filters);

  const users = await User.find(filters)
    .select("-password -refreshToken -__v")
    .skip(skip)
    .limit(limit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        buildPaginatedResponse(users, page, limit, totalCount),
        `Found ${users.length} developers for you to connect with`
      )
    );
});
