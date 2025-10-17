import request from "supertest";
import mongoose from "mongoose";
import { app } from "../src/app.js";
import { connectDB } from "../src/config/db.js";

beforeAll(async () => {
  process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/restaurant_reviews_test";
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Auth", () => {
  it("signs up and logs in", async () => {
    const signup = await request(app).post("/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123"
    });
    expect(signup.status).toBe(302); // redirect to /

    const login = await request(app).post("/auth/login").send({
      email: "test@example.com",
      password: "password123"
    });
    expect(login.status).toBe(302);
  });
});
