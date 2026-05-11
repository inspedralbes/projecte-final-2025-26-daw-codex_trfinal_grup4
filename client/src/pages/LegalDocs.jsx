import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import SymbolSea from "@/components/ui/SymbolSea";
import GlitchText from "@/components/ui/GlitchText";
import { useTheme } from "@/context/ThemeContext";
import { Helmet } from "react-helmet-async";
import "./Landing.css"; // We reuse the brutalist design from Landing
import "./LegalDocs.css"; // Specific layout tweaks for long text

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

export default function LegalDocs() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialTab = searchParams.get("tab") || "terms";
  const [activeTab, setActiveTab] = useState(initialTab);

  const isLightMode = theme === "light";
  const toggleTheme = () => setTheme(isLightMode ? "dark" : "light");

  useEffect(() => {
    document.body.classList.add("landing-active");
    return () => document.body.classList.remove("landing-active");
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className={`landing ${isLightMode ? "landing--light" : ""}`}>
      <Helmet>
        <title>Codex | {t("legal.title")}</title>
      </Helmet>

      <SymbolSea isLightMode={isLightMode} className="landing__symbol-sea" />
      <div className="landing__scanline" />

      <div className="landing__top-bar">
        <LanguageSwitcher />
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {isLightMode ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>

      <div className="landing__watermark">c0dex // legal</div>
      <div className="landing__watermark-right">sys.legal.module</div>

      <main className="legal__hero">
        <div className="legal__card-wrapper">
          <div className="auth-card legal__card">
            <div className="auth-card__header">
              <h2 className="auth-card__title">
                <GlitchText>{t("legal.title")}</GlitchText>
              </h2>
            </div>

            <div className="legal__tabs">
              <button 
                className={`legal__tab ${activeTab === 'terms' ? 'active' : ''}`}
                onClick={() => handleTabChange('terms')}
              >
                <GlitchText>{t("legal.terms")}</GlitchText>
              </button>
              <button 
                className={`legal__tab ${activeTab === 'privacy' ? 'active' : ''}`}
                onClick={() => handleTabChange('privacy')}
              >
                <GlitchText>{t("legal.privacy")}</GlitchText>
              </button>
              <button 
                className={`legal__tab ${activeTab === 'cookies' ? 'active' : ''}`}
                onClick={() => handleTabChange('cookies')}
              >
                <GlitchText>{t("legal.cookies")}</GlitchText>
              </button>
            </div>

            <div className="legal__content">
              {activeTab === 'terms' && (
                <div className="legal__section">
                  <h3>{t("legal.terms")}</h3>
                  <p>{t("legal.terms_content")}</p>
                </div>
              )}
              {activeTab === 'privacy' && (
                <div className="legal__section">
                  <h3>{t("legal.privacy")}</h3>
                  <p>{t("legal.privacy_content")}</p>
                </div>
              )}
              {activeTab === 'cookies' && (
                <div className="legal__section">
                  <h3>{t("legal.cookies")}</h3>
                  <p>{t("legal.cookies_content")}</p>
                </div>
              )}
            </div>

            <div className="auth-card__divider"></div>
            
            <p className="auth-card__footer">
              <Link to="/welcome" className="auth-card__link">
                <GlitchText>{"< VOLVER_AL_INICIO"}</GlitchText>
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
