import mongoose from "mongoose";
import { Restaurant } from "../models/Restaurant.js";
import { Review } from "../models/Review.js";
import { reviewSchema } from "../utils/validators.js";

const toObjectId = (id) => (id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id));

async function recalcAverage(restaurantId) {
  const rid = toObjectId(restaurantId);
  const agg = await Review.aggregate([
    { $match: { restaurantId: rid } },
    { $group: { _id: "$restaurantId", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);
  const avg = agg[0]?.avg ?? 0;
  await Restaurant.findByIdAndUpdate(rid, { avgRating: Math.round(avg * 10) / 10 });
}

// Helper to get the current user's id safely (supports req.user or req.session.user)
function currentUserId(req) {
  return req.user?._id || req.session?.user?.id || req.session?.user?._id;
}

export const createReview = async (req, res, next) => {
  try {
    const { restaurantId } = req.params; // or use body if that's your route
    const { value, error } = reviewSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const review = await Review.create({
      ...value,
      restaurantId: toObjectId(restaurantId),
      userId: toObjectId(currentUserId(req))
    });

    await recalcAverage(review.restaurantId);
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: "Not found" });

    const me = String(currentUserId(req));
    const isOwner = String(review.userId) === me;
    const isAdmin = req.session?.user?.role === "admin" || req.user?.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" });

    const { value, error } = reviewSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    Object.assign(review, value);
    await review.save();

    await recalcAverage(review.restaurantId);
    res.json(review);
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: "Not found" });

    const me = String(currentUserId(req));
    const isOwner = String(review.userId) === me;
    const isAdmin = req.session?.user?.role === "admin" || req.user?.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" });

    await Review.findByIdAndDelete(id);
    await recalcAverage(review.restaurantId);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
