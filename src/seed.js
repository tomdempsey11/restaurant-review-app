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
  await Restaurant.findByIdAndUpdate(restaurantId, { avgRating: Math.round(avg * 10) / 10 });
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

  // Seed restaurants (don’t set avgRating manually; reviews will drive it)
  const restaurants = await Restaurant.insertMany([
    {
      name: "Pasta Palace",
      slug: "pasta-palace",
      cuisine: "Italian",
      priceRange: "$$",
      address: "123 Main St, Irvine, CA",
      openHours: "Mon–Sun 11:00–21:00",
      photos: []
    },
    {
      name: "Sushi Garden",
      slug: "sushi-garden",
      cuisine: "Japanese",
      priceRange: "$$$",
      address: "456 Oak Ave, Irvine, CA",
      openHours: "Tue–Sun 12:00–22:00",
      photos: []
    },
    {
      name: "Taco Amigos",
      slug: "taco-amigos",
      cuisine: "Mexican",
      priceRange: "$",
      address: "789 Lake Rd, Irvine, CA",
      openHours: "Daily 10:00–20:00",
      photos: []
    },
    {
      name: "Spice Route",
      slug: "spice-route",
      cuisine: "Indian",
      priceRange: "$$",
      address: "12 Curry Ln, Irvine, CA",
      openHours: "Mon–Sat 11:30–21:30",
      photos: []
    },
    {
      name: "Green Bowl",
      slug: "green-bowl",
      cuisine: "Vegetarian",
      priceRange: "$$",
      address: "98 Garden St, Irvine, CA",
      openHours: "Daily 10:00–19:00",
      photos: []
    },
    {
      name: "Burger Barn",
      slug: "burger-barn",
      cuisine: "American",
      priceRange: "$",
      address: "77 Ranch Rd, Irvine, CA",
      openHours: "Mon–Sun 11:00–23:00",
      photos: []
    }
  ]);

  // Helper: add a few reviews per restaurant
  async function seedReviewsFor(rest, ratings) {
    const payloads = ratings.map(({ by, rating, title, body }) => ({
      userId: by === "demo" ? demo._id : admin._id,
      restaurantId: rest._id,
      rating,
      title,
      body,
      photos: []
    }));
    await Review.insertMany(payloads);
    await recalcAverage(rest._id);
  }

  await seedReviewsFor(restaurants[0], [
    { by: "demo", rating: 5, title: "Amazing pasta", body: "Fresh sauce and perfect al dente." },
    { by: "admin", rating: 4, title: "Tasty!", body: "Good value and cozy vibe." }
  ]);

  await seedReviewsFor(restaurants[1], [
    { by: "demo", rating: 5, title: "Super fresh fish", body: "Nigiri was fantastic." },
    { by: "admin", rating: 4, title: "Great rolls", body: "A bit pricey but worth it." }
  ]);

  await seedReviewsFor(restaurants[2], [
    { by: "demo", rating: 4, title: "Great tacos", body: "Carnitas were crispy and flavorful." }
  ]);

  // Leave a couple with fewer or no reviews so you can see empty states
  await seedReviewsFor(restaurants[3], [
    { by: "demo", rating: 5, title: "Flavor bomb", body: "Butter chicken was incredible." }
  ]);

  // restaurants[4] (Green Bowl) → no reviews
  // restaurants[5] (Burger Barn) → one mixed review
  await seedReviewsFor(restaurants[5], [
    { by: "admin", rating: 3, title: "Decent burger", body: "Fries were soggy, burger was fine." }
  ]);

  console.log("🌱 Seeded users, restaurants, and reviews.");
  console.log("👤 Demo login → email: demo@example.com, pass: password123");
  console.log("🛠️ Admin login → email: admin@example.com, pass: admin12345");
}

main()
  .catch(err => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.connection.close();
    console.log("🔚 Done");
  });
