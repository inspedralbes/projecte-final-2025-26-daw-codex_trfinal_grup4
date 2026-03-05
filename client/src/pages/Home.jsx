import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Feed from "@/components/feed/Feed";
import "./Home.css";

export default function Home() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [verificationMessage, setVerificationMessage] = useState(null);

  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "success") {
      setVerificationMessage(t("home.email_verified_success", "¡Email verificado correctamente! Ya puedes usar todas las funcionalidades."));
      // Remove query param from URL
      searchParams.delete("verified");
      setSearchParams(searchParams, { replace: true });
      // Auto-hide after 6 seconds
      setTimeout(() => setVerificationMessage(null), 6000);
    } else if (verified === "already") {
      setVerificationMessage(t("home.email_already_verified", "Tu email ya estaba verificado."));
      searchParams.delete("verified");
      setSearchParams(searchParams, { replace: true });
      setTimeout(() => setVerificationMessage(null), 4000);
    }
  }, [searchParams, setSearchParams, t]);

  return (
    <>
      {verificationMessage && (
        <div className="home__verification-banner">
          <span className="home__verification-icon">✓</span>
          {verificationMessage}
        </div>
      )}
      <Feed />
    </>
  );
}
