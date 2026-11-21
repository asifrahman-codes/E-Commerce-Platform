import { describe, expect, it, vi } from "vitest";

vi.mock("../database/index.js", () => ({
  query: vi.fn(),
}));

import {
  revokeRefreshTokenIfActive,
} from "../repositories/token.repository.js";
import {
  updateUserPasswordWithTransaction,
} from "../repositories/user.repository.js";

describe("session revocation repository operations", () => {
  it("conditionally revokes only an active refresh token", async () => {
    const connection = {
      execute: vi.fn().mockResolvedValue([{ affectedRows: 0 }]),
    };

    await expect(
      revokeRefreshTokenIfActive(connection, "refresh-token")
    ).resolves.toBe(false);

    expect(connection.execute.mock.calls[0][0]).toContain(
      "revoked_at IS NULL"
    );
    expect(connection.execute.mock.calls[0][1]).toEqual(["refresh-token"]);
  });

  it("increments the access-token version with the password update", async () => {
    const connection = {
      execute: vi.fn().mockResolvedValue([{ affectedRows: 1 }]),
    };

    await expect(
      updateUserPasswordWithTransaction(connection, 42, "new-hash")
    ).resolves.toBe(true);

    expect(connection.execute.mock.calls[0][0]).toContain(
      "token_version = token_version + 1"
    );
    expect(connection.execute.mock.calls[0][1]).toEqual(["new-hash", 42]);
  });
});
