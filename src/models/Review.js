import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    photos: [{ type: String }],
  },
  { timestamps: true }
);

// ✅ Prevent multiple reviews by the same user for the same restaurant
reviewSchema.index({ userId: 1, restaurantId: 1 }, { unique: true });

// Optional — still useful for restaurant lookups
reviewSchema.index({ restaurantId: 1 });

export const Review =
  mongoose.models.Review || mongoose.model("Review", reviewSchema);
