/**
 * useNotifications Hook
 * Fetches and manages notifications state
 */
import { useState, useEffect, useCallback } from "react";
import notificationsService from "@/services/notificationsService";

/**
 * Hook for managing notifications
 * @returns {Object} Notifications state and actions
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await notificationsService.getNotifications({ page: pageNum });
      const data = response.data || response;
      const newNotifications = data.data || data;
      
      // Meta contains unread_count
      const meta = data.meta || {};
      setUnreadCount(meta.unread_count || 0);
      
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
  }, []);

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
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      // Check if it was unread before deleting
      const notification = notifications.find((n) => n.id === notificationId);
      const wasUnread = notification && !notification.read_at;

      await notificationsService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [notifications]);

  // Add notification (from real-time event)
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
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
