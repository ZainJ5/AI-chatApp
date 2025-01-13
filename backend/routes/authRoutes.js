import express from "express";
import { LogIn, LogOut, SignUp } from "../controllers/authControllers.js";
const router=express.Router();
router.post("/signup",SignUp)
router.post("/login",LogIn)
router.post("/logout",LogOut)
export default router;