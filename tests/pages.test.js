import request from "supertest";
import { app } from "../src/app.js";

describe("SSR pages", () => {
  test("GET / (home)", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Restaurant Reviews|Discover/i);
  });

  test("GET /restaurants (browse shell)", async () => {
    const res = await request(app).get("/restaurants");
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Browse|Restaurants/i);
  });

  test("GET /contact", async () => {
    const res = await request(app).get("/contact");
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Contact/i);
  });
});
