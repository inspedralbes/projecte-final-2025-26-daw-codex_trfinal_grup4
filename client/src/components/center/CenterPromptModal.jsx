import React from "react";
import { useTranslation } from "react-i18next";
import "./CenterPromptModal.css";

const SchoolIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M12 7v6" />
    <path d="M9 10h6" />
  </svg>
);

const CloseIcon = () => (
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
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/**
 * CenterPromptModal – Shown after login when the user has a non-generic email
 * and is not assigned to any center.
 *
 * Props:
 * - domain: string – The user's email domain (e.g. "inspedralbes.cat")
 * - onCreateCenter: () => void – User wants to create a center (opens TeacherVerificationModal)
 * - onDismiss: () => void – User dismisses (can do it later from "Mi Centro")
 */
export default function CenterPromptModal({ domain, onCreateCenter, onDismiss }) {
  const { t } = useTranslation();

  return (
    <div className="cpm-overlay" onClick={onDismiss}>
      <div className="cpm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cpm-close" onClick={onDismiss} aria-label="Close">
          <CloseIcon />
        </button>

        <div className="cpm-icon">
          <SchoolIcon />
        </div>

        <h2 className="cpm-title">{t("center_prompt.title")}</h2>

        <div className="cpm-domain">@{domain}</div>

        <p className="cpm-description">{t("center_prompt.description")}</p>

        <div className="cpm-actions">
          <button className="cpm-btn-primary" onClick={onCreateCenter}>
            🏫 {t("center_prompt.create_center")}
          </button>
          <button className="cpm-btn-secondary" onClick={onDismiss}>
            {t("center_prompt.not_now")}
          </button>
        </div>

        <p className="cpm-note">{t("center_prompt.note")}</p>
      </div>
    </div>
  );
}
