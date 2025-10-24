// src/routes/restaurants.js
import { Router } from "express";
import {
  listRestaurants,        // ← use THIS
  getBySlug,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
} from "../controllers/restaurantController.js";
import { ensureAdmin } from "../middleware/auth.js";

const router = Router();

// Public
router.get("/", listRestaurants);     // ← was listRestaurantsWithStats
router.get("/:slug", getBySlug);

// Admin
router.post("/", ensureAdmin, createRestaurant);
router.put("/:id", ensureAdmin, updateRestaurant);
router.delete("/:id", ensureAdmin, deleteRestaurant);

export default router;
