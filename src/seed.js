// src/seed.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "./models/User.js";
import { Restaurant } from "./models/Restaurant.js";
import { Review } from "./models/Review.js";

dotenv.config();

async function recalcAverage(restaurantId) {
  const agg = await Review.aggregate([
    { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
    { $group: { _id: "$restaurantId", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);
  const avg = agg[0]?.avg || 0;
  await Restaurant.findByIdAndUpdate(restaurantId, {
    avgRating: Math.round(avg * 10) / 10,
    reviewCount: agg[0]?.count || 0
  });
}

async function main() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/restaurant_reviews";
  await mongoose.connect(uri);
  console.log("✅ Mongo connected (seeding)");

  // Clean slate
  await Promise.all([
    Review.deleteMany({}),
    Restaurant.deleteMany({}),
    User.deleteMany({})
  ]);

  // Seed users
  const [demo, admin] = await Promise.all([
    (async () => {
      const passwordHash = await User.hashPassword("password123");
      return User.create({ name: "Demo User", email: "demo@example.com", passwordHash, role: "user" });
    })(),
    (async () => {
      const passwordHash = await User.hashPassword("admin12345");
      return User.create({ name: "Admin", email: "admin@example.com", passwordHash, role: "admin" });
    })()
  ]);

  // Define possible attributes
  const cuisines = ["Italian", "Japanese", "Mexican", "Chinese", "American", "Indian", "Thai", "Mediterranean", "Vegetarian"];
  const priceRanges = ["$", "$$", "$$$", "$$$$"];
  const cityNames = ["Irvine", "Costa Mesa", "Newport Beach", "Tustin", "Santa Ana", "Anaheim", "Orange", "Garden Grove"];

  // Helper: random pick
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const restaurants = [];

  for (let i = 1; i <= 50; i++) {
    const name = `${rand(["The", "Cafe", "House of", "Bistro", "Grill", "Corner", "Garden", "Kitchen"])} ${rand(["Sakura", "Taco", "Pasta", "Spice", "Burger", "Curry", "Dragon", "Olive", "Zen", "Lime"])} ${i}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const cuisine = rand(cuisines);
    const priceRange = rand(priceRanges);
    const address = `${Math.floor(Math.random() * 900) + 100} ${rand(["Main St", "Broadway", "Sunset Blvd", "Ocean Ave", "Maple Dr"])} ${rand(cityNames)}, CA`;
    const openHours = "Daily 10:00–22:00";
    const avgRating = +(3 + Math.random() * 2).toFixed(1);
    const reviewCount = Math.floor(Math.random() * 40);

    // 🕒 NEW: stagger creation dates to test newest/oldest sorting
    const createdAt = new Date(Date.now() - i * 36 * 60 * 60 * 1000); // each ~1.5 days older
    const updatedAt = createdAt;

    restaurants.push({
      name,
      slug,
      cuisine,
      priceRange,
      address,
      openHours,
      avgRating,
      reviewCount,
      createdAt,
      updatedAt
    });
  }


  await Restaurant.insertMany(restaurants);
  console.log(`🍽️ Seeded ${restaurants.length} restaurants`);

  // Optional: create random reviews
  const sampleTitles = ["Amazing!", "Good overall", "Could be better", "Loved it!", "Will come again", "Average experience"];
  const sampleBodies = [
    "Food was delicious and service was great.",
    "Reasonable prices and cozy atmosphere.",
    "Too crowded but food quality was fine.",
    "Outstanding flavor combinations!",
    "Friendly staff but long wait time."
  ];

  const allRestaurants = await Restaurant.find();
  const reviews = [];

  for (const rest of allRestaurants) {
    const num = Math.floor(Math.random() * 4); // 0–3 reviews per restaurant
    for (let i = 0; i < num; i++) {
      const by = Math.random() > 0.5 ? demo._id : admin._id;
      const rating = Math.floor(Math.random() * 3) + 3; // 3–5 stars
      reviews.push({
        userId: by,
        restaurantId: rest._id,
        rating,
        title: rand(sampleTitles),
        body: rand(sampleBodies)
      });
    }
  }

  if (reviews.length) await Review.insertMany(reviews);

  // Update averages
  for (const rest of allRestaurants) await recalcAverage(rest._id);

  console.log("💬 Seeded", reviews.length, "reviews.");
  console.log("👤 Demo login → demo@example.com / password123");
  console.log("🛠️ Admin login → admin@example.com / admin12345");

  await mongoose.disconnect();
  console.log("✅ Done");
}

main().catch(err => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
