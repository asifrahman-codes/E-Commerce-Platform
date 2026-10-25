import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";

import {
  AppError,
  notFoundMiddleware,
  errorMiddleware,
} from "../src/middleware/error.middleware.js";
import { requestIdMiddleware } from "../src/middleware/request-id.middleware.js";

describe("API error handling", () => {
  function createTestApp() {
    const app = express();

    app.use(requestIdMiddleware);

    app.get("/test-error", () => {
      throw new AppError(
        "Resource not found",
        404,
        "RESOURCE_NOT_FOUND"
      );
    });

    app.get("/test-crash", () => {
      throw new Error("Sensitive internal database detail");
    });

    app.use(notFoundMiddleware);
    app.use(errorMiddleware);

    return app;
  }

  it("returns a structured 404 response", async () => {
    const response = await request(createTestApp())
      .get("/test-error");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("RESOURCE_NOT_FOUND");
    expect(response.body.error.requestId).toBeTruthy();
    expect(response.headers["x-request-id"]).toBeTruthy();
  });

  it("does not expose unexpected internal errors", async () => {
    const response = await request(createTestApp())
      .get("/test-crash");

    expect(response.status).toBe(500);
    expect(response.body.error.message).toBe(
      "An unexpected server error occurred."
    );
    expect(response.body.error.message).not.toContain(
      "Sensitive internal database detail"
    );
  });

  it("returns 404 for an unknown route", async () => {
    const response = await request(createTestApp())
      .get("/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("ROUTE_NOT_FOUND");
  });
});