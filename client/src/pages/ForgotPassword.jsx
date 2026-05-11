import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/services/api";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import SymbolSea from "@/components/ui/SymbolSea";
import GlitchText from "@/components/ui/GlitchText";
import { useTheme } from "@/context/ThemeContext";
import { Helmet } from "react-helmet-async";
import "./Landing.css"; // We reuse the brutalist design from Landing

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

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { theme, setTheme } = useTheme();

  const isLightMode = theme === "light";
  const toggleTheme = () => setTheme(isLightMode ? "dark" : "light");

  useEffect(() => {
    document.body.classList.add("landing-active");
    return () => document.body.classList.remove("landing-active");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/password/forgot", { email });
      setSuccess(true);
    } catch (err) {
      setError(err.message || t("common.error_generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`landing ${isLightMode ? "landing--light" : ""} ${error ? "landing--error" : ""}`}>
      <Helmet>
        <title>Codex | {t("forgot_password.title")}</title>
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
                <GlitchText>{t("forgot_password.title")}</GlitchText>
              </h2>
              <p className="auth-card__subtitle">
                <GlitchText>{t("forgot_password.description")}</GlitchText>
              </p>
            </div>

            {success ? (
              <div className="auth-card__message auth-card__message--success">
                {t("forgot_password.success_message")}
              </div>
            ) : (
              <>
                {error && <div className="auth-card__message auth-card__message--error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-card__form">
                  <div className="auth-card__input-group">
                    <label className="auth-card__label" htmlFor="email">
                      <GlitchText>{t("landing.email")}</GlitchText>
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      className="auth-card__input"
                      placeholder="user@domain.dev"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    className="auth-card__submit"
                    disabled={loading || !email}
                  >
                    <GlitchText>
                      {loading ? "" : t("forgot_password.send_link")}
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
