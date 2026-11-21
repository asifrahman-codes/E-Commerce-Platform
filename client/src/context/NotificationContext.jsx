import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AuthContext } from "./AuthContext";
import { getUnreadCount } from "../services/notification.service";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const requestSequence = useRef(0);

  const refreshUnreadCount = useCallback(async () => {
    if (authLoading) return null;

    if (!isAuthenticated) {
      requestSequence.current += 1;
      setUnreadCount(0);
      return 0;
    }

    const requestId = ++requestSequence.current;

    try {
      const result = await getUnreadCount();
      const count = Number(result?.unread_count ?? 0);

      if (requestId === requestSequence.current) {
        setUnreadCount(Number.isSafeInteger(count) ? count : 0);
      }

      return count;
    } catch (error) {
      console.error("Unread notifications could not be loaded:", error);
      return null;
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;
    void refreshUnreadCount();
  }, [authLoading, refreshUnreadCount]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return undefined;

    const refreshOnFocus = () => {
      void refreshUnreadCount();
    };

    window.addEventListener("focus", refreshOnFocus);
    return () => window.removeEventListener("focus", refreshOnFocus);
  }, [authLoading, isAuthenticated, refreshUnreadCount]);

  const value = useMemo(
    () => ({ unreadCount, refreshUnreadCount }),
    [unreadCount, refreshUnreadCount]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider."
    );
  }
  return context;
}
