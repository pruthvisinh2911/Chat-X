import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { sendMessage,getMessages,markAsSeen } from "../controllers/message.controller.js";

const router = express.Router();

router.post("/message/:userId", protect, sendMessage);
router.get("/message/:userId", protect, getMessages);
router.put("/message/:userId/seen", protect, markAsSeen);

export default router;