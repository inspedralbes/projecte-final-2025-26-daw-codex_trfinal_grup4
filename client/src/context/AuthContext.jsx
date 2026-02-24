import React, { createContext, useState, useEffect } from "react";
import api from "@/services/api";
import i18next from "i18next";

export const AuthContext = createContext(null);

// Password requirements (must match backend: min:8, confirmed)
export const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "Mínimo 8 caracteres", test: (pw) => pw.length >= 8 },
  { id: "uppercase", label: "Al menos una mayúscula", test: (pw) => /[A-Z]/.test(pw) },
  { id: "lowercase", label: "Al menos una minúscula", test: (pw) => /[a-z]/.test(pw) },
  { id: "number", label: "Al menos un número", test: (pw) => /[0-9]/.test(pw) },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  // Feedback message state: { type: 'success' | 'error' | 'info', messageKey: string, params?: object }
  const [authMessage, setAuthMessage] = useState(null);

  // Auto-clear messages after 6 seconds
  useEffect(() => {
    if (authMessage) {
      const timer = setTimeout(() => setAuthMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [authMessage]);

  // Restore session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await api.get("/me");
          const data = response.data || response;
          const userData = data.user || data;
          setUser(userData);
          setEmailVerified(data.email_verified ?? !!userData.email_verified_at);
        } catch (error) {
          console.error("Session expired or invalid token", error);
          localStorage.removeItem("token");
          setUser(null);
          setEmailVerified(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/login", { email, password });

      // The API returns: { success, message, data: { user, token, ... } }
      const data = response.data || response;
      const token = data.token;
      const userData = data.user;

      if (!token) {
        setAuthMessage({ type: "error", text: "Error: no se recibió token de autenticación." });
        return { success: false, message: "No token received" };
      }

      // Save token
      localStorage.setItem("token", token);

      // Update state
      setUser(userData);
      setEmailVerified(data.email_verified ?? !!userData.email_verified_at);

      setAuthMessage({
        type: "success",
        text: i18next.t("auth.login_success"),
      });
      return { success: true };
    } catch (error) {
      console.error("Login error", error);

      // Parse backend validation errors
      const errorMsg = parseApiError(error, i18next.t("auth.login_error_fallback"));
      setAuthMessage({ type: "error", text: errorMsg });

      return {
        success: false,
        message: errorMsg,
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post("/register", userData);

      // The API returns: { success, message, data: { user, token, ... } }
      const data = response.data || response;
      const token = data.token;
      const newUser = data.user;

      if (!token) {
        setAuthMessage({ type: "error", text: "Error: no se recibió token de autenticación." });
        return { success: false, message: "No token received" };
      }

      localStorage.setItem("token", token);
      setUser(newUser);
      setEmailVerified(data.email_verified ?? false);

      setAuthMessage({
        type: "success",
        text: i18next.t("auth.register_success"),
      });
      return { success: true };
    } catch (error) {
      console.error("Register error", error);

      const errorMsg = parseApiError(error, "Error en el registro. Inténtalo de nuevo.");
      setAuthMessage({ type: "error", text: errorMsg });

      return {
        success: false,
        message: errorMsg,
      };
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (e) {
      console.error("Logout error (ignoring)", e);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setEmailVerified(false);
      setAuthMessage({ type: "info", text: i18next.t("auth.logout_info") });
    }
  };

  /**
   * Check if an email domain has a registered center.
   * Returns: { has_center, center_name, center_city, is_pending, can_request }
   */
  const checkDomain = async (email) => {
    try {
      const response = await api.post("/check-domain", { email });
      return response.data || response;
    } catch (error) {
      console.error("Check domain error", error);
      return { has_center: false, can_request: false };
    }
  };

  /**
   * Register a new user AND submit a center request in one flow.
   * 1. Registers the user normally → gets token
   * 2. Uses the token to upload the center request with justificante
   */
  const registerWithCenterRequest = async (userData, centerRequestData) => {
    try {
      // Step 1: Register the user
      const regResponse = await api.post("/register", userData);
      const data = regResponse.data || regResponse;
      const token = data.token;
      const newUser = data.user;

      if (!token) {
        setAuthMessage({ type: "error", text: "Error: no se recibió token de autenticación." });
        return { success: false, message: "No token received" };
      }

      // Save token so the next request is authenticated
      localStorage.setItem("token", token);
      setUser(newUser);

      // Step 2: Submit center request with file
      const formData = new FormData();
      formData.append("center_name", centerRequestData.center_name);
      formData.append("domain", centerRequestData.domain);
      formData.append("full_name", centerRequestData.full_name);
      formData.append("justificante", centerRequestData.justificante);
      if (centerRequestData.city) {
        formData.append("city", centerRequestData.city);
      }

      await api.upload("/center-requests", formData);

      setAuthMessage({
        type: "success",
        text: i18next.t("auth.register_success"),
      });
      return { success: true };
    } catch (error) {
      console.error("Register with center request error", error);
      const errorMsg = parseApiError(error, i18next.t("auth.register_error_fallback"));
      setAuthMessage({ type: "error", text: errorMsg });
      return { success: false, message: errorMsg };
    }
  };

  /**
   * Re-fetch user data from /me to check if email has been verified.
   */
  const refreshUser = async () => {
    try {
      const response = await api.get("/me");
      const data = response.data || response;
      const userData = data.user || data;
      setUser(userData);
      setEmailVerified(data.email_verified ?? !!userData.email_verified_at);
    } catch (error) {
      console.error("refreshUser failed", error);
    }
  };

  // Clear the feedback message manually
  const clearAuthMessage = () => setAuthMessage(null);

  const value = {
    user,
    loading,
    emailVerified,
    login,
    register,
    registerWithCenterRequest,
    checkDomain,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    authMessage,
    setAuthMessage,
    clearAuthMessage,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

/**
 * Parse API error responses into user-friendly messages.
 * Handles Laravel validation errors (422) and generic messages.
 * Hides technical/SQL errors from users.
 */
function parseApiError(error, fallback) {
  // If error has a response body with validation errors
  if (error?.errors) {
    // Laravel sends errors as { field: [messages] }
    const messages = Object.values(error.errors).flat();
    return messages.join(" · ");
  }

  // If it's a simple message (but not a technical error)
  if (error?.message && error.message !== "Error") {
    const msg = error.message;

    // Don't show technical errors to users
    if (
      msg.includes("SQLSTATE") ||
      msg.includes("Connection:") ||
      msg.includes("Table") ||
      msg.includes("Column") ||
      msg.includes("SQL:")
    ) {
      return fallback;
    }

    return msg;
  }

  return fallback;
}
