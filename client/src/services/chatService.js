/**
 * Chat Service – Messaging API client
 *
 * Handles all chat/messaging related API calls.
 * Implements the mutual follow restriction logic.
 */

import api from './api';

const chatService = {
  /**
   * Get all conversations for the current user.
   * @returns {Promise<{conversations: Array, unread_total: number}>}
   */
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  /**
   * Get messages with a specific user.
   * @param {number} userId - The partner's user ID
   * @param {number} [beforeId] - Load messages before this ID (pagination)
   * @param {number} [limit=50] - Number of messages to load
   * @returns {Promise<{messages: Array, partner: Object, conversation_status: Object}>}
   */
  getMessages: async (userId, beforeId = null, limit = 50) => {
    let endpoint = `/chat/conversations/${userId}?limit=${limit}`;
    if (beforeId) {
      endpoint += `&before_id=${beforeId}`;
    }
    const response = await api.get(endpoint);
    return response.data;
  },

  /**
   * Send a message to a user.
   * @param {number} receiverId - The recipient's user ID
   * @param {string} content - Message content
   * @returns {Promise<{message: Object, is_mutual: boolean}>}
   */
  sendMessage: async (receiverId, content) => {
    const response = await api.post('/chat/messages', {
      receiver_id: receiverId,
      content,
    });
    return response.data;
  },

  /**
   * Mark all messages from a user as read.
   * @param {number} userId - The sender's user ID
   * @returns {Promise<{messages_read: number}>}
   */
  markAsRead: async (userId) => {
    const response = await api.post(`/chat/conversations/${userId}/read`);
    return response.data;
  },

  /**
   * Get total unread messages count.
   * @returns {Promise<{unread_count: number}>}
   */
  getUnreadCount: async () => {
    const response = await api.get('/chat/unread');
    return response.data;
  },

  /**
   * Check if the current user can message another user.
   * @param {number} userId - Target user ID
   * @returns {Promise<{can_send: boolean, is_mutual: boolean, restriction_reason: string|null, user: Object}>}
   */
  canMessage: async (userId) => {
    const response = await api.get(`/chat/can-message/${userId}`);
    return response.data;
  },

  /**
   * Search users to start a conversation.
   * @param {string} query - Search query (username or name)
   * @returns {Promise<{users: Array}>}
   */
  searchUsers: async (query) => {
    const response = await api.get(`/chat/search-users?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export default chatService;
