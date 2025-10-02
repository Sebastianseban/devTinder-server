import { Router } from "express";
import { verifyJWT } from "../middleware/auth.Middleware.js";
import { getFeed } from "../controllers/users.controller.js";



const router = Router()


router.get("/feed", verifyJWT, getFeed);


export default router