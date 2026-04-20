import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { PASSWORD_REQUIREMENTS } from "@/context/AuthContext";
import api from "@/services/api";
import TeacherVerificationModal from "@/components/auth/TeacherVerificationModal";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import "./Landing.css";

// ── Symbol Sea: Canvas-based animated ASCII background ────────
const SYMBOLS = "{}[]<>=>/*+-|\\;:!?#@&$%^~_.01";

function SymbolSea({ intensity = 0 }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef([]);
  const frameRef = useRef(null);
  const intensityRef = useRef(intensity);

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Matrix projection logic
    const fov = 400;

    // Create a 3D grid consisting of points
    const GRID_SIZE_X = 50;
    const GRID_SIZE_Z = 30;
    const SPACING = 30;

    const points = [];
    for (let x = 0; x < GRID_SIZE_X; x++) {
      for (let z = 0; z < GRID_SIZE_Z; z++) {
        points.push({
          x: (x - GRID_SIZE_X / 2) * SPACING,
          y: 0,
          z: (z - GRID_SIZE_Z / 2) * SPACING,
          baseY: 0,
          char: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          changeTimer: Math.random() * 200,
          opacityOffset: Math.random() * 0.1
        });
      }
    }
    particlesRef.current = points;

    // Mouse tracking
    const handleMouse = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouse);

    // Render loop
    let time = 0;
    const animate = () => {
      time += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "12px 'JetBrains Mono', monospace";

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + 100; // Shift down slightly
      const currentIntensity = intensityRef.current;

      // Mouse normalized coordinates for slight camera rotation
      const mouseXNorm = (mx - cx) / cx;
      const mouseYNorm = (my - cy) / cy;

      const angleY = time * 0.1 + mouseXNorm * 0.5; // Rotate around Y axis slowly
      const angleX = 0.5 + Math.max(-0.2, Math.min(0.2, mouseYNorm * 0.2)); // Pitch

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // 1. Calculate undulating terrain (Waves)
        // Add multiple sine waves based on x, z, and time to create a flowing surface
        const wave1 = Math.sin(p.x * 0.01 + time) * 30;
        const wave2 = Math.cos(p.z * 0.02 - time * 0.8) * 20;
        const wave3 = Math.sin((p.x + p.z) * 0.015 + time * 1.2) * 15;
        p.y = wave1 + wave2 + wave3;

        // Apply typing intensity glitch/jump
        if (currentIntensity > 0) {
          p.y -= Math.random() * 20 * currentIntensity;
          p.x += (Math.random() - 0.5) * 5 * currentIntensity;
        }

        // 2. 3D Rotation (around X and Y axis)
        // Rotate Y
        let rx = p.x * Math.cos(angleY) - p.z * Math.sin(angleY);
        let rz = p.x * Math.sin(angleY) + p.z * Math.cos(angleY);
        
        // Rotate X
        let ry = p.y * Math.cos(angleX) - rz * Math.sin(angleX);
        rz = p.y * Math.sin(angleX) + rz * Math.cos(angleX);

        // Translate Z back so the camera is at Z=0
        rz += 600;

        // Skip rendering if point is behind camera
        if (rz < 1) continue;

        // 3. Perspective Projection
        const scale = fov / rz;
        const screenX = cx + rx * scale;
        const screenY = cy + ry * scale;

        // Determine opacity based on Z depth (fog effect)
        let opacity = Math.max(0, Math.min(1, 1 - (rz - 200) / 1000));
        
        // Mouse hover interaction: push points away or highlight them
        const dx = screenX - mx;
        const dy = screenY - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          opacity += 0.2;
        }

        opacity = opacity * 0.4 + p.opacityOffset; // Max opacity 40-50%
        
        if (opacity <= 0.01) continue; // optimize

        // Character change randomly over time
        p.changeTimer--;
        if (p.changeTimer <= 0) {
          p.char = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          p.changeTimer = 100 + Math.random() * 300;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${opacity.toFixed(3)})`;
        ctx.fillText(p.char, screenX, screenY);
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className="landing__symbol-sea">
      <canvas ref={canvasRef} />
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// ── Main Landing Component ────────────────────────────────────
export default function Landing() {
  const { t } = useTranslation();
  const { login, register, registerWithCenterRequest, checkDomain, authMessage, clearAuthMessage } =
    useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [hasError, setHasError] = useState(false);
  const [keyIntensity, setKeyIntensity] = useState(0);

  // Force body bg to pure black while on landing
  useEffect(() => {
    document.body.classList.add("landing-active");
    return () => document.body.classList.remove("landing-active");
  }, []);

  // Handle error from verification redirect
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "invalid_link") {
      setError(t("landing.errors.invalid_verification_link", "El enlace de verificación es inválido o ha expirado."));
      searchParams.delete("error");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, t]);

  // Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPasswordReqs, setShowPasswordReqs] = useState(false);

  // School detection
  const [domainInfo, setDomainInfo] = useState(null);
  const [checkingDomain, setCheckingDomain] = useState(false);
  const debounceRef = useRef(null);

  // Teacher verification modal
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pendingRegistrationData, setPendingRegistrationData] = useState(null);

  // Auto-clear success message
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Show password requirements
  useEffect(() => {
    setShowPasswordReqs(!isLogin && password.length > 0);
  }, [password, isLogin]);

  // Error glitch effect
  useEffect(() => {
    if (error) {
      setHasError(true);
      const timer = setTimeout(() => setHasError(false), 600);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Keypress intensity for symbol sea
  const handleKeyDown = useCallback(() => {
    setKeyIntensity(1);
    setTimeout(() => setKeyIntensity(0), 150);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setDomainInfo(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!isLogin && value.includes("@") && value.split("@")[1]?.includes(".")) {
      debounceRef.current = setTimeout(async () => {
        setCheckingDomain(true);
        const result = await checkDomain(value);
        setDomainInfo(result);
        setCheckingDomain(false);
      }, 600);
    }
  };

  const allPasswordReqsMet = PASSWORD_REQUIREMENTS.every((req) => req.test(password));
  const passwordsMatch = password === passwordConfirmation && passwordConfirmation.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.success) {
          setSuccessMsg(t("auth.login_success"));
          setTimeout(() => navigate("/"), 800);
        } else {
          setError(result.message);
        }
      } else {
        if (!allPasswordReqsMet) {
          setError(t("landing.errors.password_requirements"));
          setLoading(false);
          return;
        }
        if (password !== passwordConfirmation) {
          setError(t("landing.errors.passwords_dont_match"));
          setLoading(false);
          return;
        }

        const username = email.split("@")[0] + Math.floor(Math.random() * 1000);
        const userData = {
          name,
          email,
          username,
          password,
          password_confirmation: passwordConfirmation,
        };

        if (domainInfo && domainInfo.can_request) {
          setPendingRegistrationData(userData);
          setShowVerificationModal(true);
          setLoading(false);
          return;
        }

        const result = await register(userData);
        if (result.success) {
          setSuccessMsg(t("auth.register_success"));
          setTimeout(() => navigate("/"), 800);
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError(t("common.error_generic"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationConfirm = async (centerData) => {
    setLoading(true);
    setError("");
    const result = await registerWithCenterRequest(pendingRegistrationData, centerData);
    if (result.success) {
      setShowVerificationModal(false);
      setSuccessMsg(t("landing.messages.check_review"));
      setTimeout(() => navigate("/"), 1200);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleVerificationCancel = () => {
    setShowVerificationModal(false);
    setPendingRegistrationData(null);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccessMsg("");
    setPassword("");
    setPasswordConfirmation("");
    setDomainInfo(null);
    clearAuthMessage();
  };

  // Google OAuth
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const res = await api.get("/auth/google/redirect");
      const url = res.data?.url || res.url;
      if (url) {
        window.location.href = url;
      } else {
        setError(t("landing.errors.google_failed"));
      }
    } catch (err) {
      console.error("Google redirect error", err);
      setError(t("landing.errors.google_failed"));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className={`landing ${hasError ? "landing--error" : ""}`}>
      {/* Symbol Sea Background */}
      <SymbolSea intensity={keyIntensity} />

      {/* Scanlines */}
      <div className="landing__scanline" />

      {/* Language selector */}
      <div className="landing__top-bar">
        <LanguageSwitcher />
      </div>

      {/* Watermarks */}
      <div className="landing__watermark">c0dex // v1.0</div>
      <div className="landing__watermark-right">sys.auth.module</div>

      {/* Main Container */}
      <main className="landing__hero">
        {/* Auth Card */}
        <div className="landing__auth-card">
          <div className="auth-card">
            <div className="auth-card__header">
              <h2 className="auth-card__title">
                {isLogin ? t("landing.auth_title_login") : t("landing.auth_title_register")}
              </h2>
              <p className="auth-card__subtitle">
                {isLogin ? t("landing.auth_subtitle_login") : t("landing.auth_subtitle_register")}
              </p>
            </div>

            {/* Success */}
            {successMsg && (
              <div className="auth-card__message auth-card__message--success">{successMsg}</div>
            )}

            {/* Error */}
            {error && <div className="auth-card__message auth-card__message--error">{error}</div>}

            <form className="auth-card__form" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="auth-card__input-group">
                  <label className="auth-card__label" htmlFor="name">
                    {t("landing.full_name")}
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="auth-card__input"
                    placeholder="john_doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="auth-card__input-group">
                <label className="auth-card__label" htmlFor="email">
                  {t("landing.email")}
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className={`auth-card__input ${!isLogin && domainInfo?.has_center ? "auth-card__input--verified" : ""}`}
                  placeholder="user@domain.dev"
                  value={email}
                  onChange={handleEmailChange}
                  autoComplete="email"
                />
                {!isLogin && checkingDomain && (
                  <div className="auth-card__verified" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <span>{t("landing.messages.checking_domain")}</span>
                  </div>
                )}
                {!isLogin && domainInfo && !checkingDomain && (
                  <div
                    className="auth-card__verified"
                    style={domainInfo.has_center ? {} : { color: "rgba(255,255,255,0.5)" }}
                  >
                    <ShieldIcon />
                    <span>
                      {domainInfo.has_center
                        ? `${domainInfo.center_name || t("landing.center")} ${t("landing.messages.center_detected")}`
                        : domainInfo.is_pending
                          ? t("landing.messages.center_pending")
                          : domainInfo.can_request
                            ? t("landing.messages.verification_required")
                            : t("landing.messages.domain_not_recognized")}
                    </span>
                  </div>
                )}
              </div>

              <div className="auth-card__input-group">
                <label className="auth-card__label" htmlFor="password">
                  {t("landing.password")}
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  className="auth-card__input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />

                {showPasswordReqs && (
                  <div className="auth-card__password-reqs">
                    <span className="auth-card__password-reqs-title">
                      {t("auth.password_requirements.title")}:
                    </span>
                    <ul className="auth-card__password-reqs-list">
                      {PASSWORD_REQUIREMENTS.map((req) => {
                        const met = req.test(password);
                        return (
                          <li
                            key={req.id}
                            className={`auth-card__password-req ${met ? "auth-card__password-req--met" : "auth-card__password-req--unmet"}`}
                          >
                            <span className="auth-card__password-req-icon">
                              {met ? <CheckIcon /> : <XIcon />}
                            </span>
                            {t(`auth.password_requirements.${req.id}`)}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              {isLogin && (
                <div className="auth-card__forgot-password">
                  <Link to="/forgot-password">{t("landing.forgot_password_link")}</Link>
                </div>
              )}

              {!isLogin && (
                <div className="auth-card__input-group">
                  <label className="auth-card__label" htmlFor="password_confirmation">
                    {t("landing.confirm_password")}
                  </label>
                  <input
                    type="password"
                    id="password_confirmation"
                    required
                    className={`auth-card__input ${
                      passwordConfirmation.length > 0
                        ? passwordsMatch
                          ? "auth-card__input--valid"
                          : "auth-card__input--invalid"
                        : ""
                    }`}
                    placeholder="••••••••"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    autoComplete="new-password"
                  />
                  {passwordConfirmation.length > 0 && (
                    <div
                      className={`auth-card__match-indicator ${
                        passwordsMatch
                          ? "auth-card__match-indicator--match"
                          : "auth-card__match-indicator--no-match"
                      }`}
                    >
                      <span className="auth-card__match-icon">
                        {passwordsMatch ? <CheckIcon /> : <XIcon />}
                      </span>
                      {passwordsMatch
                        ? t("landing.messages.passwords_match")
                        : t("landing.messages.passwords_dont_match")}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="auth-card__submit"
                disabled={loading || (!isLogin && (!allPasswordReqsMet || !passwordsMatch))}
              >
                <span>
                  {loading ? (
                    <div className="auth-card__spinner" />
                  ) : isLogin ? (
                    t("landing.login")
                  ) : (
                    t("landing.register")
                  )}
                </span>
              </button>
            </form>

            {/* Google OAuth */}
            <div className="auth-card__divider">
              {t("landing.or_continue_with")}
            </div>

            <button
              type="button"
              className="auth-card__google-btn"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <div className="auth-card__spinner" />
              ) : (
                <>
                  <svg className="auth-card__google-icon" viewBox="0 0 24 24" width="18" height="18">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {t("landing.google_login")}
                </>
              )}
            </button>

            <p className="auth-card__footer">
              {isLogin ? t("landing.no_account") : t("landing.already_account")}
              <button
                onClick={toggleMode}
                className="auth-card__link"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginLeft: 4 }}
              >
                {isLogin ? t("landing.register_here") : t("landing.login")}
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Teacher Verification Modal */}
      {showVerificationModal && (
        <TeacherVerificationModal
          email={email}
          loading={loading}
          onConfirm={handleVerificationConfirm}
          onCancel={handleVerificationCancel}
        />
      )}
    </div>
  );
}
