// src/config/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let isConnected = false;
let connectPromise = null;

export async function connectDB() {
  const uri =
    process.env.MONGO_URI ||
    process.env.DATABASE_URL ||
    "mongodb://127.0.0.1:27017/restaurantApp";

  if (!uri) throw new Error("Missing MONGO_URI or DATABASE_URL in .env");

  if (isConnected) return mongoose.connection;
  if (connectPromise) return connectPromise;

  mongoose.set("strictQuery", true);

  connectPromise = mongoose
    .connect(uri, {
      autoIndex: process.env.NODE_ENV !== "production",
    })
    .then(async () => {
      isConnected = true;
      console.log("✅ MongoDB connected");

      // Lazy import avoids circular dependency issues
      const { Review } = await import("../models/Review.js");

      // Optional: skip in prod if desired
      if (process.env.SYNC_INDEXES !== "false") {
        await Review.syncIndexes();
        console.log("✅ Review indexes synced");
      }

      return mongoose.connection;
    })
    .catch((err) => {
      connectPromise = null;
      console.error("MongoDB connection error:", err);
      throw err;
    });

  return connectPromise;
}
