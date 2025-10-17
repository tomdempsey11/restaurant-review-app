import { Review } from "../models/Review.js";
import { Restaurant } from "../models/Restaurant.js";
import { reviewSchema } from "../utils/validators.js";

async function recalcAverage(restaurantId) {
  const agg = await Review.aggregate([
    { $match: { restaurantId } },
    { $group: { _id: "$restaurantId", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);
  const avg = agg[0]?.avg || 0;
  await Restaurant.findByIdAndUpdate(restaurantId, { avgRating: Math.round(avg * 10) / 10 });
}

export const createReview = async (req, res) => {
  const { restaurantId } = req.params;
  const { value, error } = reviewSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ error: error.details.map(d => d.message) });
  const review = await Review.create({
    ...value,
    restaurantId,
    userId: req.session.user.id
  });
  await recalcAverage(review.restaurantId);
  res.status(201).json(review);
};

export const updateReview = async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) return res.status(404).json({ error: "Not found" });
  if (String(review.userId) !== req.session.user.id && req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { value, error } = reviewSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ error: error.details.map(d => d.message) });
  Object.assign(review, value);
  await review.save();
  await recalcAverage(review.restaurantId);
  res.json(review);
};

export const deleteReview = async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) return res.status(404).json({ error: "Not found" });
  if (String(review.userId) !== req.session.user.id && req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  await Review.findByIdAndDelete(id);
  await recalcAverage(review.restaurantId);
  res.json({ ok: true });
};
