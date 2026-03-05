import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { PASSWORD_REQUIREMENTS } from "@/context/AuthContext";
import api from "@/services/api";
import TeacherVerificationModal from "@/components/auth/TeacherVerificationModal";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
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
  const { t } = useTranslation();
  const { login, register, registerWithCenterRequest, checkDomain, authMessage, clearAuthMessage } =
    useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Handle error from verification redirect
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "invalid_link") {
      setError(t("landing.errors.invalid_verification_link", "El enlace de verificación es inválido o ha expirado."));
      searchParams.delete("error");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, t]);

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
          setSuccessMsg(t("auth.login_success"));
          setTimeout(() => navigate("/"), 800);
        } else {
          setError(result.message);
        }
      } else {
        // REGISTER - Client-side validations
        if (!allPasswordReqsMet) {
          setError(t("landing.errors.password_requirements"));
          setLoading(false);
          return;
        }

        if (password !== passwordConfirmation) {
          setError(t("landing.errors.passwords_dont_match"));
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
          setSuccessMsg(t("auth.register_success"));
          setTimeout(() => navigate("/"), 800);
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError(t("common.error_generic"));
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
      setSuccessMsg(t("landing.messages.check_review"));
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

  // ── Google OAuth ──
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const res = await api.get("/auth/google/redirect");
      const url = res.data?.url || res.url;
      if (url) {
        window.location.href = url;
      } else {
        setError(t("landing.errors.google_failed"));
      }
    } catch (err) {
      console.error("Google redirect error", err);
      setError(t("landing.errors.google_failed"));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="landing">
      {/* Ambient background effects */}
      <div className="landing__ambient">
        <div className="landing__gradient landing__gradient--teal" />
        <div className="landing__gradient landing__gradient--violet" />
        <div className="landing__grid" />
      </div>

      {/* Language selector – top right */}
      <div className="landing__top-bar">
        <LanguageSwitcher />
      </div>

      {/* Hero Section */}
      <main className="landing__hero">
        <div className="landing__hero-content">
          {/* Badge */}
          <div className="landing__badge animate-slideDown">
            <span className="landing__badge-dot" />
            {t("landing.badge")}
          </div>

          {/* Headline */}
          <h1 className="landing__title animate-slideUp">
            {t("landing.hero_title_part1")}{" "}
            <span className="landing__title-accent">{t("landing.hero_title_accent")}</span>{" "}
            {t("landing.hero_title_part2")}
          </h1>

          {/* Subheadline */}
          <p className="landing__subtitle animate-slideUp stagger-1">
            {t("landing.hero_subtitle")}
          </p>

          {/* Features Grid */}
          <div className="landing__features animate-slideUp stagger-2">
            <div className="landing__feature">
              <div className="landing__feature-icon">
                <CodeIcon />
              </div>
              <div className="landing__feature-text">
                <span className="landing__feature-title">
                  {t("landing.features.snippets.title")}
                </span>
                <span className="landing__feature-desc">{t("landing.features.snippets.desc")}</span>
              </div>
            </div>
            <div className="landing__feature">
              <div className="landing__feature-icon landing__feature-icon--violet">
                <UsersIcon />
              </div>
              <div className="landing__feature-text">
                <span className="landing__feature-title">{t("landing.features.hub.title")}</span>
                <span className="landing__feature-desc">{t("landing.features.hub.desc")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="landing__auth-card animate-slideUp stagger-3">
          <div className="auth-card">
            <div className="auth-card__header">
              <h2 className="auth-card__title">
                {isLogin ? t("landing.auth_title_login") : t("landing.auth_title_register")}
              </h2>
              <p className="auth-card__subtitle">
                {isLogin ? t("landing.auth_subtitle_login") : t("landing.auth_subtitle_register")}
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
                    {t("landing.full_name")}
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
                  {t("landing.email")}
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
                    <span>{t("landing.messages.checking_domain")}</span>
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
                        ? `${domainInfo.center_name || t("landing.center")} ${t("landing.messages.center_detected")}`
                        : domainInfo.is_pending
                          ? t("landing.messages.center_pending")
                          : domainInfo.can_request
                            ? t("landing.messages.verification_required")
                            : t("landing.messages.domain_not_recognized")}
                    </span>
                  </div>
                )}
              </div>

              <div className="auth-card__input-group">
                <label className="auth-card__label" htmlFor="password">
                  {t("landing.password")}
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
                      {t("auth.password_requirements.title")}:
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
                            {t(`auth.password_requirements.${req.id}`)}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              {/* Forgot password link - only in login mode */}
              {isLogin && (
                <div className="auth-card__forgot-password">
                  <Link to="/forgot-password">{t("landing.forgot_password_link")}</Link>
                </div>
              )}

              {!isLogin && (
                <div className="auth-card__input-group">
                  <label className="auth-card__label" htmlFor="password_confirmation">
                    {t("landing.confirm_password")}
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
                        ? t("landing.messages.passwords_match")
                        : t("landing.messages.passwords_dont_match")}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="auth-card__submit"
                disabled={loading || (!isLogin && (!allPasswordReqsMet || !passwordsMatch))}
              >
                {loading ? (
                  <div className="auth-card__spinner" />
                ) : isLogin ? (
                  t("landing.login")
                ) : (
                  t("landing.register")
                )}
              </button>
            </form>

            {/* Google OAuth divider + button */}
            <div className="auth-card__divider">
              {t("landing.or_continue_with")}
            </div>

            <button
              type="button"
              className="auth-card__google-btn"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <div className="auth-card__spinner" />
              ) : (
                <>
                  <svg className="auth-card__google-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {t("landing.google_login")}
                </>
              )}
            </button>

            <p className="auth-card__footer">
              {isLogin ? t("landing.no_account") : t("landing.already_account")}
              <button
                onClick={toggleMode}
                className="auth-card__link"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                {isLogin ? t("landing.register_here") : t("landing.login")}
              </button>
            </p>
          </div>
        </div>
      </main>



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
