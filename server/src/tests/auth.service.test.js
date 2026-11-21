import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUserByEmail: vi.fn(),
  findRoleByName: vi.fn(),
  createUser: vi.fn(),
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}));

vi.mock("../repositories/auth.repository.js", () => ({
  findUserByEmail: mocks.findUserByEmail,
  findRoleByName: mocks.findRoleByName,
  createUser: mocks.createUser,
}));

vi.mock("../repositories/token.repository.js", () => ({
  saveRefreshToken: vi.fn(),
}));

vi.mock("../repositories/user.repository.js", () => ({
  updateLastLogin: vi.fn(),
}));

vi.mock("../utils/security/bcrypt.helper.js", () => ({
  hashPassword: mocks.hashPassword,
  comparePassword: mocks.comparePassword,
}));

vi.mock("../utils/security/jwt.helper.js", () => ({
  generateAccessToken: vi.fn(),
  generateRefreshToken: vi.fn(),
  getTokenExpiryDate: vi.fn(),
}));

import { loginUser, registerUser } from "../services/auth.service.js";

describe("registration account-enumeration protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findRoleByName.mockResolvedValue({ role_id: 3 });
    mocks.hashPassword.mockResolvedValue("hashed-password");
    mocks.createUser.mockResolvedValue(17);
  });

  it("returns the same response for a new email and a duplicate email", async () => {
    const data = {
      firstName: "Casey",
      lastName: "Customer",
      email: "casey@example.test",
      password: "A secure password",
    };

    const newAccountResponse = await registerUser(data);
    mocks.createUser.mockRejectedValueOnce({ code: "ER_DUP_ENTRY" });
    const duplicateResponse = await registerUser(data);

    expect(newAccountResponse).toEqual({ accepted: true });
    expect(duplicateResponse).toEqual(newAccountResponse);
    expect(mocks.findUserByEmail).not.toHaveBeenCalled();
  });

  it("does not hide non-duplicate database errors", async () => {
    mocks.createUser.mockRejectedValueOnce(new Error("database unavailable"));

    await expect(
      registerUser({
        firstName: "Casey",
        lastName: "Customer",
        email: "casey@example.test",
        password: "A secure password",
      })
    ).rejects.toThrow("database unavailable");
  });

  it("uses the same login error for unknown and inactive accounts", async () => {
    mocks.findUserByEmail
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        user_id: 21,
        email: "inactive@example.test",
        password: "stored-hash",
        status: "INACTIVE",
      });

    const errors = await Promise.all([
      loginUser({
        email: "unknown@example.test",
        password: "wrong-password",
      }).catch((error) => error),
      loginUser({
        email: "inactive@example.test",
        password: "wrong-password",
      }).catch((error) => error),
    ]);

    expect(errors.map(({ statusCode, message }) => [statusCode, message])).toEqual([
      [401, "Invalid email or password"],
      [401, "Invalid email or password"],
    ]);
  });
});
