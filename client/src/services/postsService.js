/**
 * Posts Service
 * Handles all API calls related to posts (CRUD, feed, center posts)
 */
import api from "./api";

const postsService = {
  /**
   * Get global feed (posts without center_id)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {string} params.tag - Filter by tag slug
   * @param {string} params.type - Filter by type (question|news)
   * @returns {Promise<Object>} Paginated posts
   */
  getFeed: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.tag) query.set("tag", params.tag);
    if (params.type) query.set("type", params.type);
    
    const queryString = query.toString();
    return api.get(`/posts${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * Get feed from followed users
   * @param {number} page - Page number
   * @returns {Promise<Object>} Paginated posts from followed users
   */
  getFollowingFeed: async (page = 1) => {
    return api.get(`/feed/following?page=${page}`);
  },

  /**
   * Get posts from user's center (Hub)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {string} params.tag - Filter by tag slug
   * @returns {Promise<Object>} Paginated center posts
   */
  getCenterPosts: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.tag) query.set("tag", params.tag);
    
    const queryString = query.toString();
    return api.get(`/center/posts${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * Get a single post by ID
   * @param {number} postId - Post ID
   * @returns {Promise<Object>} Post data
   */
  getPost: async (postId) => {
    return api.get(`/posts/${postId}`);
  },

  /**
   * Create a new post
   * @param {Object} postData - Post data
   * @param {string} postData.content - Text content (optional if code_snippet exists)
   * @param {string} postData.code_snippet - Code content (optional)
   * @param {string} postData.code_language - Programming language
   * @param {string} postData.type - Post type (news|question)
   * @param {Array<string>} postData.tags - Tag names (max 5)
   * @returns {Promise<Object>} Created post
   */
  createPost: async (postData) => {
    return api.post("/posts", postData);
  },

  /**
   * Update an existing post
   * @param {number} postId - Post ID
   * @param {Object} postData - Updated post data
   * @returns {Promise<Object>} Updated post
   */
  updatePost: async (postId, postData) => {
    return api.put(`/posts/${postId}`, postData);
  },

  /**
   * Delete a post (soft delete)
   * @param {number} postId - Post ID
   * @returns {Promise<Object>} Success response
   */
  deletePost: async (postId) => {
    return api.delete(`/posts/${postId}`);
  },

  /**
   * Repost an existing post
   * @param {number} postId - Original post ID
   * @returns {Promise<Object>} Repost data
   */
  repost: async (postId) => {
    return api.post(`/posts/${postId}/repost`);
  },

  /**
   * Get user's bookmarked posts
   * @param {number} page - Page number
   * @returns {Promise<Object>} Paginated bookmarked posts
   */
  getBookmarks: async (page = 1) => {
    return api.get(`/bookmarks?page=${page}`);
  },

  /**
   * Get user's liked posts
   * @param {number} page - Page number
   * @returns {Promise<Object>} Paginated liked posts
   */
  getLikedPosts: async (page = 1) => {
    return api.get(`/liked?page=${page}`);
  },
};

export default postsService;
