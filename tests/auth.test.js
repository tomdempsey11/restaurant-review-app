import request from "supertest";
import { app } from "../src/app.js";

describe("Auth", () => {
  it("signs up and logs in", async () => {
    // ✅ include accept: 'on' to satisfy Joi
    const signup = await request(app).post("/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
      accept: "on"
    });
    expect([200, 302]).toContain(signup.status); // some apps render home (200) or redirect (302)

    const login = await request(app).post("/auth/login").send({
      email: "test@example.com",
      password: "password123"
    });
    expect([200, 302]).toContain(login.status);
  });
});
