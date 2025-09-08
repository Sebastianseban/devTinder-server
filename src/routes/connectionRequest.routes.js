import { Router } from "express";
import {
  reviewConnectionRequest,
  sendConnectionRequest,
} from "../controllers/connectionRequest.controller.js";
import { verifyJWT } from "../middleware/auth.Middleware.js";

const router = Router();

router.post("/send", verifyJWT, sendConnectionRequest);
router.post("/review/:requestId", verifyJWT, reviewConnectionRequest);

export default router;
