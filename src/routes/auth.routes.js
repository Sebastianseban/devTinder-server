import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/auth.controller.js";
import { loginRateLimiter } from "../middleware/rateLimiter.middleware.js";
import {verifyJWT} from "../middleware/auth.Middleware.js"

const router = Router();

router.post("/signup", registerUser);
router.post("/login",loginRateLimiter, loginUser);
router.post("/logout",verifyJWT,logoutUser)

export default router;
