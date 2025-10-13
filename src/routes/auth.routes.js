import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/auth.controller.js";
import { loginRateLimiter } from "../middleware/rateLimiter.middleware.js";
import { verifyJWT } from "../middleware/auth.Middleware.js";
import { googleAuthHandler } from "../controllers/google.controller.js";
import { githubAuthHandler } from "../controllers/github.controller.js";


const router = Router();

router.post("/signup", registerUser);
router.post("/signin", loginRateLimiter, loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.route("/refresh-token").get(refreshAccessToken);
router.route("/me").get(verifyJWT, getCurrentUser);

router.route("/google-auth").post(googleAuthHandler);
router.post("/github", githubAuthHandler);

export default router;
