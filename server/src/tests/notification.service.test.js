import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  countNotifications: vi.fn(),
  countUnreadNotifications: vi.fn(),
  getNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
}));

vi.mock("../repositories/notification.repository.js", () => ({
  countNotifications: mocks.countNotifications,
  countUnreadNotifications: mocks.countUnreadNotifications,
  getNotifications: mocks.getNotifications,
  markNotificationAsRead: mocks.markNotificationAsRead,
}));

vi.mock("../services/email.service.js", () => ({
  sendNotificationEmail: vi.fn(),
}));

import {
  getMyNotifications,
  markAsRead,
} from "../services/notification.service.js";

describe("customer notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("paginates only the authenticated customer's notification records", async () => {
    mocks.countNotifications.mockResolvedValue(23);
    mocks.countUnreadNotifications.mockResolvedValue(4);
    mocks.getNotifications.mockResolvedValue([{ notification_id: 9 }]);

    const result = await getMyNotifications(17, {
      page: "2",
      limit: "10",
    });

    expect(mocks.countNotifications).toHaveBeenCalledWith(17, false);
    expect(mocks.countUnreadNotifications).toHaveBeenCalledWith(17);
    expect(mocks.getNotifications).toHaveBeenCalledWith(17, {
      page: 2,
      limit: 10,
      offset: 10,
      unreadOnly: false,
    });
    expect(result).toMatchObject({
      items: [{ notification_id: 9 }],
      unread_count: 4,
      pagination: {
        page: 2,
        limit: 10,
        total_items: 23,
        total_pages: 3,
        has_next_page: true,
        has_previous_page: true,
      },
    });
  });

  it("does not reveal notifications that are not owned by the customer", async () => {
    mocks.markNotificationAsRead.mockResolvedValue(false);

    await expect(markAsRead(17, 99)).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(mocks.markNotificationAsRead).toHaveBeenCalledWith(99, 17);
  });

  it("rejects unsafe pagination values", async () => {
    await expect(
      getMyNotifications(17, { page: "9007199254740991", limit: "50" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
