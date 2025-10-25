import request from "supertest";
import { app } from "../src/app.js";

describe("Admin guard", () => {
  test("GET /admin/restaurants is protected", async () => {
    const res = await request(app).get("/admin/restaurants");
    // depending on your middleware, expect redirect to login or 401/403
    expect([302, 401, 403]).toContain(res.status);
  });
});
