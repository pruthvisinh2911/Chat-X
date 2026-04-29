import express from "express";
import { blockUser, rejectRequest, sendRequest } from "../controllers/request.controller.js";
import { protect } from "../middleware/auth.middleware.js"
import { acceptRequest } from "../controllers/request.controller.js";

const router = express.Router();

router.post("/request/:userId", protect, sendRequest);
router.post("/request/:id/accept", protect, acceptRequest);;
router.post("/request/:id/reject", protect, rejectRequest); 
router.post("/block/:userId", protect, blockUser);
export default router;