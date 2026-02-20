/**
 * Comments Service
 * Handles comments CRUD and threading
 */
import api from "./api";

const commentsService = {
  /**
   * Get comments for a post (threaded structure)
   * @param {number} postId - Post ID
   * @returns {Promise<Object>} Comments with nested replies
   */
  getComments: async (postId) => {
    return api.get(`/posts/${postId}/comments`);
  },

  /**
   * Create a new comment
   * @param {Object} commentData
   * @param {number} commentData.post_id - Post ID
   * @param {number|null} commentData.parent_id - Parent comment ID for replies
   * @param {string} commentData.content - Comment content
   * @returns {Promise<Object>} Created comment
   */
  createComment: async (commentData) => {
    return api.post("/comments", commentData);
  },

  /**
   * Update an existing comment
   * @param {number} commentId - Comment ID
   * @param {string} content - Updated content
   * @returns {Promise<Object>} Updated comment
   */
  updateComment: async (commentId, content) => {
    return api.put(`/comments/${commentId}`, { content });
  },

  /**
   * Delete a comment
   * @param {number} commentId - Comment ID
   * @returns {Promise<Object>} Success response
   */
  deleteComment: async (commentId) => {
    return api.delete(`/comments/${commentId}`);
  },

  /**
   * Toggle solution mark on a comment (only post author can do this)
   * @param {number} commentId - Comment ID
   * @returns {Promise<Object>} Result with is_solution and is_solved status
   */
  toggleSolution: async (commentId) => {
    return api.patch(`/comments/${commentId}/solution`);
  },
};

export default commentsService;
