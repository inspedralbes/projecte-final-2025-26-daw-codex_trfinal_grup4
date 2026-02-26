/**
 * Interactions Service
 * Handles likes and bookmarks (polymorphic interactions)
 */
import api from "./api";

const interactionsService = {
  /**
   * Toggle like/bookmark on a resource (post or comment)
   * @param {string} type - Interaction type: "like" or "bookmark"
   * @param {string} resourceType - Resource type: "post" or "comment"
   * @param {number} resourceId - Resource ID
   * @returns {Promise<Object>} Interaction result with action performed
   */
  toggle: async (type, resourceType, resourceId) => {
    return api.post("/interactions", {
      type,
      interactable_type: resourceType,
      interactable_id: resourceId,
    });
  },

  /**
   * Toggle like on a post
   * @param {number} postId - Post ID
   * @returns {Promise<Object>} Result with action ("created" or "removed")
   */
  likePost: async (postId) => {
    return api.post("/interactions", {
      type: "like",
      interactable_type: "post",
      interactable_id: postId,
    });
  },

  /**
   * Toggle bookmark on a post
   * @param {number} postId - Post ID
   * @returns {Promise<Object>} Result with action ("created" or "removed")
   */
  bookmarkPost: async (postId) => {
    return api.post("/interactions", {
      type: "bookmark",
      interactable_type: "post",
      interactable_id: postId,
    });
  },

  /**
   * Toggle like on a comment
   * @param {number} commentId - Comment ID
   * @returns {Promise<Object>} Result with action ("created" or "removed")
   */
  likeComment: async (commentId) => {
    return api.post("/interactions", {
      type: "like",
      interactable_type: "comment",
      interactable_id: commentId,
    });
  },

  /**
   * Get interaction counts and user state for a post
   * @param {number} postId - Post ID
   * @returns {Promise<Object>} { likes, bookmarks, user_liked, user_bookmarked }
   */
  getPostInteractions: async (postId) => {
    return api.get(`/posts/${postId}/interactions`);
  },

  /**
   * Get posts that the current user has liked
   * @param {number} page - Page number (default 1)
   * @param {number} perPage - Items per page (default 15)
   * @returns {Promise<Object>} Paginated list of liked posts
   */
  getLikedPosts: async (page = 1, perPage = 15) => {
    return api.get(`/liked?page=${page}&per_page=${perPage}`);
  },

  /**
   * Get posts that the current user has bookmarked
   * @param {number} page - Page number (default 1)
   * @param {number} perPage - Items per page (default 15)
   * @returns {Promise<Object>} Paginated list of bookmarked posts
   */
  getBookmarkedPosts: async (page = 1, perPage = 15) => {
    return api.get(`/bookmarks?page=${page}&per_page=${perPage}`);
  },
};

export default interactionsService;
