import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, CheckCheck } from "lucide-react";

import {
  getMyNotifications,
  markAllAsRead,
  markAsRead,
} from "../../services/notification.service";
import { useNotifications } from "../../context/NotificationContext";
import {
  formatNotificationDate,
  getNotificationTarget,
  isNotificationRead,
} from "../../utils/notification.utils";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);
  const { unreadCount, refreshUnreadCount } = useNotifications();

  const loadRecentNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getMyNotifications({ page: 1, limit: 5 });
      setItems(Array.isArray(result?.items) ? result.items : []);
      await refreshUnreadCount();
    } catch (loadError) {
      setError(loadError?.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (open) void loadRecentNotifications();
  }, [open, loadRecentNotifications]);

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!dropdownRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const handleMarkRead = async (notification) => {
    if (isNotificationRead(notification)) return;
    const id = notification.notification_id;
    setItems((previous) => previous.map((item) =>
      item.notification_id === id ? { ...item, is_read: true } : item
    ));

    try {
      await markAsRead(id);
      await refreshUnreadCount();
    } catch (updateError) {
      setItems((previous) => previous.map((item) =>
        item.notification_id === id ? { ...item, is_read: false } : item
      ));
      setError(updateError?.message || "Unable to mark this notification as read.");
    }
  };

  const handleMarkAllRead = async () => {
    setError("");
    try {
      await markAllAsRead();
      setItems((previous) => previous.map((item) => ({
        ...item,
        is_read: true,
        read_at: item.read_at ?? new Date().toISOString(),
      })));
      await refreshUnreadCount();
    } catch (updateError) {
      setError(updateError?.message || "Unable to mark notifications as read.");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition hover:bg-indigo-50 hover:text-indigo-700"
      >
        <Bell size={21} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section
          role="dialog"
          aria-label="Recent notifications"
          className="absolute right-0 top-[calc(100%+0.75rem)] z-[60] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[1.4rem] border border-line bg-white shadow-[0_20px_60px_rgba(29,40,34,0.16)]"
        >
          <header className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <h2 className="font-semibold text-ink">Notifications</h2>
              <p className="text-xs text-zinc-500">
                {unreadCount ? `${unreadCount} unread` : "You’re all caught up"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </header>

          {error && (
            <div role="alert" className="px-4 py-3 text-sm text-red-600">
              {error}
              <button type="button" onClick={() => void loadRecentNotifications()} className="ml-2 font-semibold underline">
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div role="status" aria-label="Loading notifications" className="space-y-3 px-4 py-5">
              <div className="h-4 w-3/4 animate-pulse rounded bg-[#edf0e9]" />
              <div className="h-3 w-full animate-pulse rounded bg-[#edf0e9]" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-[#edf0e9]" />
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell size={25} className="mx-auto text-zinc-300" />
              <p className="mt-2 text-sm font-medium text-zinc-700">No notifications yet</p>
              <p className="mt-1 text-xs text-zinc-500">Order and delivery updates appear here.</p>
            </div>
          ) : (
            <ul className="max-h-[min(65vh,28rem)] overflow-y-auto divide-y divide-zinc-100">
              {items.map((notification) => {
                const isRead = isNotificationRead(notification);
                const notificationTarget = getNotificationTarget(notification);
                return (
                  <li
                    key={notification.notification_id}
                    className={`px-4 py-3 ${isRead ? "bg-white" : "bg-indigo-50/70"}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isRead ? "bg-zinc-200" : "bg-indigo-600"}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${isRead ? "font-medium text-zinc-700" : "font-bold text-zinc-900"}`}>
                          {notification.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-600">
                          {notification.message}
                        </p>
                        <time
                          dateTime={notification.created_at}
                          className="mt-1 block text-[11px] text-zinc-400"
                        >
                          {formatNotificationDate(notification.created_at)}
                        </time>
                        <div className="mt-2 flex gap-3">
                          {notificationTarget && (
                            <Link
                              to={notificationTarget.href}
                              onClick={() => {
                                setOpen(false);
                                void handleMarkRead(notification);
                              }}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                            >
                              {notificationTarget.label}
                            </Link>
                          )}
                          {!isRead && (
                            <button
                              type="button"
                              onClick={() => void handleMarkRead(notification)}
                              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-indigo-700"
                            >
                              <Check size={13} />
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            to="/account/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-line px-4 py-3 text-center text-sm font-semibold text-indigo-700 transition hover:bg-[#f6f7f3]"
          >
            View all notifications
          </Link>
        </section>
      )}
    </div>
  );
}
