import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import "./PostInput.css";

const CodeIcon = () => (
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
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const ImageIcon = () => (
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
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const LinkIcon = () => (
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
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const QuestionIcon = () => (
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
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const GlobeIcon = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const CenterIcon = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function PostInput({ onSubmit, forceQuestion = false, initialMode = "text" }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [showCodeEditor, setShowCodeEditor] = useState(initialMode === "code");
  const [code, setCode] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [isQuestion, setIsQuestion] = useState(forceQuestion || initialMode === "question");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [visibility, setVisibility] = useState("global");
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
  const [serverSanction, setServerSanction] = useState(null);
  const imageInputRef = React.useRef(null);
  const textareaRef = React.useRef(null);
  const visibilityRef = React.useRef(null);

  const hasCenterAccess = !!user?.center_id;

  // ── Ban / Timeout check ───────────────────────────────────────
  const effectiveBanStatus = serverSanction?.ban_status || user?.ban_status;
  const effectiveBanReason = serverSanction?.ban_reason || user?.ban_reason;
  const effectiveBanExpiresAt = serverSanction?.ban_expires_at || user?.ban_expires_at;
  const isBanned = effectiveBanStatus === "banned";
  const isTimeout = effectiveBanStatus === "timeout";
  const isSanctioned = isBanned || isTimeout || user?.is_blocked;

  const formatBanExpiry = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleString("es-ES", {
      weekday: "long", day: "numeric", month: "long",
      year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };


  // Sync isQuestion with forceQuestion prop when tab changes
  useEffect(() => {
    setIsQuestion(forceQuestion || initialMode === "question");
  }, [forceQuestion, initialMode]);

  // Auto-open image dialog if mode is image
  useEffect(() => {
    if (initialMode === "image" && imageInputRef.current) {
      setTimeout(() => imageInputRef.current?.click(), 100);
    }
  }, [initialMode]);

  // Close visibility dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (visibilityRef.current && !visibilityRef.current.contains(e.target)) {
        setShowVisibilityDropdown(false);
      }
    };
    if (showVisibilityDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showVisibilityDropdown]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!content.trim() && !code.trim()) return;
      if (submitting) return;

      setSubmitting(true);
      setError(null);

      try {
        // Parse tags from input (comma or space separated)
        let parsedTags = tags
          .split(/[,\s]+/)
          .map((t) => t.replace(/^#/, "").trim())
          .filter((t) => t.length > 0)
          .slice(0, 5);

        // Auto-add "dubtes-recents" tag for questions if not already present
        if (isQuestion && !parsedTags.some(tag => tag.toLowerCase() === "dubtes-recents")) {
          parsedTags = ["dubtes-recents", ...parsedTags].slice(0, 5);
        }

        const postData = {
          content: content.trim() || null,
          code_snippet: code.trim() || null,
          code_language: code.trim() ? codeLanguage : null,
          type: isQuestion ? "question" : "news",
          tags: parsedTags.length > 0 ? parsedTags : undefined,
          visibility: hasCenterAccess ? visibility : "global",
        };

        // If image file exists, use FormData
        if (imageFile) {
          const formData = new FormData();
          Object.entries(postData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              if (Array.isArray(value)) {
                value.forEach((v, i) => formData.append(`${key}[${i}]`, v));
              } else {
                formData.append(key, value);
              }
            }
          });
          formData.append('image', imageFile);
          postData._formData = formData;
        }

        if (onSubmit) {
          const result = await onSubmit(postData);
          if (result.success) {
            // Reset form
            setContent("");
            setCode("");
            setTags("");
            setShowCodeEditor(false);
            setIsQuestion(false);
            setImagePreview(null);
            setImageFile(null);
            setShowLinkInput(false);
            setLinkUrl("");
            setVisibility("global");
            setServerSanction(null);
          } else {
            if (result.sanctioned) {
              setServerSanction({
                ban_status: result?.enforcement?.ban_status || "timeout",
                ban_reason: result?.ban_reason || result?.error || "Contenido bloqueado por moderacion.",
                ban_expires_at: result?.ban_expires_at || null,
              });
            }
            setError(result.error || t("auth.register_error_fallback"));
          }
        }
      } catch (err) {
        console.error("Error submitting post:", err);
        setError(err.message || t("auth.register_error_fallback"));
      } finally {
        setSubmitting(false);
      }
    },
    [content, code, codeLanguage, isQuestion, tags, submitting, onSubmit, imageFile, visibility, hasCenterAccess],
  );

  const avatarUrl =
    user?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || "developer"}`;

  // Show ban / timeout notice instead of the form
  if (isSanctioned) {
    return (
      <div className="post-input post-input--sanctioned">
        <div className="post-input__avatar">
          <img src={avatarUrl} alt={t("common.user")} />
        </div>
        <div className="post-input__ban-notice">
          <div className="post-input__ban-icon">
            {isBanned ? "🚫" : "⏱"}
          </div>
          <div className="post-input__ban-text">
            <strong>
              {isBanned
                ? "Tu cuenta ha sido baneada"
                : "Tu cuenta está en timeout"}
            </strong>
            {effectiveBanReason && (
              <p className="post-input__ban-reason">
                Motivo: {effectiveBanReason}
              </p>
            )}
            {effectiveBanExpiresAt && (
              <p className="post-input__ban-expiry">
                Tu timeout acabará el{" "}
                <strong>{formatBanExpiry(effectiveBanExpiresAt)}</strong>
              </p>
            )}
            {isBanned && !effectiveBanExpiresAt && (
              <p className="post-input__ban-expiry">Este baneo es permanente.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="post-input">
      <div className="post-input__avatar">
        <img src={avatarUrl} alt={t("common.user")} />
      </div>
      <form className="post-input__form" onSubmit={handleSubmit}>
        {error && <div className="post-input__error">{error}</div>}

        <textarea
          ref={textareaRef}
          className="post-input__textarea"
          placeholder={isQuestion ? t("feed.placeholder_question") : t("feed.placeholder_news")}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={content.length > 100 ? 4 : 2}
        />

        {showCodeEditor && (
          <div className="post-input__code-editor">
            <div className="post-input__code-header">
              <span className="post-input__code-dots">
                <span />
                <span />
                <span />
              </span>
              <select
                className="post-input__code-lang"
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="php">PHP</option>
                <option value="bash">Bash</option>
                <option value="sql">SQL</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="typescript">TypeScript</option>
                <option value="csharp">C#</option>
                <option value="plaintext">Plain Text</option>
              </select>
              <button
                type="button"
                className="post-input__code-close"
                onClick={() => setShowCodeEditor(false)}
              >
                ×
              </button>
            </div>
            <textarea
              className="post-input__code-textarea"
              placeholder={t("feed.code_placeholder")}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={6}
            />
          </div>
        )}

        {/* Image Preview */}
        {imagePreview && (
          <div className="post-input__image-preview">
            <img src={imagePreview} alt="Preview" />
            <button
              type="button"
              className="post-input__image-remove"
              onClick={() => { setImagePreview(null); setImageFile(null); }}
            >
              ×
            </button>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setImageFile(file);
              const reader = new FileReader();
              reader.onload = (ev) => setImagePreview(ev.target.result);
              reader.readAsDataURL(file);
            }
            e.target.value = '';
          }}
        />

        {/* Link Input */}
        {showLinkInput && (
          <div className="post-input__link-input">
            <LinkIcon />
            <input
              type="url"
              className="post-input__link-url"
              placeholder={t("feed.link_placeholder")}
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (linkUrl.trim()) {
                    setContent((prev) => prev + (prev.trim() ? "\n" : "") + linkUrl.trim());
                    setLinkUrl("");
                    setShowLinkInput(false);
                    textareaRef.current?.focus();
                  }
                }
              }}
              autoFocus
            />
            <button
              type="button"
              className="post-input__link-add"
              onClick={() => {
                if (linkUrl.trim()) {
                  setContent((prev) => prev + (prev.trim() ? "\n" : "") + linkUrl.trim());
                  setLinkUrl("");
                  setShowLinkInput(false);
                  textareaRef.current?.focus();
                }
              }}
              disabled={!linkUrl.trim()}
            >
              {t("feed.add_link_btn")}
            </button>
            <button
              type="button"
              className="post-input__link-close"
              onClick={() => { setShowLinkInput(false); setLinkUrl(""); }}
            >
              ×
            </button>
          </div>
        )}

        {/* Tags Input */}
        <div className="post-input__tags-row">
          <input
            type="text"
            className="post-input__tags-input"
            placeholder={t("feed.tags_placeholder")}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div className="post-input__actions">
          <div className="post-input__tools">
            <button
              type="button"
              className={`post-input__tool ${showCodeEditor ? "post-input__tool--active" : ""}`}
              onClick={() => setShowCodeEditor(!showCodeEditor)}
              title={t("feed.tools.add_code")}
            >
              <CodeIcon />
            </button>
            <button
              type="button"
              className={`post-input__tool ${imagePreview ? "post-input__tool--active" : ""}`}
              onClick={() => imageInputRef.current?.click()}
              title={t("feed.tools.add_image")}
            >
              <ImageIcon />
            </button>
            <button
              type="button"
              className={`post-input__tool ${showLinkInput ? "post-input__tool--active" : ""}`}
              onClick={() => setShowLinkInput(!showLinkInput)}
              title={t("feed.tools.add_link")}
            >
              <LinkIcon />
            </button>
            <button
              type="button"
              className={`post-input__tool post-input__tool--question ${isQuestion ? "post-input__tool--active" : ""}`}
              onClick={() => setIsQuestion(!isQuestion)}
              title={t("feed.tools.add_question")}
            >
              <QuestionIcon />
            </button>
          </div>
          <div className="post-input__submit-area">
            {hasCenterAccess ? (
              <div className="post-input__visibility-selector" ref={visibilityRef}>
                <button
                  type="button"
                  className={`post-input__visibility post-input__visibility--interactive ${visibility === "center" ? "post-input__visibility--center" : ""}`}
                  onClick={() => setShowVisibilityDropdown(!showVisibilityDropdown)}
                >
                  {visibility === "global" ? <GlobeIcon /> : <CenterIcon />}
                  <span>{visibility === "global" ? t("feed.visibility_public") : t("feed.visibility_center")}</span>
                  <ChevronDownIcon />
                </button>
                {showVisibilityDropdown && (
                  <div className="post-input__visibility-dropdown">
                    <button
                      type="button"
                      className={`post-input__visibility-option ${visibility === "global" ? "post-input__visibility-option--active" : ""}`}
                      onClick={() => { setVisibility("global"); setShowVisibilityDropdown(false); }}
                    >
                      <GlobeIcon size={16} />
                      <div className="post-input__visibility-option-text">
                        <span className="post-input__visibility-option-label">{t("feed.visibility_public")}</span>
                        <span className="post-input__visibility-option-desc">{t("feed.visibility_public_desc")}</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`post-input__visibility-option ${visibility === "center" ? "post-input__visibility-option--active" : ""}`}
                      onClick={() => { setVisibility("center"); setShowVisibilityDropdown(false); }}
                    >
                      <CenterIcon size={16} />
                      <div className="post-input__visibility-option-text">
                        <span className="post-input__visibility-option-label">{t("feed.visibility_center")}</span>
                        <span className="post-input__visibility-option-desc">{t("feed.visibility_center_desc")}</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="post-input__visibility">
                <GlobeIcon />
                <span>{t("feed.visibility_public")}</span>
              </div>
            )}
            <button
              type="submit"
              className="post-input__submit"
              disabled={(!content.trim() && !code.trim()) || submitting}
            >
              {submitting
                ? t("common.processing")
                : isQuestion
                  ? t("feed.post_question")
                  : t("feed.publish")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
