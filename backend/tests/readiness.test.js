const request = require("supertest");
const app = require("../src/app");

describe("GET /api/health/ready", () => {
  it("returns readiness payload", async () => {
    const res = await request(app).get("/api/health/ready");

    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty("success");
    expect(res.body).toHaveProperty("data.services.mongo");
    expect(res.body).toHaveProperty("data.services.redis");
  });
});
