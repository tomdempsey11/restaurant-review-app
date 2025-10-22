// src/routes/restaurants.js
import { Router } from "express";
// ⬇️ replace the list import with the stats-enabled one:
import { listRestaurantsWithStats } from "../controllers/restaurantsApi.js";
import { getBySlug, createRestaurant, updateRestaurant, deleteRestaurant } from "../controllers/restaurantController.js";
import { ensureAdmin } from "../middleware/auth.js";

const router = Router();

// Public
router.get("/", listRestaurantsWithStats);  // now returns avgRating + reviewCount
router.get("/:slug", getBySlug);

// Admin
router.post("/", ensureAdmin, createRestaurant);
router.put("/:id", ensureAdmin, updateRestaurant);
router.delete("/:id", ensureAdmin, deleteRestaurant);

export default router;
