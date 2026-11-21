import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import ApiError from "../utils/ApiError.js";
import authorize from "../middleware/role.middleware.js";

vi.hoisted(() => {
  process.env.JWT_SECRET = "s".repeat(40);
  process.env.JWT_REFRESH_SECRET = "r".repeat(40);
  process.env.JWT_EXPIRES_IN = "15m";
  process.env.JWT_REFRESH_EXPIRES_IN = "7d";
});

const store = new Map();
vi.mock("../repositories/token.repository.js", () => ({
  saveRefreshToken: vi.fn(async ({ token, userId, expiresAt }) => store.set(token, { user_id: userId, token, expires_at: expiresAt, revoked_at: null })),
  saveRefreshTokenWithTransaction: vi.fn(async (_connection, { token, userId, expiresAt }) => store.set(token, { user_id: userId, token, expires_at: expiresAt, revoked_at: null })),
  findRefreshToken: vi.fn(async (t) => store.get(t) || null),
  revokeRefreshToken: vi.fn(async (t) => { if (store.get(t)) store.get(t).revoked_at = new Date(); }),
  revokeAllUserTokens: vi.fn(async (uid) => { for (const v of store.values()) if (v.user_id === uid) v.revoked_at = new Date(); }),
  revokeRefreshTokenIfActive: vi.fn(async (_connection, t) => {
    const stored = store.get(t);
    if (!stored || stored.revoked_at) return false;
    stored.revoked_at = new Date();
    return true;
  }),
  revokeAllUserTokensWithTransaction: vi.fn(async (_connection, uid) => {
    for (const value of store.values()) {
      if (value.user_id === uid) value.revoked_at = new Date();
    }
    return 0;
  }),
}));
vi.mock("../utils/transaction.js", () => ({
  default: async (callback) => callback({}),
}));
vi.mock("../repositories/user.repository.js", () => ({
  findUserById: vi.fn(async (id) => ({ user_id: id, role_id: 2, email: "a@b.c", role: "Customer", status: "ACTIVE" })),
  findUserByIdForAuth: vi.fn(async (id) => ({ user_id: id, role_id: 2, email: "a@b.c", role: "Customer", status: "ACTIVE", token_version: 0 })),
  updateLastLogin: vi.fn(),
}));

const run = (mw, role) => {
  let err = null;
  try { mw({ user: { role } }, {}, () => {}); } catch (e) { err = e; }
  return err;
};

describe("role middleware", () => {
  it("accepts any casing of the stored role name", () => {
    for (const allowed of ["ADMIN", "Admin", "admin"]) expect(run(authorize(allowed), "Admin")).toBeNull();
  });
  it("rejects a customer with 403", () => {
    const err = run(authorize("ADMIN"), "Customer");
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(403);
  });
  it("rejects missing user with 401", () => {
    expect(authorize("Admin").bind(null, {}, {}, () => {})).toThrow();
  });
});

describe("refresh token flow", () => {
  let jwtHelper, tokenService;
  beforeEach(() => store.clear());

  beforeAll(async () => {
    jwtHelper = await import("../utils/security/jwt.helper.js");
    tokenService = await import("../services/token.service.js");
  });
  it("derives DB expiry from the JWT exp claim (~7 days)", () => {
    const t = jwtHelper.generateRefreshToken({ userId: 1 });
    const days = (jwtHelper.getTokenExpiryDate(t) - Date.now()) / 86400000;
    expect(days).toBeGreaterThan(6.9); expect(days).toBeLessThan(7.1);
  });
  it("rotates a valid refresh token and rejects its reuse", async () => {
    const t = jwtHelper.generateRefreshToken({ userId: 1 });
    store.set(t, { user_id: 1, token: t, revoked_at: null });
    const out = await tokenService.refreshAccessToken(t);
    expect(out.accessToken).toBeTruthy();
    expect(out.refreshToken).not.toBe(t);
    await expect(tokenService.refreshAccessToken(t)).rejects.toMatchObject({ statusCode: 401 });
  });
  it("allows at most one successor when the same token is refreshed concurrently", async () => {
    const t = jwtHelper.generateRefreshToken({ userId: 1 });
    store.set(t, { user_id: 1, token: t, revoked_at: null });

    const results = await Promise.allSettled([
      tokenService.refreshAccessToken(t),
      tokenService.refreshAccessToken(t),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
    expect(
      [...store.values()].filter(
        (value) => value.user_id === 1 && !value.revoked_at
      ).length
    ).toBeLessThanOrEqual(1);
  });
  it("rejects refresh tokens issued before the account token version changed", async () => {
    const t = jwtHelper.generateRefreshToken({
      userId: 1,
      tokenVersion: 1,
    });
    store.set(t, { user_id: 1, token: t, revoked_at: null });

    await expect(tokenService.refreshAccessToken(t)).rejects.toMatchObject({
      statusCode: 401,
    });
    expect(store.get(t).revoked_at).toBeTruthy();
  });
  it("returns 401 (not a ReferenceError 500) for a forged token present in the DB", async () => {
    const bad = "not.a.jwt";
    store.set(bad, { user_id: 1, token: bad, revoked_at: null });
    await expect(tokenService.refreshAccessToken(bad)).rejects.toMatchObject({ statusCode: 401 });
  });
});
