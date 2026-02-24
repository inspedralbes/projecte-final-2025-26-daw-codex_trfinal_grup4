import React from "react";
import { useTranslation } from "react-i18next";
import "./LanguageSwitcher.css";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: "es", label: "ES" },
    { code: "ca", label: "CA" },
    { code: "en", label: "EN" },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      {languages.map((lang) => (
        <button
          key={lang.code}
          className={`language-switcher__btn ${i18n.language.startsWith(lang.code) ? "language-switcher__btn--active" : ""}`}
          onClick={() => changeLanguage(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
