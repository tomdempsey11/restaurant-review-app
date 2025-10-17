import { Review } from "../models/Review.js";

export const me = async (req, res) => {
  const user = req.session?.user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  res.json(user);
};

export const myReviews = async (req, res) => {
  const user = req.session?.user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const reviews = await Review.find({ userId: user.id }).sort({ createdAt: -1 });
  res.json(reviews);
};
