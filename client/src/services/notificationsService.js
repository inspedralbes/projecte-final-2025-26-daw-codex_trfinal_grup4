/**
 * Notifications Service
 * Handles notification fetching and management
 */
import api from "./api";

const notificationsService = {
  /**
   * Get paginated notifications
   * @param {Object} params
   * @param {number} params.page - Page number
   * @param {boolean} params.unread_only - Filter only unread
   * @returns {Promise<Object>} Paginated notifications with unread_count in meta
   */
  getNotifications: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.unread_only) query.set("unread_only", "true");
    
    const queryString = query.toString();
    return api.get(`/notifications${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * Get unread notification count
   * @returns {Promise<Object>} { count: number }
   */
  getUnreadCount: async () => {
    return api.get("/notifications/count");
  },

  /**
   * Mark a notification as read
   * @param {number} notificationId - Notification ID
   * @returns {Promise<Object>} Success response
   */
  markAsRead: async (notificationId) => {
    return api.patch(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Success response with count
   */
  markAllAsRead: async () => {
    return api.patch("/notifications/read-all");
  },

  /**
   * Delete a notification
   * @param {number} notificationId - Notification ID
   * @returns {Promise<Object>} Success response
   */
  deleteNotification: async (notificationId) => {
    return api.delete(`/notifications/${notificationId}`);
  },
};

export default notificationsService;
