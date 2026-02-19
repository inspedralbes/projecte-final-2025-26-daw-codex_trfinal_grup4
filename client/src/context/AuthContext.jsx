import React, { createContext, useState, useEffect } from "react";
import api from "@/services/api";

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
  const [loading, setLoading] = useState(true);

  // Feedback message state: { type: 'success' | 'error' | 'info', text: string }
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
          const userData = response.data?.user || response.user || response.data;
          setUser(userData);
        } catch (error) {
          console.error("Session expired or invalid token", error);
          localStorage.removeItem("token");
          setUser(null);
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

      setAuthMessage({
        type: "success",
        text: "✅ ¡Inicio de sesión exitoso! Bienvenido de vuelta.",
      });
      return { success: true };
    } catch (error) {
      console.error("Login error", error);

      // Parse backend validation errors
      const errorMsg = parseApiError(error, "Error al iniciar sesión. Verifica tus credenciales.");
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

      setAuthMessage({
        type: "success",
        text: "🎉 ¡Cuenta creada correctamente! Te hemos enviado un email de verificación.",
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
      setAuthMessage({ type: "info", text: "Sesión cerrada correctamente." });
    }
  };

  // Clear the feedback message manually
  const clearAuthMessage = () => setAuthMessage(null);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
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
 */
function parseApiError(error, fallback) {
  // If error has a response body with validation errors
  if (error?.errors) {
    // Laravel sends errors as { field: [messages] }
    const messages = Object.values(error.errors).flat();
    return messages.join(" · ");
  }

  // If it's a simple message
  if (error?.message && error.message !== "Error") {
    return error.message;
  }

  return fallback;
}
