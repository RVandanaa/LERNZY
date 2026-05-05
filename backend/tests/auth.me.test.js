const request = require("supertest");
const app = require("../src/app");

describe("GET /api/auth/me", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeTruthy();
  });
});
