import { Router } from "express";
import {
  getConnections,
  getReceivedRequests,
  reviewConnectionRequest,
  sendConnectionRequest,
} from "../controllers/connectionRequest.controller.js";
import { verifyJWT } from "../middleware/auth.Middleware.js";

const router = Router();

router.post("/send", verifyJWT, sendConnectionRequest);
router.patch("/review/:requestId", verifyJWT, reviewConnectionRequest);
router.get("/received", verifyJWT, getReceivedRequests);
router.get("/", verifyJWT, getConnections);

export default router;
