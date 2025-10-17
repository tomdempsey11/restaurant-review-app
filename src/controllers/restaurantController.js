import { Restaurant } from "../models/Restaurant.js";
import { Review } from "../models/Review.js";
import { restaurantSchema } from "../utils/validators.js";

export const listRestaurants = async (req, res) => {
  const { q, cuisine, price, page = 1, limit = 9 } = req.query;
  const filter = {};
  if (q) filter.name = { $regex: q, $options: "i" };
  if (cuisine) filter.cuisine = cuisine;
  if (price) filter.priceRange = price;

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Restaurant.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Restaurant.countDocuments(filter)
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

export const getBySlug = async (req, res) => {
  const { slug } = req.params;
  const doc = await Restaurant.findOne({ slug });
  if (!doc) return res.status(404).json({ error: "Restaurant not found" });
  const reviews = await Review.find({ restaurantId: doc._id }).sort({ createdAt: -1 });
  res.json({ restaurant: doc, reviews });
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
  const updated = await Restaurant.findByIdAndUpdate(id, value, { new: true });
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
};

export const deleteRestaurant = async (req, res) => {
  const { id } = req.params;
  const deleted = await Restaurant.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
};
