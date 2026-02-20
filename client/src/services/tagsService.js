/**
 * Tags Service
 * Handles tag listing and management
 */
import api from "./api";

const tagsService = {
  /**
   * Get all tags (global) with post counts
   * @returns {Promise<Object>} List of tags with counts
   */
  getTags: async () => {
    return api.get("/tags");
  },

  /**
   * Get tags used within the user's center
   * @returns {Promise<Object>} Center-specific tags with counts
   */
  getCenterTags: async () => {
    return api.get("/center/tags");
  },
};

export default tagsService;
