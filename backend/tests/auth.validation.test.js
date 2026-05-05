const request = require("supertest");
const app = require("../src/app");

describe("Auth validation", () => {
  it("rejects weak signup password", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "weakpass"
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe("VALIDATION_ERROR");
  });

  it("rejects missing refresh token payload", async () => {
    const res = await request(app).post("/api/auth/refresh").send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe("VALIDATION_ERROR");
  });
});
