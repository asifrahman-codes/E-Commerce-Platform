import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../database/index.js", () => ({
  pool: { getConnection: vi.fn() },
}));

vi.mock("../utils/logger.js", () => ({
  logger: { error: vi.fn() },
}));

import { pool } from "../database/index.js";
import { logger } from "../utils/logger.js";
import withTransaction from "../utils/transaction.js";

const connection = {
  beginTransaction: vi.fn(),
  commit: vi.fn(),
  rollback: vi.fn(),
  release: vi.fn(),
};

describe("withTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pool.getConnection.mockResolvedValue(connection);
  });

  it("commits successful work and releases the connection", async () => {
    const callback = vi.fn().mockResolvedValue("result");

    await expect(withTransaction(callback)).resolves.toBe("result");

    expect(callback).toHaveBeenCalledWith(connection);
    expect(connection.commit).toHaveBeenCalledOnce();
    expect(connection.rollback).not.toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalledOnce();
  });

  it("does not roll back when beginning the transaction fails", async () => {
    const error = new Error("begin failed");
    connection.beginTransaction.mockRejectedValueOnce(error);

    await expect(withTransaction(vi.fn())).rejects.toBe(error);

    expect(connection.rollback).not.toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalledOnce();
  });

  it("preserves the original error if rollback also fails", async () => {
    const error = new Error("operation failed");
    connection.rollback.mockRejectedValueOnce(new Error("rollback failed"));

    await expect(
      withTransaction(() => Promise.reject(error))
    ).rejects.toBe(error);

    expect(logger.error).toHaveBeenCalledWith(
      "Database transaction rollback failed",
      {
        error: "rollback failed",
        originalError: "operation failed",
      }
    );
    expect(connection.release).toHaveBeenCalledOnce();
  });
});
