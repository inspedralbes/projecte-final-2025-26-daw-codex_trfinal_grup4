/**
 * useNotifications Hook
 * Fetches and manages notifications state
 */
import { useState, useEffect, useCallback } from "react";
import notificationsService from "@/services/notificationsService";
import { useSocket } from "@/context/SocketContext";

/**
 * Hook for managing notifications
 * @returns {Object} Notifications state and actions
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Get global unread count from SocketContext
  const { unreadCount, setNotificationCount, decrementUnread, resetUnread } = useSocket();

  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await notificationsService.getNotifications({ page: pageNum });
      const data = response.data || response;
      const newNotifications = data.data || data;
      
      // Meta contains unread_count - sync with global context
      const meta = data.meta || {};
      setNotificationCount(meta.unread_count || 0);
      
      const lastPage = meta.last_page || 1;
      setHasMore(pageNum < lastPage);

      if (append) {
        setNotifications((prev) => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }
      
      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.message || "Error al cargar notificaciones");
    } finally {
      setLoading(false);
    }
  }, [setNotificationCount]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  // Load more
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1, true);
    }
  }, [loading, hasMore, page, fetchNotifications]);

  // Refresh
  const refresh = useCallback(() => {
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationsService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      decrementUnread();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [decrementUnread]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      resetUnread();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [resetUnread]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      // Check if it was unread before deleting
      const notification = notifications.find((n) => n.id === notificationId);
      const wasUnread = notification && !notification.read_at;

      await notificationsService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      
      if (wasUnread) {
        decrementUnread();
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [notifications, decrementUnread]);

  // Add notification (from real-time event) - unread count is handled by SocketContext
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    hasMore,
    loadMore,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  };
}

export default useNotifications;
