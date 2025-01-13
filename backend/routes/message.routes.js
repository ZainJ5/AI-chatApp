import express from "express";
import { getMessages, sendMessage,uploadFile } from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";
import {upload,protectFileRoute} from "../middleware/upload.js";

const router = express.Router();
router.post('/upload', protectFileRoute, upload.single('file'),uploadFile)
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

export default router;