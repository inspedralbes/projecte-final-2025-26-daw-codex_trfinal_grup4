import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PASSWORD_REQUIREMENTS } from "@/context/AuthContext";
import api from "@/services/api";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import "./ResetPassword.css";

// Check/X icons
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

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  // Check if we have the required params
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
      // Redirect to login after 3 seconds
      setTimeout(() => navigate("/welcome"), 3000);
    } catch (err) {
      setError(err.message || t("reset_password.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password">
      <div className="reset-password__container">
        <div className="reset-password__header">
          <Link to="/welcome" className="reset-password__logo">
            <span className="reset-password__logo-icon">{"</>"}</span>
            <span className="reset-password__logo-text">Codex</span>
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="reset-password__card">
          <h1 className="reset-password__title">
            {t("reset_password.title")}
          </h1>

          {success ? (
            <div className="reset-password__success">
              <div className="reset-password__success-icon">✅</div>
              <p className="reset-password__success-text">
                {t("reset_password.success_message")}
              </p>
              <p className="reset-password__redirect-text">
                {t("landing.messages.redirecting")}
              </p>
            </div>
          ) : !token || !email ? (
            <div className="reset-password__error-state">
              <div className="reset-password__error-icon">⚠️</div>
              <p>{t("reset_password.invalid_link")}</p>
              <Link to="/forgot-password" className="reset-password__link">
                {t("reset_password.request_new_link")}
              </Link>
            </div>
          ) : (
            <>
              <p className="reset-password__description">
                {t("reset_password.description")}
              </p>

              {error && (
                <div className="reset-password__error">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="reset-password__form">
                <div className="reset-password__input-group">
                  <label className="reset-password__label" htmlFor="password">
                    {t("reset_password.new_password")}
                  </label>
                  <input
                    type="password"
                    id="password"
                    required
                    className="reset-password__input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />

                  {/* Password Requirements */}
                  {password.length > 0 && (
                    <div className="reset-password__reqs">
                      <span className="reset-password__reqs-title">
                        {t("auth.password_requirements.title")}:
                      </span>
                      <ul className="reset-password__reqs-list">
                        {PASSWORD_REQUIREMENTS.map((req) => {
                          const met = req.test(password);
                          return (
                            <li
                              key={req.id}
                              className={`reset-password__req ${met ? "reset-password__req--met" : "reset-password__req--unmet"}`}
                            >
                              <span className="reset-password__req-icon">
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

                <div className="reset-password__input-group">
                  <label className="reset-password__label" htmlFor="password_confirmation">
                    {t("landing.confirm_password")}
                  </label>
                  <input
                    type="password"
                    id="password_confirmation"
                    required
                    className={`reset-password__input ${
                      passwordConfirmation.length > 0
                        ? passwordsMatch
                          ? "reset-password__input--valid"
                          : "reset-password__input--invalid"
                        : ""
                    }`}
                    placeholder="••••••••"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                  />
                  {passwordConfirmation.length > 0 && (
                    <div
                      className={`reset-password__match ${
                        passwordsMatch
                          ? "reset-password__match--ok"
                          : "reset-password__match--no"
                      }`}
                    >
                      <span className="reset-password__match-icon">
                        {passwordsMatch ? <CheckIcon /> : <XIcon />}
                      </span>
                      {passwordsMatch
                        ? t("landing.messages.passwords_match")
                        : t("landing.messages.passwords_dont_match")}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="reset-password__submit"
                  disabled={loading || !allPasswordReqsMet || !passwordsMatch}
                >
                  {loading ? (
                    <div className="reset-password__spinner" />
                  ) : (
                    t("reset_password.reset_button")
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
