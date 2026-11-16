import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import ApiError from "../utils/ApiError.js";
import notFound from "../middleware/notFound.middleware.js";
import errorHandler from "../middleware/error.middleware.js";
import { requestIdMiddleware } from "../middleware/request-id.middleware.js";

const makeApp = () => {
  const app = express();
  app.use(requestIdMiddleware);
  app.get("/known", () => { throw new ApiError(404, "Resource not found"); });
  app.get("/crash", () => { throw new Error("Sensitive internal database detail"); });
  app.use(notFound);
  app.use(errorHandler);
  return app;
};

describe("error handling", () => {
  it("returns ApiError status and message with a request id", async () => {
    const res = await request(makeApp()).get("/known");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Resource not found");
    expect(res.body.requestId).toBeTruthy();
    expect(res.headers["x-request-id"]).toBe(res.body.requestId);
  });
  it("returns 404 for unknown routes", async () => {
    const res = await request(makeApp()).get("/nope");
    expect(res.status).toBe(404);
  });
  it("hides internal error details and stack in production", async () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const res = await request(makeApp()).get("/crash");
    process.env.NODE_ENV = prev;
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain("Sensitive internal");
    expect(res.body.stack).toBeUndefined();
  });
});
