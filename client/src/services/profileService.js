/**
 * Profile Service
 * Handles user profiles and stats
 */
import api from "./api";

const profileService = {
  /**
   * Get a user's public profile
   * @param {string} username - Username
   * @returns {Promise<Object>} Profile with stats, reputation, badges, top_tags
   */
  getProfile: async (username) => {
    return api.get(`/profile/${username}`);
  },

  /**
   * Get a user's posts
   * @param {string} usernameOrId - Username or user ID
   * @param {Object} params - Query params
   * @param {number} params.page - Page number
   * @returns {Promise<Object>} Paginated posts
   */
  getUserPosts: async (usernameOrId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/profile/${usernameOrId}/posts?${queryString}`
      : `/profile/${usernameOrId}/posts`;
    return api.get(endpoint);
  },

  /**
   * Update current user's profile
   * @param {Object} data - Profile data
   * @param {string} data.name - Display name
   * @param {string} data.bio - Biography (max 1000)
   * @param {string} data.linkedin_url - LinkedIn URL
   * @param {string} data.portfolio_url - Portfolio URL
   * @param {string} data.external_url - Other URL
   * @returns {Promise<Object>} Updated user
   */
  updateProfile: async (data) => {
    return api.put("/profile", data);
  },

  /**
   * Update profile with avatar (multipart)
   * @param {FormData} formData - Form data with avatar file
   * @returns {Promise<Object>} Updated user
   */
  updateProfileWithAvatar: async (formData) => {
    // Laravel doesn't support PUT with multipart/form-data natively.
    // Use method spoofing: send POST but include _method=PUT in the FormData.
    formData.append("_method", "PUT");
    return api.upload("/profile", formData);
  },

  /**
   * Get leaderboard - top contributors ranked by reputation
   * @param {number} limit - Max number of users (default 10, max 50)
   * @returns {Promise<Array>} Leaderboard with rank, user info, score, badge
   */
  getLeaderboard: async (limit = 10) => {
    return api.get(`/leaderboard?limit=${limit}`);
  },
};

export default profileService;
