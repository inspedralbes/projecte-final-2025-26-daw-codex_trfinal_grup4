import React, { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import "./TeacherVerificationModal.css";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Icons
const UploadIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const FileIcon = () => (
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
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
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

const ShieldCheckIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function TeacherVerificationModal({ onConfirm, onCancel, loading, email }) {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [centerName, setCenterName] = useState("");
  const [city, setCity] = useState("");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const domain = email ? email.split("@")[1] : "";

  const validateFile = useCallback((f) => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setFileError(t("teacher_modal.errors.invalid_type"));
      return false;
    }
    if (f.size > MAX_FILE_SIZE) {
      setFileError(t("teacher_modal.errors.file_too_large"));
      return false;
    }
    setFileError("");
    return true;
  }, []);

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (f && validateFile(f)) {
      setFile(f);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && validateFile(f)) {
      setFile(f);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeFile = () => {
    setFile(null);
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canSubmit = fullName.trim() && centerName.trim() && file && !loading;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    onConfirm({
      full_name: fullName.trim(),
      center_name: centerName.trim(),
      domain,
      city: city.trim() || undefined,
      justificante: file,
    });
  };

  return (
    <div className="tvm-overlay" onClick={onCancel}>
      <div className="tvm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          className="tvm-close"
          onClick={onCancel}
          type="button"
          aria-label={t("common.close")}
        >
          <CloseIcon />
        </button>

        {/* Header */}
        <div className="tvm-header">
          <div className="tvm-header__icon">
            <ShieldCheckIcon />
          </div>
          <h2 className="tvm-header__title">{t("teacher_modal.title")}</h2>
          <p className="tvm-header__desc">
            {t("teacher_modal.desc_intro")} <strong>{domain}</strong> {t("teacher_modal.desc_body")}
          </p>
        </div>

        {/* Form */}
        <form className="tvm-form" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="tvm-field">
            <label className="tvm-label" htmlFor="tvm-fullname">
              {t("landing.full_name")} <span className="tvm-required">*</span>
            </label>
            <input
              type="text"
              id="tvm-fullname"
              className="tvm-input"
              placeholder={t("teacher_modal.placeholders.fullname")}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Center Name */}
          <div className="tvm-field">
            <label className="tvm-label" htmlFor="tvm-center">
              {t("teacher_modal.center_name")} <span className="tvm-required">*</span>
            </label>
            <input
              type="text"
              id="tvm-center"
              className="tvm-input"
              placeholder={t("teacher_modal.placeholders.center")}
              value={centerName}
              onChange={(e) => setCenterName(e.target.value)}
              required
            />
          </div>

          {/* City */}
          <div className="tvm-field">
            <label className="tvm-label" htmlFor="tvm-city">
              {t("teacher_modal.city")}
            </label>
            <input
              type="text"
              id="tvm-city"
              className="tvm-input"
              placeholder={t("teacher_modal.placeholders.city")}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          {/* File Upload */}
          <div className="tvm-field">
            <label className="tvm-label">
              {t("teacher_modal.document_title")} <span className="tvm-required">*</span>
            </label>
            <p className="tvm-hint">{t("teacher_modal.document_hint")}</p>

            {!file ? (
              <div
                className={`tvm-dropzone ${isDragging ? "tvm-dropzone--active" : ""}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon />
                <span className="tvm-dropzone__text">
                  {t("teacher_modal.dropzone.text")}{" "}
                  <strong>{t("teacher_modal.dropzone.cta")}</strong>
                </span>
                <span className="tvm-dropzone__formats">{t("teacher_modal.dropzone.formats")}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="tvm-file-input"
                />
              </div>
            ) : (
              <div className="tvm-file-preview">
                <div className="tvm-file-preview__info">
                  <FileIcon />
                  <div>
                    <span className="tvm-file-preview__name">{file.name}</span>
                    <span className="tvm-file-preview__size">{formatFileSize(file.size)}</span>
                  </div>
                </div>
                <button type="button" className="tvm-file-preview__remove" onClick={removeFile}>
                  <CloseIcon />
                </button>
              </div>
            )}

            {fileError && <p className="tvm-error">{fileError}</p>}
          </div>

          {/* Actions */}
          <div className="tvm-actions">
            <button
              type="button"
              className="tvm-btn tvm-btn--secondary"
              onClick={onCancel}
              disabled={loading}
            >
              {t("common.cancel")}
            </button>
            <button type="submit" className="tvm-btn tvm-btn--primary" disabled={!canSubmit}>
              {loading ? t("common.processing") : t("teacher_modal.submit")}
            </button>
          </div>

          <p className="tvm-footer-note">{t("teacher_modal.footer_note")}</p>
        </form>
      </div>
    </div>
  );
}
