
import express, { Router } from "express";
import { completeProfile } from "../controllers/profileController.js";
import { verifyJWT } from "../middleware/auth.Middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();


router.post(
  "/complete",
  verifyJWT,                      
  upload.single("photo"),          
  completeProfile                  
);

export default router;
