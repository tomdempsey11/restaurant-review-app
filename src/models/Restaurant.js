// src/models/Restaurant.js
import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  cuisine: { type: String, required: true },
  priceRange: { type: String, enum: ["$", "$$", "$$$", "$$$$"], default: "$$" },
  address: { type: String, required: true },
  openHours: { type: String, default: "" },
  photos: [{ type: String }],
  avgRating: { type: Number, default: 0 },
}, { timestamps: true });

// ✅ Named export (back to your original style)
export const Restaurant =
  mongoose.models.Restaurant || mongoose.model("Restaurant", restaurantSchema);


