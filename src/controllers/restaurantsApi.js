// src/controllers/restaurantsApi.js
import mongoose from "mongoose";
import { Restaurant } from "../models/Restaurant.js"; // ⬅️ named import

const REVIEWS_COLLECTION = "reviews"; // keep as before

export async function listRestaurantsWithStats(req, res, next) {
  try {
    const page  = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = 10;
    const skip  = (page - 1) * limit;

    const q       = (req.query.q || "").trim();
    const cuisine = (req.query.cuisine || "").trim();
    const price   = (req.query.price || "").trim();

    const match = {};
    if (q) {
      match.$or = [
        { name:    { $regex: q, $options: "i" } },
        { cuisine: { $regex: q, $options: "i" } },
      ];
    }
    if (cuisine) match.cuisine = cuisine;
    if (price)   match.priceRange = price;

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: REVIEWS_COLLECTION,
          localField: "_id",
          foreignField: "restaurantId", // change if your FK differs
          as: "reviews",
        },
      },
      {
        $addFields: {
          reviewCount: { $size: "$reviews" },
          avgRating: {
            $cond: [
              { $gt: [{ $size: "$reviews" }, 0] },
              { $round: [{ $avg: "$reviews.rating" }, 1] },
              null,
            ],
          },
        },
      },
      { $project: { reviews: 0 } },
      { $sort: { reviewCount: -1, avgRating: -1, name: 1 } },
      {
        $facet: {
          items: [{ $skip: skip }, { $limit: limit }],
          count: [{ $count: "total" }],
        },
      },
      { $addFields: { total: { $ifNull: [{ $arrayElemAt: ["$count.total", 0] }, 0] } } },
      {
        $project: {
          items: 1,
          total: 1,
          page: { $literal: page },
          pages: {
            $cond: [
              { $gt: ["$total", 0] },
              { $ceil: { $divide: ["$total", limit] } },
              1,
            ],
          },
        },
      },
    ];

    const result = await Restaurant.aggregate(pipeline);
    const { items = [], total = 0, page: p = page, pages = 1 } = result[0] || {};
    res.json({ items, total, page: p, pages });
  } catch (err) {
    next(err);
  }
}
