import React, { useState } from 'react';
import './Landing.css';

// Icons as inline SVGs for a minimal approach
const CodeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const TerminalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const GithubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function Landing() {
  const [email, setEmail] = useState('');
  const [isStudentEmail, setIsStudentEmail] = useState(false);
  const [detectedSchool, setDetectedSchool] = useState('');

  // School domain detection simulation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Simulate school domain detection
    if (value.includes('@alu.iesjaume') || value.includes('@iesjaume')) {
      setIsStudentEmail(true);
      setDetectedSchool('IES Jaume Balmes');
    } else if (value.includes('@alu.') || value.includes('@edu.')) {
      setIsStudentEmail(true);
      setDetectedSchool('Centro Educativo Detectado');
    } else {
      setIsStudentEmail(false);
      setDetectedSchool('');
    }
  };

  return (
    <div className="landing">
      {/* Ambient background effects */}
      <div className="landing__ambient">
        <div className="landing__gradient landing__gradient--teal" />
        <div className="landing__gradient landing__gradient--violet" />
        <div className="landing__grid" />
      </div>

      {/* Navigation */}
      <nav className="landing__nav">
        <div className="landing__nav-container">
          <a href="/" className="landing__logo">
            <span className="landing__logo-icon">
              <TerminalIcon />
            </span>
            <span className="landing__logo-text">Codex</span>
          </a>
          <div className="landing__nav-links">
            <a href="#features" className="landing__nav-link">Funcionalidades</a>
            <a href="#community" className="landing__nav-link">Comunidad</a>
            <a href="/login" className="landing__nav-link landing__nav-link--cta">
              Iniciar Sesión
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="landing__hero">
        <div className="landing__hero-content">
          {/* Badge */}
          <div className="landing__badge animate-slideDown">
            <span className="landing__badge-dot" />
            Red Social Académica para Desarrolladores
          </div>

          {/* Headline */}
          <h1 className="landing__title animate-slideUp">
            El espacio donde los{' '}
            <span className="landing__title-accent">estudiantes de FP</span>{' '}
            comparten código
          </h1>

          {/* Subheadline */}
          <p className="landing__subtitle animate-slideUp stagger-1">
            Conecta con tu centro, resuelve dudas técnicas y construye tu portfolio 
            profesional junto a la comunidad de DAM, DAW y ASIX de toda España.
          </p>

          {/* Features Grid */}
          <div className="landing__features animate-slideUp stagger-2">
            <div className="landing__feature">
              <div className="landing__feature-icon">
                <CodeIcon />
              </div>
              <div className="landing__feature-text">
                <span className="landing__feature-title">Snippets con Sintaxis</span>
                <span className="landing__feature-desc">Comparte código con highlight</span>
              </div>
            </div>
            <div className="landing__feature">
              <div className="landing__feature-icon landing__feature-icon--violet">
                <UsersIcon />
              </div>
              <div className="landing__feature-text">
                <span className="landing__feature-title">Hub del Centro</span>
                <span className="landing__feature-desc">Espacio privado para tu instituto</span>
              </div>
            </div>
            <div className="landing__feature">
              <div className="landing__feature-icon landing__feature-icon--emerald">
                <ShieldIcon />
              </div>
              <div className="landing__feature-text">
                <span className="landing__feature-title">Verificación Académica</span>
                <span className="landing__feature-desc">Email institucional validado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="landing__auth-card animate-slideUp stagger-3">
          <div className="auth-card">
            <div className="auth-card__header">
              <h2 className="auth-card__title">Únete a Codex</h2>
              <p className="auth-card__subtitle">
                Usa tu email del centro para acceso completo
              </p>
            </div>

            <form className="auth-card__form" onSubmit={(e) => e.preventDefault()}>
              <div className="auth-card__input-group">
                <label className="auth-card__label" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className={`auth-card__input ${isStudentEmail ? 'auth-card__input--verified' : ''}`}
                  placeholder="tu.nombre@alu.iesjaume.es"
                  value={email}
                  onChange={handleEmailChange}
                />
                {isStudentEmail && (
                  <div className="auth-card__verified">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{detectedSchool} detectado</span>
                  </div>
                )}
              </div>

              <div className="auth-card__input-group">
                <label className="auth-card__label" htmlFor="password">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  className="auth-card__input"
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" className="auth-card__submit">
                {isStudentEmail ? 'Crear cuenta de estudiante' : 'Crear cuenta'}
              </button>
            </form>

            <div className="auth-card__divider">
              <span>o continúa con</span>
            </div>

            <div className="auth-card__social">
              <button className="auth-card__social-btn">
                <GithubIcon />
                <span>GitHub</span>
              </button>
              <button className="auth-card__social-btn">
                <GoogleIcon />
                <span>Google</span>
              </button>
            </div>

            <p className="auth-card__footer">
              ¿Ya tienes cuenta?{' '}
              <a href="/login" className="auth-card__link">Inicia sesión</a>
            </p>
          </div>
        </div>
      </main>

      {/* Code Preview Section */}
      <section className="landing__preview">
        <div className="landing__preview-container">
          <div className="code-preview">
            <div className="code-preview__header">
              <div className="code-preview__dots">
                <span />
                <span />
                <span />
              </div>
              <span className="code-preview__filename">snippet.js</span>
            </div>
            <pre className="code-preview__code">
              <code>
                <span className="syntax-keyword">const</span>{' '}
                <span className="syntax-variable">codex</span>{' '}
                <span className="syntax-operator">=</span> {'{'}
                {'\n'}  <span className="syntax-variable">students</span>:{' '}
                <span className="syntax-number">2847</span>,
                {'\n'}  <span className="syntax-variable">centers</span>:{' '}
                <span className="syntax-number">156</span>,
                {'\n'}  <span className="syntax-variable">snippets</span>:{' '}
                <span className="syntax-number">12453</span>,
                {'\n'}  <span className="syntax-function">connect</span>:{' '}
                <span className="syntax-keyword">async</span>{' '}() <span className="syntax-operator">=&gt;</span> {'{'}
                {'\n'}    <span className="syntax-keyword">await</span>{' '}
                <span className="syntax-function">joinCommunity</span>();
                {'\n'}    <span className="syntax-comment">// Tu viaje empieza aquí 🚀</span>
                {'\n'}  {'}'}
                {'\n'}{'}'};
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing__footer">
        <div className="landing__footer-container">
          <div className="landing__footer-brand">
            <span className="landing__logo-icon">
              <TerminalIcon />
            </span>
            <span>Codex</span>
          </div>
          <p className="landing__footer-text">
            La red social académica para el ecosistema de FP Informática en España
          </p>
        </div>
      </footer>
    </div>
  );
}
