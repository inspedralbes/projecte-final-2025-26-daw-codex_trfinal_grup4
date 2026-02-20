/**
 * Search Service
 * Handles global and center search
 */
import api from "./api";

const searchService = {
  /**
   * Global search across posts, users, and tags
   * @param {string} query - Search query (min 2 chars)
   * @param {string} type - Filter by type: "posts", "users", "tags", or omit for all
   * @returns {Promise<Object>} Search results grouped by type
   */
  search: async (query, type = null) => {
    const params = new URLSearchParams({ q: query });
    if (type) params.set("type", type);
    return api.get(`/search?${params.toString()}`);
  },

  /**
   * Search within user's center
   * @param {string} query - Search query
   * @returns {Promise<Object>} Center search results (posts, members)
   */
  searchCenter: async (query) => {
    return api.get(`/center/search?q=${encodeURIComponent(query)}`);
  },
};

export default searchService;
