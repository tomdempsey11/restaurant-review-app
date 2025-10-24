// src/controllers/restaurantController.js
import mongoose from "mongoose";
import { Restaurant } from "../models/Restaurant.js";
import { Review } from "../models/Review.js";
import { restaurantSchema } from "../utils/validators.js";

export const listRestaurants = async (req, res) => {
  const { q, cuisine, price, page = 1, limit = 9 } = req.query;
  const filter = {};
  if (q) filter.name = { $regex: q, $options: "i" };
  if (cuisine) filter.cuisine = cuisine;
  if (price) filter.priceRange = price;

  const pageNum = Number(page);
  const lim = Number(limit);
  const skip = (pageNum - 1) * lim;

  const [items, total] = await Promise.all([
    Restaurant.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
    Restaurant.countDocuments(filter)
  ]);

  res.json({ items, total, page: pageNum, pages: Math.ceil(total / lim) });
};

export const getBySlug = async (req, res) => {
  const { slug } = req.params;

  // 1) Find the restaurant
  const doc = await Restaurant.findOne({ slug }).lean();
  if (!doc) return res.status(404).json({ error: "Restaurant not found" });

  // 2) Fetch reviews (newest first) + ✅ populate reviewer (name/email)
  const reviews = await Review.find({ restaurantId: doc._id })
    .populate("userId", "name email")   // ← NEW: include reviewer identity
    .sort({ createdAt: -1 })
    .lean();

  // 3) Compute stats (avg + count) from the reviews collection
  const stats = await Review.aggregate([
    { $match: { restaurantId: new mongoose.Types.ObjectId(doc._id) } },
    { $group: { _id: "$restaurantId", count: { $sum: 1 }, avg: { $avg: "$rating" } } }
  ]);

  const reviewCount = stats[0]?.count ?? 0;
  const avgRating = stats.length ? Math.round(stats[0].avg * 10) / 10 : null;

  // 4) Return JSON with everything the detail page/API needs
  res.json({
    restaurant: { ...doc, avgRating, reviewCount },
    reviews
  });
};

export const createRestaurant = async (req, res) => {
  const { value, error } = restaurantSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ error: error.details.map(d => d.message) });
  const exists = await Restaurant.findOne({ slug: value.slug });
  if (exists) return res.status(400).json({ error: "Slug already exists" });
  const created = await Restaurant.create(value);
  res.status(201).json(created);
};

export const updateRestaurant = async (req, res) => {
  const { id } = req.params;
  const { value, error } = restaurantSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ error: error.details.map(d => d.message) });
  const updated = await Restaurant.findByIdAndUpdate(id, value, { new: true }).lean();
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
};

export const deleteRestaurant = async (req, res) => {
  const { id } = req.params;
  const deleted = await Restaurant.findByIdAndDelete(id).lean();
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
};
