import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUserByIdForAuth: vi.fn(),
  findUserPasswordById: vi.fn(),
  updateUserPasswordWithTransaction: vi.fn(),
  revokeAllUserTokensWithTransaction: vi.fn(),
  comparePassword: vi.fn(),
  hashPassword: vi.fn(),
  withTransaction: vi.fn(),
  connection: {},
}));

vi.mock("../repositories/user.repository.js", () => ({
  findUserById: vi.fn(),
  findUserByIdForAuth: mocks.findUserByIdForAuth,
  updateUserProfile: vi.fn(),
  findUserPasswordById: mocks.findUserPasswordById,
  updateUserPasswordWithTransaction: mocks.updateUserPasswordWithTransaction,
  deactivateUserAccount: vi.fn(),
}));

vi.mock("../repositories/token.repository.js", () => ({
  revokeAllUserTokensWithTransaction: mocks.revokeAllUserTokensWithTransaction,
}));

vi.mock("../utils/security/bcrypt.helper.js", () => ({
  comparePassword: mocks.comparePassword,
  hashPassword: mocks.hashPassword,
}));

vi.mock("../utils/transaction.js", () => ({
  default: mocks.withTransaction,
}));

import { changeMyPasswordService } from "../services/user.service.js";

describe("password change session revocation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.withTransaction.mockImplementation(
      async (callback) => callback(mocks.connection)
    );
    mocks.findUserPasswordById.mockResolvedValue({
      user_id: 42,
      password: "old-hash",
    });
    mocks.findUserByIdForAuth.mockResolvedValue({
      user_id: 42,
      email: "customer@example.test",
      status: "ACTIVE",
      token_version: 1,
    });
    mocks.comparePassword
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    mocks.hashPassword.mockResolvedValue("new-hash");
    mocks.updateUserPasswordWithTransaction.mockResolvedValue(true);
  });

  it("updates the password and revokes refresh tokens in the same transaction", async () => {
    await changeMyPasswordService(42, {
      current_password: "current",
      new_password: "new-password",
      confirm_password: "new-password",
    });

    expect(mocks.updateUserPasswordWithTransaction).toHaveBeenCalledWith(
      mocks.connection,
      42,
      "new-hash"
    );
    expect(mocks.revokeAllUserTokensWithTransaction).toHaveBeenCalledWith(
      mocks.connection,
      42
    );
    expect(
      mocks.updateUserPasswordWithTransaction.mock.invocationCallOrder[0]
    ).toBeLessThan(
      mocks.revokeAllUserTokensWithTransaction.mock.invocationCallOrder[0]
    );
  });

  it("rejects access tokens from a password-change session version", async () => {
    const { getAuthenticatedUser } = await import("../services/user.service.js");

    await expect(getAuthenticatedUser(42, 0)).rejects.toMatchObject({
      statusCode: 401,
    });
    await expect(getAuthenticatedUser(42, 1)).resolves.toEqual({
      user_id: 42,
      email: "customer@example.test",
      status: "ACTIVE",
    });
  });
});
