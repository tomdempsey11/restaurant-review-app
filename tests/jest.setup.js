import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

beforeAll(async () => {
  // Use a separate DB for tests
  const uri = process.env.MONGO_URI_TEST || "mongodb://127.0.0.1:27017/restaurant_review_test";
  await mongoose.connect(uri);
});

afterAll(async () => {
  // Nuke test DB + close
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
