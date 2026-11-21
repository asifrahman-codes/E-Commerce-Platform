import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../database/index.js", () => ({
  pool: { execute: vi.fn() },
}));

import { pool } from "../database/index.js";
import {
  upsertNotificationFromOutbox,
} from "../repositories/notification.repository.js";

describe("notification outbox persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps the existing event-key deduplication behavior", async () => {
    await upsertNotificationFromOutbox({
      userId: 7,
      eventKey: "order:42:confirmed",
      type: "ORDER_CONFIRMED",
      title: "Order confirmed",
      message: "Your order is confirmed.",
      data: { orderId: 42 },
    });

    const [sql, values] = pool.execute.mock.calls[0];
    expect(sql).toContain("ON DUPLICATE KEY UPDATE");
    expect(values).toEqual([
      7,
      "order:42:confirmed",
      "ORDER_CONFIRMED",
      "Order confirmed",
      "Your order is confirmed.",
      JSON.stringify({ orderId: 42 }),
    ]);
  });
});
