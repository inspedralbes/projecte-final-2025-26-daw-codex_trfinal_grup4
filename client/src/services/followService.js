/**
 * Follow Service
 * Handles follow/unfollow for users and tags
 */
import api from "./api";

const followService = {
  /**
   * Toggle follow/unfollow a user
   * @param {number} userId - User ID to follow/unfollow
   * @returns {Promise<Object>} { following: boolean }
   */
  toggleFollowUser: async (userId) => {
    return api.post(`/users/${userId}/follow`);
  },

  /**
   * Get followers of a user
   * @param {number} userId - User ID
   * @param {number} page - Page number
   * @returns {Promise<Object>} Paginated followers list
   */
  getFollowers: async (userId, page = 1) => {
    return api.get(`/users/${userId}/followers?page=${page}`);
  },

  /**
   * Get users that a user is following
   * @param {number} userId - User ID
   * @param {number} page - Page number
   * @returns {Promise<Object>} Paginated following list
   */
  getFollowing: async (userId, page = 1) => {
    return api.get(`/users/${userId}/following?page=${page}`);
  },

  /**
   * Get follow status for the authenticated user
   * @param {number} userId - User ID to check
   * @returns {Promise<Object>} { is_following, followers_count, following_count }
   */
  getFollowStatus: async (userId) => {
    return api.get(`/users/${userId}/follow-status`);
  },

  /**
   * Toggle follow/unfollow a tag
   * @param {number} tagId - Tag ID
   * @returns {Promise<Object>} { following: boolean }
   */
  toggleFollowTag: async (tagId) => {
    return api.post(`/tags/${tagId}/follow`);
  },

  /**
   * Toggle notifications for a followed tag
   * @param {number} tagId - Tag ID
   * @returns {Promise<Object>} { notify: boolean }
   */
  toggleTagNotify: async (tagId) => {
    return api.patch(`/tags/${tagId}/notify`);
  },

  /**
   * Get tags followed by the user
   * @returns {Promise<Object>} List of followed tags
   */
  getFollowedTags: async () => {
    return api.get("/tags/followed");
  },
};

export default followService;
