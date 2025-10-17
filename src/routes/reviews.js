import { Router } from "express";
import { createReview, updateReview, deleteReview } from "../controllers/reviewController.js";
import { ensureAuth } from "../middleware/auth.js";

const router = Router();

router.post("/:restaurantId", ensureAuth, createReview);
router.put("/:id", ensureAuth, updateReview);
router.delete("/:id", ensureAuth, deleteReview);

export default router;
