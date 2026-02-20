import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";
import "./EmailVerification.css";

const MailIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default function EmailVerification() {
  const { user, emailVerified, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [checking, setChecking] = useState(false);

  // Redirect to home once email is verified
  useEffect(() => {
    if (emailVerified) {
      navigate("/", { replace: true });
    }
  }, [emailVerified, navigate]);

  // Poll to check if email has been verified (every 5s)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (refreshUser) {
        setChecking(true);
        await refreshUser();
        setChecking(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshUser]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (resending || cooldown > 0) return;
    setResending(true);
    setResent(false);

    try {
      await api.post("/email/resend");
      setResent(true);
      setCooldown(60); // 60 second cooldown
    } catch (err) {
      console.error("Failed to resend", err);
    } finally {
      setResending(false);
    }
  }, [resending, cooldown]);

  return (
    <div className="email-verify">
      <div className="email-verify__card">
        <div className="email-verify__icon">
          <MailIcon />
        </div>

        <h1 className="email-verify__title">Verifica tu email</h1>

        <p className="email-verify__text">Hemos enviado un enlace de verificación a</p>
        <p className="email-verify__email">{user?.email}</p>
        <p className="email-verify__text">
          Revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace para activar
          tu cuenta.
        </p>

        {resent && <div className="email-verify__success">✅ Email reenviado correctamente</div>}

        <button
          className="email-verify__resend-btn"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
        >
          {resending
            ? "Enviando..."
            : cooldown > 0
              ? `Reenviar en ${cooldown}s`
              : "Reenviar email de verificación"}
        </button>

        <button className="email-verify__logout-btn" onClick={logout}>
          Cerrar sesión
        </button>

        {checking && <p className="email-verify__checking">Comprobando verificación...</p>}
      </div>
    </div>
  );
}
