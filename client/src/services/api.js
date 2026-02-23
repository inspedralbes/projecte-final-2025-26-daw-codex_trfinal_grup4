/**
 * API Service – Base HTTP client configuration
 *
 * Centralizes all HTTP communication with the backend.
 * Uses the VITE_API_URL environment variable as the base URL.
 *
 * Usage example (after adding business logic):
 *   import api from "@/services/api";
 *   const data = await api.get("/endpoint");
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

/**
 * Base fetch wrapper with default headers and error handling.
 *
 * @param {string} endpoint - API endpoint path (e.g., "/users")
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>} Parsed JSON response
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Check for token in localStorage
  const token = localStorage.getItem("token");

  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    
    // Sanitize error message - don't expose technical/SQL errors to users
    let errorMessage = error.message || `HTTP ${response.status}`;
    
    // Hide SQL/technical errors
    if (errorMessage.includes('SQLSTATE') || 
        errorMessage.includes('Connection:') ||
        errorMessage.includes('Table') ||
        errorMessage.includes('Column') ||
        response.status === 500) {
      errorMessage = response.status === 500 
        ? 'Error del servidor. Por favor, inténtalo más tarde.' 
        : 'Ha ocurrido un error. Por favor, inténtalo de nuevo.';
    }
    
    const err = new Error(errorMessage);
    err.status = response.status;
    err.errors = error.errors; // Keep Laravel validation errors
    throw err;
  }

  return response.json();
}

const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),
  put: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),
  patch: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: "PATCH", body: JSON.stringify(body) }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: "DELETE" }),

  /**
   * Upload files via FormData (multipart/form-data).
   * Do NOT set Content-Type – the browser sets it automatically with the boundary.
   */
  upload: (endpoint, formData, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem("token");

    return fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      body: formData,
      ...options,
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw error;
      }
      return response.json();
    });
  },
};

export default api;
