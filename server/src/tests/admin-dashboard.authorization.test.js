import { describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../middleware/auth.middleware.js", () => ({
  default: (req, _res, next) => {
    const role = req.get("x-test-role");
    if (role) req.user = { role };
    next();
  },
}));

vi.mock("../controllers/admin-dashboard.controller.js", () => {
  const handler = (_req, res) => res.status(200).json({ success: true });

  return {
    getOverview: handler,
    getSalesAnalytics: handler,
    getOrderStatusAnalytics: handler,
    getTopProducts: handler,
    getRecentOrders: handler,
    getCustomers: handler,
  };
});

import adminDashboardRoutes from "../routes/admin-dashboard.routes.js";

const app = express();
app.use("/admin/dashboard", adminDashboardRoutes);
app.use((error, _req, res, _next) => {
  res.status(error.statusCode || 500).json({ message: error.message });
});

describe("admin dashboard authorization", () => {
  it("requires authentication", async () => {
    const response = await request(app).get("/admin/dashboard/overview");
    expect(response.status).toBe(401);
  });

  it("rejects authenticated non-admins", async () => {
    const response = await request(app)
      .get("/admin/dashboard/overview")
      .set("x-test-role", "Customer");
    expect(response.status).toBe(403);
  });

  it("allows administrators", async () => {
    const response = await request(app)
      .get("/admin/dashboard/overview")
      .set("x-test-role", "Admin");
    expect(response.status).toBe(200);
  });
});
