import { describe, expect, it } from "vitest";

vi.hoisted(() => {
  process.env.JWT_SECRET = "access-secret-for-tests";
  process.env.JWT_EXPIRES_IN = "15m";
  delete process.env.JWT_REFRESH_SECRET;
  process.env.REFRESH_TOKEN_SECRET = "refresh-secret-from-example";
  delete process.env.JWT_REFRESH_EXPIRES_IN;
  process.env.REFRESH_TOKEN_EXPIRES_IN = "7d";
});

import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/security/jwt.helper.js";

describe("JWT helpers", () => {
  it("uses the documented refresh-token environment names", () => {
    const token = generateRefreshToken({ userId: 7 });

    expect(jwt.verify(token, "refresh-secret-from-example")).toMatchObject({
      userId: 7,
    });
  });

  it("uses the configured access-token secret and expiry", () => {
    const token = generateAccessToken({ userId: 7 });
    const decoded = jwt.verify(token, "access-secret-for-tests");

    expect(decoded.userId).toBe(7);
    expect(decoded.exp - decoded.iat).toBe(15 * 60);
  });
});
