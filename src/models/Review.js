import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  photos: [{ type: String }]
}, { timestamps: true });

export const Review = mongoose.model("Review", reviewSchema);
