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
   * Get messages for a specific group.
   * @param {number} groupId - The group ID
   * @param {number} [beforeId] - Load messages before this ID
   * @param {number} [limit=50] - Number of messages to load
   * @returns {Promise<{messages: Array, group: Object}>}
   */
  getGroupMessages: async (groupId, beforeId = null, limit = 50) => {
    let endpoint = `/chat/groups/${groupId}?limit=${limit}`;
    if (beforeId) {
      endpoint += `&before_id=${beforeId}`;
    }
    const response = await api.get(endpoint);
    return response.data;
  },

  /**
   * Send a message to a user.
   * @param {number|null} receiverId - The recipient's user ID
   * @param {string} content - Message content
   * @param {number|null} groupId - The group ID
   * @returns {Promise<{message: Object}>}
   */
  sendMessage: async (receiverId, content, groupId = null) => {
    const response = await api.post('/chat/messages', {
      receiver_id: receiverId,
      group_id: groupId,
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

  /**
   * Get mutual followers.
   * @returns {Promise<{users: Array}>}
   */
  getMutualFollowers: async () => {
    const response = await api.get('/users/mutual-followers');
    return response.data;
  },

  /**
   * Create a new group.
   * @param {string} name - Group name
   * @param {Array<number>} memberIds - List of member user IDs
   * @returns {Promise<{group: Object}>}
   */
  createGroup: async (name, memberIds) => {
    const response = await api.post('/groups', {
      name,
      member_ids: memberIds,
    });
    return response.data;
  },

  /**
   * Get all groups for the current user.
   * @returns {Promise<{groups: Array}>}
   */
  getGroups: async () => {
    const response = await api.get('/groups');
    return response.data;
  },

  /**
   * Update group name and image.
   * @param {number} groupId 
   * @param {string} name 
   * @param {string|null} imageUrl 
   */
  updateGroup: async (groupId, name, imageUrl = null) => {
    console.log(`[chatService] Updating group ${groupId}:`, { name, imageUrl });
    const response = await api.put(`/groups/${groupId}`, {
      name,
      image_url: imageUrl
    });
    return response.data;
  },

  /**
   * Toggle admin status for a group member.
   * @param {number} groupId 
   * @param {number} userId 
   */
  toggleGroupAdmin: async (groupId, userId) => {
    const response = await api.post(`/groups/${groupId}/members/${userId}/toggle-admin`);
    return response.data;
  },

  /**
   * Remove a member from a group.
   * @param {number} groupId 
   * @param {number} userId 
   */
  removeGroupMember: async (groupId, userId) => {
    console.log(`[chatService] Removing member ${userId} from group ${groupId}`);
    const response = await api.delete(`/groups/${groupId}/members/${userId}`);
    return response.data;
  },

  /**
   * Add a member to a group.
   * @param {number} groupId 
   * @param {number} userId 
   */
  addGroupMember: async (groupId, userId) => {
    const response = await api.post(`/groups/${groupId}/members`, {
      user_id: userId
    });
    return response.data;
  },

  /**
   * Leave a group.
   * @param {number} groupId 
   */
  leaveGroup: async (groupId) => {
    console.log(`[chatService] Leaving group ${groupId}`);
    const response = await api.post(`/groups/${groupId}/leave`);
    return response.data;
  },

  /**
   * Upload group image.
   * @param {number} groupId 
   * @param {File} file 
   */
  uploadGroupImage: async (groupId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    // MUST use api.upload because api.post stringifies the body to JSON
    return api.upload(`/groups/${groupId}/image`, formData);
  },

  /**
   * Mark a group as read.
   * @param {number} groupId 
   */
  markGroupAsRead: async (groupId) => {
    const response = await api.post(`/groups/${groupId}/read`);
    return response.data;
  },

  /**
   * Get messages for a group.
   * @param {number} groupId
   * @returns {Promise<{messages: Array, group: Object}>}
   */
  getGroupMessages: async (groupId, beforeId = null, limit = 50) => {
    let endpoint = `/chat/groups/${groupId}?limit=${limit}`;
    if (beforeId) {
      endpoint += `&before_id=${beforeId}`;
    }
    const response = await api.get(endpoint);
    return response.data;
  },

  /**
   * Create or get center group.
   * @returns {Promise<{group: Object}>}
   */
  createOrGetCenterGroup: async () => {
    const response = await api.post('/center/group');
    return response.data;
  },
};

export default chatService;
