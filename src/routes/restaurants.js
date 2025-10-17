import { Router } from "express";
import { listRestaurants, getBySlug, createRestaurant, updateRestaurant, deleteRestaurant } from "../controllers/restaurantController.js";
import { ensureAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", listRestaurants);
router.get("/:slug", getBySlug);

// Admin
router.post("/", ensureAdmin, createRestaurant);
router.put("/:id", ensureAdmin, updateRestaurant);
router.delete("/:id", ensureAdmin, deleteRestaurant);

export default router;
