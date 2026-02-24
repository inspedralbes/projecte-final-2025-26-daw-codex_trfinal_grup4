import React from "react";
import { useTranslation } from "react-i18next";

export default function More() {
  const { t } = useTranslation();
  return (
    <div style={{ padding: "16px", color: "var(--color-text)" }}>
      <h2>{t("sidebar.more")}</h2>
      <p style={{ color: "var(--color-text-secondary)" }}>{t("more.description")}</p>
    </div>
  );
}
