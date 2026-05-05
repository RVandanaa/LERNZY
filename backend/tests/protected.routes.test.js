const request = require("supertest");
const app = require("../src/app");

describe("Protected routes", () => {
  it("requires auth for POST /api/ask", async () => {
    const res = await request(app).post("/api/ask").send({
      question: "Explain photosynthesis",
      language: "en",
      outputType: "text"
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeTruthy();
  });

  it("requires auth for GET /api/history", async () => {
    const res = await request(app).get("/api/history?page=1&limit=20");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeTruthy();
  });

  it("requires auth for POST /api/auth/logout", async () => {
    const res = await request(app).post("/api/auth/logout");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeTruthy();
  });
});
