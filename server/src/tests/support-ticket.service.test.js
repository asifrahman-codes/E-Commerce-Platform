import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  connection: { execute: vi.fn() },
  lockTicket: vi.fn(),
  insertTicketMessage: vi.fn(),
  updateTicket: vi.fn(),
  createNotification: vi.fn(),
  findActiveAdminIds: vi.fn(),
}));

vi.mock("../utils/transaction.js", () => ({
  default: async (callback) => callback(m.connection),
}));
vi.mock("../repositories/support-ticket.repository.js", () => ({
  lockTicket: m.lockTicket,
  insertTicketMessage: m.insertTicketMessage,
  updateTicket: m.updateTicket,
  findActiveAdminIds: m.findActiveAdminIds,
}));
vi.mock("../services/notification.service.js", () => ({
  createNotification: m.createNotification,
}));

import { replyAsCustomer } from "../services/support-ticket.service.js";

beforeEach(() => {
  vi.clearAllMocks();
  m.lockTicket.mockResolvedValue({
    ticket_id: 10,
    customer_id: 9,
    status: "OPEN",
  });
  m.insertTicketMessage.mockResolvedValue(22);
  m.findActiveAdminIds.mockResolvedValue([]);
  m.createNotification.mockResolvedValue(null);
});

describe("support ticket ownership", () => {
  it("does not allow another customer to reply to a ticket", async () => {
    await expect(replyAsCustomer(8, 10, "I need an update"))
      .rejects.toMatchObject({ statusCode: 404 });
    expect(m.insertTicketMessage).not.toHaveBeenCalled();
  });

  it("does not allow replies to closed tickets", async () => {
    m.lockTicket.mockResolvedValue({
      ticket_id: 10,
      customer_id: 9,
      status: "CLOSED",
    });

    await expect(replyAsCustomer(9, 10, "I need an update"))
      .rejects.toMatchObject({ statusCode: 409 });
    expect(m.insertTicketMessage).not.toHaveBeenCalled();
  });

  it("reopens resolved tickets when the customer replies", async () => {
    m.lockTicket.mockResolvedValue({
      ticket_id: 10,
      customer_id: 9,
      status: "RESOLVED",
    });

    await expect(replyAsCustomer(9, 10, "The issue is still happening"))
      .resolves.toEqual({ message_id: 22 });
    expect(m.updateTicket).toHaveBeenCalledWith(
      m.connection,
      10,
      { status: "OPEN" }
    );
    expect(m.insertTicketMessage).toHaveBeenCalledWith(
      m.connection,
      expect.objectContaining({ senderRole: "CUSTOMER" })
    );
  });
});
