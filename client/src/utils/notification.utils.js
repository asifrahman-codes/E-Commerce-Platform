export function getNotificationData(notification) {
  if (notification?.data && typeof notification.data === "object") {
    return notification.data;
  }

  if (typeof notification?.data === "string") {
    try {
      const data = JSON.parse(notification.data);
      return data && typeof data === "object" ? data : {};
    } catch (error) {
      console.error("Notification data could not be parsed:", error);
    }
  }

  return {};
}

export function isNotificationRead(notification) {
  return notification?.is_read === true ||
    Number(notification?.is_read) === 1;
}

export function getNotificationTarget(notification) {
  const data = getNotificationData(notification);
  const orderId = data.order_id ?? data.orderId;
  if (orderId) {
    return { href: `/orders/${encodeURIComponent(orderId)}`, label: "View order" };
  }
  const ticketId = data.support_ticket_id;
  if (ticketId) {
    const base = data.support_admin_view ? "/admin/support" : "/support/tickets";
    return {
      href: `${base}/${encodeURIComponent(ticketId)}`,
      label: "View ticket",
    };
  }
  if (data.product_id && data.question_id) {
    return {
      href: `/products/${encodeURIComponent(data.product_id)}#questions`,
      label: "View Q&A",
    };
  }
  return null;
}

export function getNotificationOrderHref(notification) {
  const data = getNotificationData(notification);
  const orderId = data.order_id ?? data.orderId;
  return orderId ? `/orders/${encodeURIComponent(orderId)}` : null;
}

export function formatNotificationDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
