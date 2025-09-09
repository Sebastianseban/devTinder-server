import { ConnectionRequest } from "../models/connectionRequest.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { USER_SAFE_DATA } from "../utils/constants.js";
import {
  getPaginationParams,
  buildPaginatedResponse,
} from "../utils/helpers.js";

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

export const reviewConnectionRequest = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;
  const { requestId } = req.params;
  const { status } = req.body;

  if (!["accepted", "rejected"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const connectionRequest = await ConnectionRequest.findOne({
    _id: requestId,
    toUserId: loggedInUser._id,
    status: "interested",
  });

  if (!connectionRequest) {
    throw new ApiError(404, "Request not found or already handled");
  }

  connectionRequest.status = status;
  await connectionRequest.save();

  return res
    .status(200)
    .json(new ApiResponse(200, connectionRequest, `Request ${status}`));
});

export const getReceivedRequests = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;
  const { page, limit, skip } = getPaginationParams(req);

  const [requests, totalCount] = await Promise.all([
    ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .skip(skip)
      .limit(limit),
    ConnectionRequest.countDocuments({
      toUserId: loggedInUser._id,
      status: "interested",
    }),
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        buildPaginatedResponse(requests, page, limit, totalCount),
        "Received requests fetched successfully"
      )
    );
});

export const getConnections = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;
  const { page, limit, skip } = getPaginationParams(req);

  const [connectionRequests, totalCount] = await Promise.all([
    ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA)
      .skip(skip)
      .limit(limit),

    ConnectionRequest.countDocuments({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    }),
  ]);

  const connections = connectionRequests.map((connection) => {
    if (connection.fromUserId._id.toString() === loggedInUser._id.toString()) {
      return connection.toUserId;
    }
    return connection.fromUserId;
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        buildPaginatedResponse(connections, page, limit, totalCount),
        "Connections fetched successfully"
      )
    );
});
