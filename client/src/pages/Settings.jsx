import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import profileService from "@/services/profileService";
import "./Settings.css";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  
  const [theme, setTheme] = useState(localStorage.getItem("codex-theme") || "dark");
  const [isPrivate, setIsPrivate] = useState(user?.is_private || false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  
  // Track initial state to detect changes
  const [initialPrivate, setInitialPrivate] = useState(user?.is_private || false);

  useEffect(() => {
    if (user) {
      const privateVal = !!user.is_private;
      setIsPrivate(privateVal);
      setInitialPrivate(privateVal);
    }
  }, [user]);

  const hasChanges = isPrivate !== initialPrivate;

  // Sync theme with body
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("codex-theme", theme);
  }, [theme]);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSaveStatus(null);
    try {
      await profileService.updateProfile({ is_private: isPrivate });
      setInitialPrivate(isPrivate); // Update initial state after success
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <header className="settings-page__header">
        <h1 className="settings-page__title">{t("settings.title", "Ajustes")}</h1>
        <p className="settings-page__subtitle">{t("settings.description", "Personaliza tu experiencia.")}</p>
      </header>

      <div className="settings-page__content">
        {/* Language Settings */}
        <section className="settings-section">
          <h2 className="settings-section__title">{t("settings.language", "Idioma")}</h2>
          <div className="settings-group">
            <button 
              className={`settings-btn ${i18n.language === 'es' ? 'settings-btn--active' : ''}`}
              onClick={() => handleLanguageChange('es')}
            >
              Español
            </button>
            <button 
              className={`settings-btn ${i18n.language === 'en' ? 'settings-btn--active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              English
            </button>
            <button 
              className={`settings-btn ${i18n.language === 'ca' ? 'settings-btn--active' : ''}`}
              onClick={() => handleLanguageChange('ca')}
            >
              Català
            </button>
          </div>
        </section>

        {/* Theme Settings */}
        <section className="settings-section">
          <h2 className="settings-section__title">{t("settings.theme", "Apariencia")}</h2>
          <div className="settings-group">
            <button 
              className={`settings-btn ${theme === 'dark' ? 'settings-btn--active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              {t("settings.dark_mode", "Modo Oscuro")}
            </button>
            <button 
              className={`settings-btn ${theme === 'light' ? 'settings-btn--active' : ''}`}
              onClick={() => setTheme('light')}
            >
              {t("settings.light_mode", "Modo Claro")}
            </button>
          </div>
        </section>

        {/* Privacy Settings */}
        <section className="settings-section">
          <h2 className="settings-section__title">{t("settings.privacy", "Privacidad")}</h2>
          <div className="settings-toggle-group">
            <div className="settings-toggle-item">
              <div className="settings-toggle-info">
                <strong>{t("settings.private_profile", "Perfil privado")}</strong>
                <span>{t("settings.private_profile_desc", "Solo tus seguidores pueden ver tu actividad")}</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </section>

        {/* Account Settings */}
        <section className="settings-section settings-section--danger">
          <h2 className="settings-section__title">{t("settings.account", "Cuenta")}</h2>
          
          <div className="settings-toggle-item">
            <div className="settings-toggle-info">
              <strong>{t("settings.email_notifications", "Notificaciones por email")}</strong>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="settings-action-item">
            <div className="settings-toggle-info">
              <strong>{t("settings.delete_account", "Eliminar cuenta")}</strong>
              <span>{t("settings.delete_account_desc", "Esta acción es irreversible.")}</span>
            </div>
            <button className="settings-btn settings-btn--danger">{t("settings.delete_account", "Eliminar cuenta")}</button>
          </div>
        </section>
        
        {/* Save Button */}
        <div className="settings-page__actions">
          <button 
            className={`settings-btn settings-btn--save ${!hasChanges && !isLoading && !saveStatus ? 'settings-btn--disabled' : ''} ${saveStatus === 'success' ? 'settings-btn--success' : ''}`}
            onClick={handleSave}
            disabled={(!hasChanges && !saveStatus) || isLoading}
          >
            {isLoading 
              ? t("settings.saving", "Guardando...") 
              : saveStatus === 'success' 
                ? t("settings.saved", "¡Datos guardados!") 
                : !hasChanges 
                  ? t("settings.no_changes", "Sin cambios")
                  : t("settings.save", "Guardar cambios")
            }
          </button>
        </div>
      </div>
    </div>
  );
}
