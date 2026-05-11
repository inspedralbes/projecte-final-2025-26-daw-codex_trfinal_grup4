import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PASSWORD_REQUIREMENTS } from "@/context/AuthContext";
import api from "@/services/api";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import SymbolSea from "@/components/ui/SymbolSea";
import GlitchText from "@/components/ui/GlitchText";
import { useTheme } from "@/context/ThemeContext";
import { Helmet } from "react-helmet-async";
import "./Landing.css"; // We reuse the brutalist design from Landing

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, setTheme } = useTheme();

  const isLightMode = theme === "light";
  const toggleTheme = () => setTheme(isLightMode ? "dark" : "light");

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Password validation
  const allPasswordReqsMet = PASSWORD_REQUIREMENTS.every((req) => req.test(password));
  const passwordsMatch = password === passwordConfirmation && passwordConfirmation.length > 0;

  useEffect(() => {
    document.body.classList.add("landing-active");
    return () => document.body.classList.remove("landing-active");
  }, []);

  useEffect(() => {
    if (!token || !email) {
      setError(t("reset_password.invalid_link"));
    }
  }, [token, email, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!allPasswordReqsMet) {
      setError(t("landing.errors.password_requirements"));
      return;
    }
    
    if (!passwordsMatch) {
      setError(t("landing.errors.passwords_dont_match"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/password/reset", {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
      setTimeout(() => navigate("/welcome"), 3000);
    } catch (err) {
      setError(err.message || t("reset_password.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`landing ${isLightMode ? "landing--light" : ""} ${error ? "landing--error" : ""}`}>
      <Helmet>
        <title>Codex | {t("reset_password.title")}</title>
      </Helmet>

      <SymbolSea errorTrigger={error ? 1 : 0} isLightMode={isLightMode} className="landing__symbol-sea" />
      <div className="landing__scanline" />

      <div className="landing__top-bar">
        <LanguageSwitcher />
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {isLightMode ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>

      <div className="landing__watermark">c0dex // v1.0</div>
      <div className="landing__watermark-right">sys.auth.module</div>

      <main className="landing__hero">
        <div className="landing__auth-card">
          <div className="auth-card">
            <div className="auth-card__header">
              <h2 className="auth-card__title">
                <GlitchText>{t("reset_password.title")}</GlitchText>
              </h2>
              <p className="auth-card__subtitle">
                <GlitchText>{t("reset_password.description")}</GlitchText>
              </p>
            </div>

            {success ? (
              <div className="auth-card__message auth-card__message--success">
                <GlitchText>{t("reset_password.success_message")}</GlitchText>
                <br />
                <GlitchText>{t("landing.messages.redirecting")}</GlitchText>
              </div>
            ) : !token || !email ? (
              <>
                <div className="auth-card__message auth-card__message--error">
                  {t("reset_password.invalid_link")}
                </div>
                <p className="auth-card__footer">
                  <Link to="/forgot-password" className="auth-card__link">
                    <GlitchText>{t("reset_password.request_new_link")}</GlitchText>
                  </Link>
                </p>
              </>
            ) : (
              <>
                {error && <div className="auth-card__message auth-card__message--error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-card__form">
                  <div className="auth-card__input-group">
                    <label className="auth-card__label" htmlFor="password">
                      <GlitchText>{t("reset_password.new_password")}</GlitchText>
                    </label>
                    <input
                      type="password"
                      id="password"
                      required
                      className="auth-card__input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoFocus
                    />

                    {/* Password Requirements */}
                    {password.length > 0 && (
                      <div className="auth-card__password-reqs">
                        <span className="auth-card__password-reqs-title">
                          <GlitchText>{t("auth.password_requirements.title")}</GlitchText>:
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
                                <GlitchText>{t(`auth.password_requirements.${req.id}`)}</GlitchText>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="auth-card__input-group">
                    <label className="auth-card__label" htmlFor="password_confirmation">
                      <GlitchText>{t("landing.confirm_password")}</GlitchText>
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
                        <GlitchText>
                          {passwordsMatch
                            ? t("landing.messages.passwords_match")
                            : t("landing.messages.passwords_dont_match")}
                        </GlitchText>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="auth-card__submit"
                    disabled={loading || !allPasswordReqsMet || !passwordsMatch}
                  >
                    <GlitchText>
                      {loading ? "" : t("reset_password.reset_button")}
                    </GlitchText>
                    {loading && <div className="auth-card__spinner" />}
                  </button>
                </form>
              </>
            )}

            <div className="auth-card__divider"></div>
            
            <p className="auth-card__footer">
              <Link to="/welcome" className="auth-card__link">
                <GlitchText>{t("forgot_password.back_to_login")}</GlitchText>
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
