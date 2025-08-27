import { Router } from "express";
import { loginUser, registerUser } from "../controllers/auth.controller.js";
import { loginRateLimiter } from "../middleware/rateLimiter.middleware.js";

const router = Router();

router.post("/signup", registerUser);
router.post("/login",loginRateLimiter, loginUser);

export default router;
