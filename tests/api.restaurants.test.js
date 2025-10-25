import request from "supertest";
import { app } from "../src/app.js";

describe("API: restaurants", () => {
  test("GET /api/restaurants returns JSON", async () => {
    const res = await request(app).get("/api/restaurants");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    // allow either array or object depending on your controller shape
    expect(typeof res.body === "object").toBe(true);
  });
});
