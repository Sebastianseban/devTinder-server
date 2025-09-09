import { ConnectionRequest } from "../models/connectionRequest.model";
import { asyncHandler } from "../utils/asyncHandler";




export const getReceivedRequests = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;

  const { page, limit, skip } = getPaginationParams(req);

  const [connectionRequests, totalCount] = await Promise.all([
    ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .sort({ createdAt: -1 })  
      .skip(skip)
      .limit(limit)
      .lean(),

    ConnectionRequest.countDocuments({
      toUserId: loggedInUser._id,
      status: "interested",
    }),
  ]);

  return res
    .status(200)
    .json(buildPaginatedResponse(connectionRequests, page, limit, totalCount));
});
