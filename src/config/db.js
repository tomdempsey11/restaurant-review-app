// src/config/db.js
import mongoose from "mongoose";

let isConnected = false;
let connectPromise = null;

export async function connectDB() {
  const uri =
    (process.env.MONGO_URI ?? "").trim() ||
    (process.env.DATABASE_URL ?? "").trim() ||
    "mongodb://127.0.0.1:27017/restaurantApp";

  if (!uri) throw new Error("Missing MONGO_URI or DATABASE_URL");

  if (isConnected) return mongoose.connection;
  if (connectPromise) return connectPromise;

  mongoose.set("strictQuery", true);

  // ✅ Sanity check to confirm which URI is used
  console.log("🧪 MONGO_URI prefix:", uri.slice(0, 12));

  connectPromise = mongoose
    .connect(uri, {
      autoIndex: process.env.NODE_ENV !== "production",
      serverSelectionTimeoutMS: 15000, // fails fast on timeout
      // directConnection: true, // uncomment only for one-host emergency mode
    })
    .then(async () => {
      isConnected = true;
      console.log("✅ MongoDB connected");

      // Optional: sync indexes once after connection
      if (process.env.SYNC_INDEXES !== "false") {
        try {
          const { Review } = await import("../models/Review.js");
          await Review.syncIndexes();
          console.log("✅ Review indexes synced");
        } catch (e) {
          console.warn("⚠️ Index sync skipped:", e?.message || e);
        }
      }

      return mongoose.connection;
    })
    .catch((err) => {
      connectPromise = null;
      console.error(
        "❌ MongoDB connection error:",
        err?.reason?.message || err?.message || err
      );
      throw err;
    });

  return connectPromise;
}

export async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    connectPromise = null;
    console.log("🛑 MongoDB disconnected");
  }
}
