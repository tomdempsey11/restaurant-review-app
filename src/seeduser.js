import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "./models/User.js";
dotenv.config();

async function main() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/restaurant_reviews";
  await mongoose.connect(uri);
  console.log("✅ Mongo connected (seeding user)");

  const email = "demo@example.com";
  const exists = await User.findOne({ email });
  if (!exists) {
    const passwordHash = await User.hashPassword("password123");
    await User.create({ name: "Demo User", email, passwordHash, role: "user" });
    console.log("👤 Created user: demo@example.com / password123");
  } else {
    console.log("ℹ️ User already exists:", email);
  }

  await mongoose.connection.close();
  console.log("🔚 Done");
}
main().catch(e => { console.error(e); process.exit(1); });
