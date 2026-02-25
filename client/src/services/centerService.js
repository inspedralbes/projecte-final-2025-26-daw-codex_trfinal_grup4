/**
 * Center Service
 * Handles center hub functionality and membership
 */
import api from "./api";

const centerService = {
  /**
   * Get list of active centers
   * @returns {Promise<Object>} List of centers
   */
  getCenters: async () => {
    return api.get("/centers");
  },

  /**
   * Get a specific center
   * @param {number} centerId - Center ID
   * @returns {Promise<Object>} Center data
   */
  getCenter: async (centerId) => {
    return api.get(`/centers/${centerId}`);
  },

  /**
   * Get public members of a center (any member can access)
   * @param {number} centerId - Center ID
   * @param {Object} params - Filter params
   * @param {string} params.role - Filter by role
   * @param {string} params.search - Search by name/username
   * @param {number} params.page - Page number
   * @returns {Promise<Object>} Paginated members list
   */
  getCenterMembers: async (centerId, params = {}) => {
    const query = new URLSearchParams();
    if (params.role) query.set("role", params.role);
    if (params.search) query.set("search", params.search);
    if (params.page) query.set("page", params.page);
    
    const queryString = query.toString();
    return api.get(`/centers/${centerId}/members${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * Get members of the user's center (for teachers - admin endpoint)
   * @param {Object} params - Filter params
   * @param {string} params.role - Filter by role
   * @param {string} params.search - Search by name/username
   * @param {boolean} params.is_blocked - Filter blocked users
   * @returns {Promise<Object>} Paginated members list
   */
  getMembers: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.role) query.set("role", params.role);
    if (params.search) query.set("search", params.search);
    if (params.is_blocked !== undefined) query.set("is_blocked", params.is_blocked);
    
    const queryString = query.toString();
    return api.get(`/center/members${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * Get a specific member of the center
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Member data
   */
  getMember: async (userId) => {
    return api.get(`/center/members/${userId}`);
  },

  /**
   * Change a member's role (teacher only)
   * @param {number} userId - User ID
   * @param {string} role - New role (student, teacher)
   * @returns {Promise<Object>} Updated member
   */
  changeRole: async (userId, role) => {
    return api.patch(`/center/members/${userId}/role`, { role });
  },

  /**
   * Block a member (teacher only)
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Success response
   */
  blockMember: async (userId) => {
    return api.patch(`/center/members/${userId}/block`);
  },

  /**
   * Unblock a member (teacher only)
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Success response
   */
  unblockMember: async (userId) => {
    return api.patch(`/center/members/${userId}/unblock`);
  },

  /**
   * Remove a member from the center (teacher only)
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Success response
   */
  removeMember: async (userId) => {
    return api.delete(`/center/members/${userId}`);
  },

  /**
   * Update center info (teacher only)
   * @param {number} centerId - Center ID
   * @param {Object} data - Center data (name, description, website)
   * @returns {Promise<Object>} Updated center
   */
  updateCenter: async (centerId, data) => {
    return api.put(`/centers/${centerId}`, data);
  },
};

export default centerService;
