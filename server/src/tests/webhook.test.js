import { describe, it, expect, vi } from "vitest";
import crypto from "node:crypto";
import request from "supertest";

vi.hoisted(() => {
  Object.assign(process.env, { DB_HOST: "x", DB_NAME: "x", DB_USER: "x", DB_PASSWORD: "x", JWT_SECRET: "s".repeat(40), MOCK_PAYMENT_SECRET: "whsec", CLIENT_URL: "http://localhost:5173", NODE_ENV: "test" });
});
const proc = vi.hoisted(() => vi.fn(async () => ({ processed: true })));
vi.mock("../services/online-payment.service.js", async (orig) => ({ ...(await orig()), processVerifiedGatewayEvent: proc }));

import app from "../app.js";

const body = JSON.stringify({ eventId: "e1", attemptId: 1, status: "SUCCEEDED" });
const sign = (b) => crypto.createHmac("sha256", "whsec").update(b).digest("hex");
const url = "/api/v1/payments/online/webhook/mock";

describe("mock payment webhook", () => {
  it("accepts a correctly signed raw body", async () => {
    const res = await request(app).post(url).set("Content-Type", "application/json").set("x-mock-signature", sign(body)).send(body);
    expect(res.status).toBe(200);
    expect(proc).toHaveBeenCalledOnce();
  });
  it("rejects a bad signature with 401", async () => {
    const res = await request(app).post(url).set("Content-Type", "application/json").set("x-mock-signature", "00".repeat(32)).send(body);
    expect(res.status).toBe(401);
  });
  it("auth/me, orders and admin-only routes reject anonymous callers", async () => {
    for (const [m, u] of [["get", "/api/v1/auth/me"], ["post", "/api/v1/orders"], ["get", "/api/v1/coupons"], ["post", "/api/v1/online/x"]]) {
      const res = await request(app)[m](u);
      expect([401, 404]).toContain(res.status);
    }
  });
});
