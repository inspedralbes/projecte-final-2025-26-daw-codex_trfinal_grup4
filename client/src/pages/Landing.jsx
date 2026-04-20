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

function SymbolSea({ errorTrigger = 0, isLightMode = false }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef([]);
  const frameRef = useRef(null);
  const errorEffectRef = useRef(0);


  useEffect(() => {
    if (errorTrigger > 0) {
      errorEffectRef.current = 1.0;
    }
  }, [errorTrigger]);

  const isLightModeRef = useRef(isLightMode);
  useEffect(() => {
    isLightModeRef.current = isLightMode;
  }, [isLightMode]);


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

    // Create a 3D orbital particle swarm (Vortex / Galaxy)
    const numParticles = 2500; 
    const points = [];
    
    for (let i = 0; i < numParticles; i++) {
      // Much larger radius and vertical spread to cover the entire screen
      const radius = 50 + Math.random() * 2500; 
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 3000; 
      
      points.push({
        radius: radius,
        angle: angle,
        baseY: height,
        // Fluid speeds
        speed: (2500 - radius) * 0.000004 + 0.0005, 
        char: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        changeTimer: Math.random() * 200,
        opacityOffset: Math.random() * 0.1,
        vx: 0,
        vy: 0,
        vz: 0
      });
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
      time += 0.02; // Slower time step
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "12px 'JetBrains Mono', monospace";

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2; 

      // Slowly decay error effect
      if (errorEffectRef.current > 0) {
        errorEffectRef.current *= 0.97;
        if (errorEffectRef.current < 0.01) errorEffectRef.current = 0;
      }
      const err = errorEffectRef.current;

      const TILT = 0.25; 

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // 1. Orbital logic
        // Moderate speed boost during error/loading
        const speedBoost = 1 + err * 5;
        p.angle += p.speed * speedBoost; 
        
        const currentY = p.baseY + Math.sin(p.angle * 2 + time) * 100;
        let currentRadius = p.radius;
        
        // Error panic jitter (only on real error)
        if (err > 0.5) {
          currentRadius += (Math.random() - 0.5) * 100 * (err - 0.5);
          p.angle += (Math.random() - 0.5) * 0.05 * (err - 0.5);
        }

        const x = currentRadius * Math.cos(p.angle);
        const z = currentRadius * Math.sin(p.angle);
        const y = currentY;

        // 2. 3D Rotation (Apply camera tilt on X axis)
        let rx = x;
        let ry = y * Math.cos(TILT) - z * Math.sin(TILT);
        let rz = y * Math.sin(TILT) + z * Math.cos(TILT);

        rz += 1200;

        if (rz < 1) continue;

        // 3. Perspective Projection
        const scale = fov / rz;
        let screenX = cx + rx * scale;
        let screenY = cy + ry * scale;

        // 4. Mouse Repulsion (Screen space interactions)
        const dx = screenX - mx;
        const dy = screenY - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const safeRadius = 150;
        if (dist < safeRadius) {
          const force = (1 - dist / safeRadius);
          const push = force * 60; 
          screenX += (dx / dist) * push;
          screenY += (dy / dist) * push;
        }

        // Determine base opacity
        let opacity = Math.max(0, Math.min(1, 1 - (rz - 400) / 2500));
        
        // Final opacity calc
        const distToMouseNorm = Math.min(1, dist / 400);
        const hoverBrightness = (1 - distToMouseNorm) * 0.4;

        opacity = opacity * 0.3 + p.opacityOffset + hoverBrightness; 
        
        if (opacity <= 0.01) continue; 

        // Character change randomly over time
        p.changeTimer--;
        if (p.changeTimer <= 0) {
          p.char = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          p.changeTimer = 100 + Math.random() * 300;
        }

        // Handle Light/Dark base color interpolation with error shift
        const isLight = isLightModeRef.current;
        const baseColor = isLight ? 0 : 255;
        const r = Math.floor(baseColor + (255 - baseColor) * err);
        const g = Math.floor(baseColor * Math.pow(1 - err, 2.5));
        const b = Math.floor(baseColor * Math.pow(1 - err, 2.5));

        // Increase base opacity slightly in light mode for better contrast
        const themeOpacityMult = isLight ? 1.4 : 1.0;
        const finalOpacity = Math.min(1, opacity * themeOpacityMult);

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity.toFixed(3)})`;
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

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
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
  const [errorCount, setErrorCount] = useState(0);

  // Theme logic
  const [isLightMode, setIsLightMode] = useState(() => {
    const saved = localStorage.getItem("landing-theme");
    if (saved) return saved === "light";
    return !window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const toggleTheme = () => {
    const newVal = !isLightMode;
    setIsLightMode(newVal);
    localStorage.setItem("landing-theme", newVal ? "light" : "dark");
  };


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
      setErrorCount(prev => prev + 1);
      const timer = setTimeout(() => setHasError(false), 2500);
      return () => clearTimeout(timer);
    }

  }, [error]);



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
    <div className={`landing ${isLightMode ? "landing--light" : ""} ${hasError ? "landing--error" : ""}`}>
      {/* Symbol Sea Background */}
      <SymbolSea errorTrigger={errorCount} isLightMode={isLightMode} />




      {/* Scanlines */}
      <div className="landing__scanline" />

      {/* Language selector & Theme Toggle */}
      <div className="landing__top-bar">
        <LanguageSwitcher />
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {isLightMode ? <MoonIcon /> : <SunIcon />}
        </button>
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
