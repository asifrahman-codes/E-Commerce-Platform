import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../database/index.js", () => ({
  pool: {
    execute: vi.fn(),
  },
}));

import { pool } from "../database/index.js";
import {
  listApprovedQuestions,
  listAdminQuestions,
} from "../repositories/product-qa.repository.js";

describe("product Q&A repository pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pool.execute.mockResolvedValue([[], []]);
  });

  it("uses integer pagination values instead of prepared LIMIT arguments", async () => {
    await listApprovedQuestions(12, { limit: 10, offset: 20 });

    const [sql, params] = pool.execute.mock.calls[0];
    expect(sql).toContain("LIMIT 10 OFFSET 20");
    expect(sql).not.toContain("LIMIT ?");
    expect(params).toEqual([12]);
  });

  it("binds only actual admin filters and uses fixed numeric pagination", async () => {
    await listAdminQuestions({
      status: "PENDING",
      search: null,
      limit: 5,
      offset: 10,
    });

    const [sql, params] = pool.execute.mock.calls[0];
    expect(sql).toContain("q.status = ?");
    expect(sql).toContain("LIMIT 5 OFFSET 10");
    expect(params).toEqual(["PENDING"]);
  });
});
