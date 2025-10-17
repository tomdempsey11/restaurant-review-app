import { Router } from "express";
import { me, myReviews } from "../controllers/userController.js";
import { ensureAuth } from "../middleware/auth.js";

const router = Router();

router.get("/me", ensureAuth, me);
router.get("/me/reviews", ensureAuth, myReviews);

export default router;
