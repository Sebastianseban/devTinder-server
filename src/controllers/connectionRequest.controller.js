import { ConnectionRequest } from "../models/connectionRequest.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler.ja";

export const sendConnectionRequest = asyncHandler(async (req, res) => {
  const fromUserId = req.user._id;
  const { toUserId, status } = req.body;

  if (!["ignored", "interested"].includes(status)) {
    throw new ApiError(400, `Invalid status type: ${status}`);
  }

  const toUser = await User.findById(toUserId);

  if (!toUser) {
    throw new ApiError(404, "User not found");
  }

  const existing = await ConnectionRequest.findOne({
    $or: [
      { fromUserId, toUserId },
      { fromUserId: toUserId, toUserId: fromUserId },
    ],
  });

  if (existing) {
    throw new ApiError(400, "Connection request already exists");
  }

  const request = await ConnectionRequest.create({
    fromUserId,
    toUserId,
    status,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        request,
        `Request sent: ${req.user.firstName} is ${status} in ${toUser.firstName}`
      )
    );
});
