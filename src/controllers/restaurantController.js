// src/controllers/restaurantController.js
import mongoose from "mongoose";
import { Restaurant } from "../models/Restaurant.js";
import { Review } from "../models/Review.js";
import { restaurantSchema } from "../utils/validators.js";

export const listRestaurants = async (req, res) => {
  const { q, cuisine, price, page = 1, limit = 9, sort = "new" } = req.query;

  // Filter
  const filter = {};
  if (q) filter.name = { $regex: q, $options: "i" };
  if (cuisine) filter.cuisine = cuisine;
  if (price) filter.priceRange = price;

  // Pagination
  const pageNum = Math.max(1, Number(page) || 1);
  const lim = Math.min(50, Math.max(1, Number(limit) || 9));
  const skip = (pageNum - 1) * lim;

  // Build $sort (and whether we need priceRank)
  let sortStage = {};
  let needsPriceRank = false;
  switch (sort) {
    case "new":        sortStage = { createdAt: -1 }; break;
    case "old":        sortStage = { createdAt: 1 }; break;
    case "nameAsc":    sortStage = { name: 1, createdAt: -1 }; break;
    case "nameDesc":   sortStage = { name: -1, createdAt: -1 }; break;
    case "ratingDesc": sortStage = { avgRating: -1, reviewCount: -1, createdAt: -1 }; break;
    case "ratingAsc":  sortStage = { avgRating: 1,  reviewCount: 1,  createdAt: -1 }; break;
    case "priceAsc":   needsPriceRank = true; sortStage = { priceRank: 1,  createdAt: -1 }; break;
    case "priceDesc":  needsPriceRank = true; sortStage = { priceRank: -1, createdAt: -1 }; break;
    default:           sortStage = { createdAt: -1 };
  }

  // Pipeline: match → (priceRank) → lookup stats → addFields → project → sort → page
  const pipeline = [
    { $match: filter },
    ...(needsPriceRank ? [{ $addFields: { priceRank: { $strLenCP: "$priceRange" } } }] : []),

    // 👇 live stats so list is always accurate and rating sorts work
    {
      $lookup: {
        from: "reviews",
        let: { rid: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$restaurantId", "$$rid"] } } },
          { $group: { _id: null, count: { $sum: 1 }, avg: { $avg: "$rating" } } }
        ],
        as: "stats"
      }
    },
    {
      $addFields: {
        reviewCount: { $ifNull: [ { $arrayElemAt: ["$stats.count", 0] }, 0 ] },
        avgRating: {
          $let: {
            vars: { a: { $arrayElemAt: ["$stats.avg", 0] } },
            in: { $cond: [{ $ne: ["$$a", null] }, { $round: ["$$a", 1] }, null] }
          }
        }
      }
    },
    { $project: { stats: 0 } },

    { $sort: sortStage },
    { $skip: skip },
    { $limit: lim },
    ...(needsPriceRank ? [{ $project: { priceRank: 0 } }] : []),
  ];

  console.log("🧭 listRestaurants sort:", sort, " sortStage:", sortStage, " needsPriceRank:", needsPriceRank);

  const [items, total] = await Promise.all([
    Restaurant.aggregate(pipeline).collation({ locale: "en", strength: 1 }),
    Restaurant.countDocuments(filter)
  ]);

  res.json({ items, total, page: pageNum, pages: Math.ceil(total / lim) });
};




export const getBySlug = async (req, res) => {
  const { slug } = req.params;

  const doc = await Restaurant.findOne({ slug }).lean();
  if (!doc) return res.status(404).json({ error: "Restaurant not found" });

  const reviews = await Review.find({ restaurantId: doc._id })
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  const stats = await Review.aggregate([
    { $match: { restaurantId: new mongoose.Types.ObjectId(doc._id) } },
    { $group: { _id: "$restaurantId", count: { $sum: 1 }, avg: { $avg: "$rating" } } }
  ]);

  const reviewCount = stats[0]?.count ?? 0;
  const avgRating = stats.length ? Math.round(stats[0].avg * 10) / 10 : null;

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
