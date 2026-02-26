import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";

/**
 * GoogleCallback – Handles the redirect from Google OAuth.
 *
 * Google redirects to: /auth/google/callback?code=XXXX
 * This page captures the code, sends it to the backend,
 * and redirects the user to the home page.
 */
export default function GoogleCallback() {
  const { t } = useTranslation();
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent double-execution in StrictMode
    if (processedRef.current) return;
    processedRef.current = true;

    const code = searchParams.get("code");

    if (!code) {
      setError(t("landing.errors.google_no_code"));
      setTimeout(() => navigate("/welcome"), 3000);
      return;
    }

    const handleCallback = async () => {
      const result = await loginWithGoogle(code);

      if (result.success) {
        navigate("/", { replace: true });
      } else {
        setError(result.message || t("landing.errors.google_failed"));
        setTimeout(() => navigate("/welcome"), 3000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "var(--depth-0)",
        color: "var(--ink-primary)",
        gap: "1rem",
      }}
    >
      {error ? (
        <>
          <p style={{ color: "#ef4444", fontSize: "1rem" }}>{error}</p>
          <p style={{ color: "var(--ink-tertiary)", fontSize: "0.875rem" }}>
            {t("landing.messages.redirecting")}
          </p>
        </>
      ) : (
        <>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid rgba(20,184,166,0.2)",
              borderTopColor: "var(--codex-teal)",
              borderRadius: "50%",
              animation: "spinner-rotate 0.8s linear infinite",
            }}
          />
          <p style={{ color: "var(--ink-secondary)", fontSize: "0.95rem" }}>
            {t("landing.messages.google_processing")}
          </p>
        </>
      )}
    </div>
  );
}
