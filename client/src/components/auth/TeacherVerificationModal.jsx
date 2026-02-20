import React, { useState, useRef, useCallback } from "react";
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
      setFileError("Solo se aceptan archivos PDF, JPG o PNG.");
      return false;
    }
    if (f.size > MAX_FILE_SIZE) {
      setFileError("El archivo no puede superar los 5 MB.");
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
        <button className="tvm-close" onClick={onCancel} type="button" aria-label="Cerrar">
          <CloseIcon />
        </button>

        {/* Header */}
        <div className="tvm-header">
          <div className="tvm-header__icon">
            <ShieldCheckIcon />
          </div>
          <h2 className="tvm-header__title">Verificación de Profesor</h2>
          <p className="tvm-header__desc">
            El dominio <strong>{domain}</strong> no tiene un centro educativo registrado en Codex.
            Para crear el centro, necesitamos verificar tu identidad como docente.
          </p>
        </div>

        {/* Form */}
        <form className="tvm-form" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="tvm-field">
            <label className="tvm-label" htmlFor="tvm-fullname">
              Nombre Completo <span className="tvm-required">*</span>
            </label>
            <input
              type="text"
              id="tvm-fullname"
              className="tvm-input"
              placeholder="Ej: María García López"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Center Name */}
          <div className="tvm-field">
            <label className="tvm-label" htmlFor="tvm-center">
              Nombre del Centro Educativo <span className="tvm-required">*</span>
            </label>
            <input
              type="text"
              id="tvm-center"
              className="tvm-input"
              placeholder="Ej: IES Jaume I"
              value={centerName}
              onChange={(e) => setCenterName(e.target.value)}
              required
            />
          </div>

          {/* City */}
          <div className="tvm-field">
            <label className="tvm-label" htmlFor="tvm-city">
              Ciudad
            </label>
            <input
              type="text"
              id="tvm-city"
              className="tvm-input"
              placeholder="Ej: Barcelona"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          {/* File Upload */}
          <div className="tvm-field">
            <label className="tvm-label">
              Documento Justificante <span className="tvm-required">*</span>
            </label>
            <p className="tvm-hint">
              Sube un documento que acredite tu vinculación con el centro (carnet de docente,
              contrato, certificado, etc.)
            </p>

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
                  Arrastra tu archivo aquí o <strong>haz clic para seleccionar</strong>
                </span>
                <span className="tvm-dropzone__formats">PDF, JPG o PNG · máx. 5 MB</span>
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
              Cancelar
            </button>
            <button type="submit" className="tvm-btn tvm-btn--primary" disabled={!canSubmit}>
              {loading ? "Procesando..." : "Crear Cuenta y Solicitar Centro"}
            </button>
          </div>

          <p className="tvm-footer-note">
            Un administrador revisará tu solicitud. Una vez aprobada, se creará el centro y tu
            cuenta será promovida a profesor.
          </p>
        </form>
      </div>
    </div>
  );
}
