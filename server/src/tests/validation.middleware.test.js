import { describe, expect, it } from "vitest";
import express from "express";
import Joi from "joi";
import request from "supertest";
import errorHandler from "../middleware/error.middleware.js";
import { requestIdMiddleware } from "../middleware/request-id.middleware.js";
import validate from "../middleware/validation.middleware.js";

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(requestIdMiddleware);
  app.post(
    "/body",
    validate(
      Joi.object({
        name: Joi.string().trim().min(2).required(),
      })
    ),
    (req, res) => res.json({ data: req.body })
  );
  app.get(
    "/query",
    validate(
      Joi.object({
        page: Joi.number().integer().min(1).required(),
      }),
      "query"
    ),
    (req, res) =>
      res.json({
        page: req.validated.query.page,
        rawPage: req.query.page,
      })
  );
  app.use(errorHandler);
  return app;
}

describe("request validation middleware", () => {
  it("trims body values and strips unknown body fields", async () => {
    const response = await request(makeApp())
      .post("/body")
      .send({ name: "  Ada  ", ignored: true });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({ name: "Ada" });
  });

  it("returns field errors with the standard request ID", async () => {
    const response = await request(makeApp())
      .post("/body")
      .send({ name: "" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation Failed");
    expect(response.body.requestId).toBe(response.headers["x-request-id"]);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "name" }),
      ])
    );
  });

  it("validates and normalizes query input without mutating Express query", async () => {
    const response = await request(makeApp()).get("/query?page=2");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ page: 2, rawPage: "2" });
  });

  it("rejects unknown and repeated query parameters", async () => {
    const app = makeApp();
    const unknown = await request(app).get("/query?page=2&extra=1");
    const repeated = await request(app).get("/query?page=2&page=3");

    expect(unknown.status).toBe(400);
    expect(unknown.body.requestId).toBeTruthy();
    expect(repeated.status).toBe(400);
  });
});
