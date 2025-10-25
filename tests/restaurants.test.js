import request from "supertest";
import mongoose from "mongoose";
import { app } from "../src/app.js";
import { Restaurant } from "../src/models/Restaurant.js";

describe("Restaurants", () => {
  it("lists restaurants", async () => {
    await Restaurant.create({ name: "Foo", slug: "foo", cuisine: "Italian", address: "123 St" });
    const res = await request(app).get("/api/restaurants");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });
});
