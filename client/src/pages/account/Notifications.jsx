import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";

import {
  deleteNotification,
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
import StorefrontSkeleton from "../../components/common/StorefrontSkeleton";

const PAGE_SIZE = 10;

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total_items: 0,
    total_pages: 0,
    has_next_page: false,
    has_previous_page: false,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const { unreadCount, refreshUnreadCount } = useNotifications();

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getMyNotifications({
        page,
        limit: PAGE_SIZE,
      });
      setItems(Array.isArray(result?.items) ? result.items : []);
      setPagination(result?.pagination ?? {
        page,
        limit: PAGE_SIZE,
        total_items: 0,
        total_pages: 0,
        has_next_page: false,
        has_previous_page: false,
      });
      await refreshUnreadCount();
    } catch (loadError) {
      setError(loadError?.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [page, refreshUnreadCount]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (notification) => {
    if (isNotificationRead(notification)) return;

    const notificationId = notification.notification_id;
    setItems((previous) => previous.map((item) =>
      item.notification_id === notificationId
        ? { ...item, is_read: true, read_at: new Date().toISOString() }
        : item
    ));

    try {
      await markAsRead(notificationId);
      await refreshUnreadCount();
    } catch (updateError) {
      setItems((previous) => previous.map((item) =>
        item.notification_id === notificationId
          ? { ...item, is_read: false, read_at: null }
          : item
      ));
      setError(updateError?.message || "Unable to mark this notification as read.");
    }
  };

  const handleMarkAllRead = async () => {
    setUpdating(true);
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
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (notificationId) => {
    setUpdating(true);
    setError("");

    try {
      await deleteNotification(notificationId);
      const remaining = items.filter(
        (item) => item.notification_id !== notificationId
      );
      const totalItems = Math.max(0, pagination.total_items - 1);

      if (remaining.length === 0 && page > 1) {
        setPage((current) => current - 1);
      } else {
        setItems(remaining);
        setPagination((current) => ({
          ...current,
          total_items: totalItems,
          total_pages: Math.ceil(totalItems / PAGE_SIZE),
          has_next_page: page * PAGE_SIZE < totalItems,
          has_previous_page: page > 1,
        }));
      }

      await refreshUnreadCount();
    } catch (deleteError) {
      setError(deleteError?.message || "Unable to delete this notification.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <section className="shop-panel p-5 sm:p-7">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-indigo-600" />
            <h2 className="text-xl font-semibold text-ink">Notifications</h2>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            {unreadCount ? `${unreadCount} unread` : "You’re all caught up."}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            disabled={updating}
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700 hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-50"
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        )}
      </header>

      {error && (
        <div role="alert" className="mb-4 flex items-center justify-between gap-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => void loadNotifications()} className="shrink-0 font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <StorefrontSkeleton label="Loading notifications" layout="list" embedded />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-14 text-center">
          <Bell size={30} className="mx-auto text-zinc-300" />
          <h3 className="mt-3 font-semibold text-zinc-800">No notifications yet</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Order and delivery updates will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-zinc-100">
            {items.map((notification) => {
              const isRead = isNotificationRead(notification);
              const notificationTarget = getNotificationTarget(notification);

              return (
                <article
                  key={notification.notification_id}
                  className={`flex gap-3 py-5 first:pt-1 last:pb-1 ${
                    isRead ? "opacity-75" : "rounded-xl bg-indigo-50/60 px-3"
                  }`}
                >
                  <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${isRead ? "bg-zinc-200" : "bg-indigo-600"}`} aria-label={isRead ? "Read" : "Unread"} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className={`text-sm ${isRead ? "font-medium text-zinc-700" : "font-bold text-zinc-900"}`}>
                        {notification.title}
                      </h3>
                      <time
                        dateTime={notification.created_at}
                        title={formatNotificationDate(notification.created_at)}
                        className="text-xs text-zinc-500"
                      >
                        {formatNotificationDate(notification.created_at)}
                      </time>
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-zinc-600">
                      {notification.message}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      {notificationTarget && (
                        <Link
                          to={notificationTarget.href}
                          onClick={() => void handleMarkRead(notification)}
                          className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          {notificationTarget.label}
                        </Link>
                      )}
                      {!isRead && (
                        <button
                          type="button"
                          onClick={() => void handleMarkRead(notification)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-indigo-700"
                        >
                          <Check size={15} />
                          Mark as read
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => void handleDelete(notification.notification_id)}
                        aria-label={`Delete ${notification.title}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {pagination.total_pages > 1 && (
            <nav aria-label="Notification pages" className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
              <button
                type="button"
                disabled={!pagination.has_previous_page || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
                Previous
              </button>
              <span className="text-sm text-zinc-500">
                Page {pagination.page} of {pagination.total_pages}
              </span>
              <button
                type="button"
                disabled={!pagination.has_next_page || loading}
                onClick={() => setPage((current) => current + 1)}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={17} />
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
