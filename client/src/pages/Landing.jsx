import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PASSWORD_REQUIREMENTS } from "@/context/AuthContext";
import TeacherVerificationModal from "@/components/auth/TeacherVerificationModal";
import "./Landing.css";

// Icons as inline SVGs for a minimal approach
const CodeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const UsersIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const TerminalIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function Landing() {
  const { login, register, registerWithCenterRequest, checkDomain, authMessage, clearAuthMessage } =
    useAuth();
  const navigate = useNavigate();

  // State
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPasswordReqs, setShowPasswordReqs] = useState(false);

  // School detection (real API)
  const [domainInfo, setDomainInfo] = useState(null); // { has_center, center_name, can_request, ... }
  const [checkingDomain, setCheckingDomain] = useState(false);
  const debounceRef = useRef(null);

  // Teacher verification modal
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pendingRegistrationData, setPendingRegistrationData] = useState(null);

  // Auto-clear success message after 4s
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Show password requirements when user is typing password (only in register mode)
  useEffect(() => {
    setShowPasswordReqs(!isLogin && password.length > 0);
  }, [password, isLogin]);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    // Reset domain info when email changes
    setDomainInfo(null);

    // Debounced check-domain API call (only in register mode)
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!isLogin && value.includes("@") && value.split("@")[1]?.includes(".")) {
      debounceRef.current = setTimeout(async () => {
        setCheckingDomain(true);
        const result = await checkDomain(value);
        setDomainInfo(result);
        setCheckingDomain(false);
      }, 600);
    }
  };

  // Check if all password requirements are met
  const allPasswordReqsMet = PASSWORD_REQUIREMENTS.every((req) => req.test(password));
  const passwordsMatch = password === passwordConfirmation && passwordConfirmation.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const result = await login(email, password);
        if (result.success) {
          setSuccessMsg("✅ ¡Inicio de sesión exitoso!");
          setTimeout(() => navigate("/"), 800);
        } else {
          setError(result.message);
        }
      } else {
        // REGISTER - Client-side validations
        if (!allPasswordReqsMet) {
          setError("La contraseña no cumple todos los requisitos.");
          setLoading(false);
          return;
        }

        if (password !== passwordConfirmation) {
          setError("Las contraseñas no coinciden.");
          setLoading(false);
          return;
        }

        // Generate username from email part
        const username = email.split("@")[0] + Math.floor(Math.random() * 1000);

        const userData = {
          name,
          email,
          username,
          password,
          password_confirmation: passwordConfirmation,
        };

        // If domain has no center and can request → show verification modal
        if (domainInfo && domainInfo.can_request) {
          setPendingRegistrationData(userData);
          setShowVerificationModal(true);
          setLoading(false);
          return;
        }

        // Normal registration (domain has center, or no domain info)
        const result = await register(userData);

        if (result.success) {
          setSuccessMsg("🎉 ¡Cuenta creada correctamente!");
          setTimeout(() => navigate("/"), 800);
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError("Ocurrió un error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Handle verification modal confirm
  const handleVerificationConfirm = async (centerData) => {
    setLoading(true);
    setError("");

    const result = await registerWithCenterRequest(pendingRegistrationData, centerData);

    if (result.success) {
      setShowVerificationModal(false);
      setSuccessMsg("🎉 ¡Cuenta creada! Tu solicitud de centro está en revisión.");
      setTimeout(() => navigate("/"), 1200);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleVerificationCancel = () => {
    setShowVerificationModal(false);
    setPendingRegistrationData(null);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccessMsg("");
    setPassword("");
    setPasswordConfirmation("");
    setDomainInfo(null);
    clearAuthMessage();
  };

  return (
    <div className="landing">
      {/* Ambient background effects */}
      <div className="landing__ambient">
        <div className="landing__gradient landing__gradient--teal" />
        <div className="landing__gradient landing__gradient--violet" />
        <div className="landing__grid" />
      </div>

      {/* Navigation removed as per user request */}

      {/* Hero Section */}
      <main className="landing__hero">
        <div className="landing__hero-content">
          {/* Badge */}
          <div className="landing__badge animate-slideDown">
            <span className="landing__badge-dot" />
            Red Social Académica para Desarrolladores
          </div>

          {/* Headline */}
          <h1 className="landing__title animate-slideUp">
            El espacio donde los <span className="landing__title-accent">estudiantes de FP</span>{" "}
            comparten código
          </h1>

          {/* Subheadline */}
          <p className="landing__subtitle animate-slideUp stagger-1">
            Conecta con tu centro, resuelve dudas técnicas y construye tu portfolio profesional
            junto a la comunidad de DAM, DAW y ASIX de toda España.
          </p>

          {/* Features Grid */}
          <div className="landing__features animate-slideUp stagger-2">
            <div className="landing__feature">
              <div className="landing__feature-icon">
                <CodeIcon />
              </div>
              <div className="landing__feature-text">
                <span className="landing__feature-title">Snippets con Sintaxis</span>
                <span className="landing__feature-desc">Comparte código con highlight</span>
              </div>
            </div>
            <div className="landing__feature">
              <div className="landing__feature-icon landing__feature-icon--violet">
                <UsersIcon />
              </div>
              <div className="landing__feature-text">
                <span className="landing__feature-title">Hub del Centro</span>
                <span className="landing__feature-desc">Espacio privado para tu instituto</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="landing__auth-card animate-slideUp stagger-3">
          <div className="auth-card">
            <div className="auth-card__header">
              <h2 className="auth-card__title">
                {isLogin ? "Bienvenido a Codex" : "Únete a Codex"}
              </h2>
              <p className="auth-card__subtitle">
                {isLogin
                  ? "Inicia sesión para continuar"
                  : "Usa tu email del centro para acceso completo"}
              </p>
            </div>

            {/* Success Message */}
            {successMsg && (
              <div className="auth-card__message auth-card__message--success">{successMsg}</div>
            )}

            {/* Error Message */}
            {error && <div className="auth-card__message auth-card__message--error">{error}</div>}

            <form className="auth-card__form" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="auth-card__input-group">
                  <label className="auth-card__label" htmlFor="name">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="auth-card__input"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div className="auth-card__input-group">
                <label className="auth-card__label" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className={`auth-card__input ${!isLogin && domainInfo?.has_center ? "auth-card__input--verified" : ""}`}
                  placeholder="tu.nombre@alu.iesjaume.es"
                  value={email}
                  onChange={handleEmailChange}
                />
                {!isLogin && checkingDomain && (
                  <div className="auth-card__verified" style={{ color: "var(--ink-tertiary)" }}>
                    <span>Comprobando dominio...</span>
                  </div>
                )}
                {!isLogin && domainInfo && !checkingDomain && (
                  <div
                    className="auth-card__verified"
                    style={domainInfo.has_center ? {} : { color: "var(--codex-violet-light)" }}
                  >
                    <ShieldIcon />
                    <span>
                      {domainInfo.has_center
                        ? `${domainInfo.center_name || "Centro"} detectado – Acceso completo`
                        : domainInfo.is_pending
                          ? "Centro en revisión – Tu solicitud está pendiente"
                          : domainInfo.can_request
                            ? "No hay centro para este dominio – Se te pedirá verificación"
                            : "Dominio no reconocido"}
                    </span>
                  </div>
                )}
              </div>

              <div className="auth-card__input-group">
                <label className="auth-card__label" htmlFor="password">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  className="auth-card__input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {/* Password Requirements - shown during registration while typing */}
                {showPasswordReqs && (
                  <div className="auth-card__password-reqs">
                    <span className="auth-card__password-reqs-title">
                      Requisitos de contraseña:
                    </span>
                    <ul className="auth-card__password-reqs-list">
                      {PASSWORD_REQUIREMENTS.map((req) => {
                        const met = req.test(password);
                        return (
                          <li
                            key={req.id}
                            className={`auth-card__password-req ${met ? "auth-card__password-req--met" : "auth-card__password-req--unmet"}`}
                          >
                            <span className="auth-card__password-req-icon">
                              {met ? <CheckIcon /> : <XIcon />}
                            </span>
                            {req.label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              {!isLogin && (
                <div className="auth-card__input-group">
                  <label className="auth-card__label" htmlFor="password_confirmation">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    id="password_confirmation"
                    required
                    className={`auth-card__input ${
                      passwordConfirmation.length > 0
                        ? passwordsMatch
                          ? "auth-card__input--valid"
                          : "auth-card__input--invalid"
                        : ""
                    }`}
                    placeholder="••••••••"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                  />
                  {passwordConfirmation.length > 0 && (
                    <div
                      className={`auth-card__match-indicator ${
                        passwordsMatch
                          ? "auth-card__match-indicator--match"
                          : "auth-card__match-indicator--no-match"
                      }`}
                    >
                      <span className="auth-card__match-icon">
                        {passwordsMatch ? <CheckIcon /> : <XIcon />}
                      </span>
                      {passwordsMatch
                        ? "Las contraseñas coinciden"
                        : "Las contraseñas no coinciden"}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="auth-card__submit"
                disabled={loading || (!isLogin && (!allPasswordReqsMet || !passwordsMatch))}
              >
                {loading ? "Procesando..." : isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
              </button>
            </form>

            <p className="auth-card__footer">
              {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
              <button
                onClick={toggleMode}
                className="auth-card__link"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                {isLogin ? "Regístrate aquí" : "Inicia sesión"}
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing__footer">
        <div className="landing__footer-container">
          <div className="landing__footer-brand">
            <span className="landing__logo-icon">
              <TerminalIcon />
            </span>
            <span>Codex</span>
          </div>
          <p className="landing__footer-text">
            La red social académica para el ecosistema de FP Informática en España
          </p>
        </div>
      </footer>

      {/* Teacher Verification Modal */}
      {showVerificationModal && (
        <TeacherVerificationModal
          email={email}
          loading={loading}
          onConfirm={handleVerificationConfirm}
          onCancel={handleVerificationCancel}
        />
      )}
    </div>
  );
}
