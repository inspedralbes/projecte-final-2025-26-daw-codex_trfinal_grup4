import React from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import "./BlockedScreen.css";

export default function BlockedScreen() {
    const { t } = useTranslation();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        // Remove token manually so the page reloads to the welcome screen
        window.location.href = "/welcome";
    };

    return (
        <div className="blocked-screen">
            <div className="blocked-screen__card">
                {/* Shield icon */}
                <div className="blocked-screen__icon">
                    <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>

                <h1 className="blocked-screen__title">
                    {t("blocked.title", "Acceso restringido")}
                </h1>
                <p className="blocked-screen__subtitle">
                    {t(
                        "blocked.subtitle",
                        "Tu cuenta ha sido bloqueada por un profesor o administrador del centro."
                    )}
                </p>
                <p className="blocked-screen__description">
                    {t(
                        "blocked.description",
                        "No puedes acceder al hub del centro ni interactuar con su contenido. Si crees que esto es un error, contacta con tu tutor o con el administrador del centro."
                    )}
                </p>

                <div className="blocked-screen__actions">
                    <button
                        className="blocked-screen__btn blocked-screen__btn--logout"
                        onClick={handleLogout}
                    >
                        {t("auth.logout", "Cerrar sesión")}
                    </button>
                </div>
            </div>
        </div>
    );
}
