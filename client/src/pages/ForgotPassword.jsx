import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/services/api";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/password/forgot", { email });
      setSuccess(true);
    } catch (err) {
      // API always returns success to prevent email enumeration
      // but we handle errors just in case
      setError(err.message || t("common.error_generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password">
      <div className="forgot-password__container">
        <div className="forgot-password__header">
          <Link to="/welcome" className="forgot-password__logo">
            <span className="forgot-password__logo-icon">{"</>"}</span>
            <span className="forgot-password__logo-text">Codex</span>
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="forgot-password__card">
          <h1 className="forgot-password__title">
            {t("forgot_password.title")}
          </h1>
          
          {success ? (
            <div className="forgot-password__success">
              <div className="forgot-password__success-icon">✉️</div>
              <p className="forgot-password__success-text">
                {t("forgot_password.success_message")}
              </p>
              <Link to="/welcome" className="forgot-password__back-link">
                {t("forgot_password.back_to_login")}
              </Link>
            </div>
          ) : (
            <>
              <p className="forgot-password__description">
                {t("forgot_password.description")}
              </p>

              {error && (
                <div className="forgot-password__error">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="forgot-password__form">
                <div className="forgot-password__input-group">
                  <label className="forgot-password__label" htmlFor="email">
                    {t("landing.email")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="forgot-password__input"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="forgot-password__submit"
                  disabled={loading || !email}
                >
                  {loading ? (
                    <div className="forgot-password__spinner" />
                  ) : (
                    t("forgot_password.send_link")
                  )}
                </button>
              </form>

              <Link to="/welcome" className="forgot-password__back-link">
                {t("forgot_password.back_to_login")}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
