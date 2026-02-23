# 🖥️ CONTEXT – Frontend (React + Vite)

> **Directrius i registre de canvis per a la carpeta `client/`.**
> Llegeix SEMPRE aquest fitxer abans de treballar al frontend.

---

## 📌 Informació del servei

| Camp                        | Valor                               |
| --------------------------- | ----------------------------------- |
| **Framework**               | React 18 (JS pur, sense TypeScript) |
| **Bundler**                 | Vite 5                              |
| **Routing**                 | React Router DOM v7                 |
| **Port dev**                | 5173 (directe) / 8080 (via Nginx)   |
| **Contenidor**              | `tfg_client_dev`                    |
| **Directori al contenidor** | `/app`                              |

---

## ✅ QUÈ POTS FER

- Crear components a `src/components/`
- Crear pàgines a `src/pages/`
- Crear hooks personalitzats a `src/hooks/`
- Crear serveis/API calls a `src/services/`
- Crear contextos a `src/context/`
- Afegir rutes noves a `src/App.jsx`
- Instal·lar paquets npm (afegir a `package.json`)
- Crear fitxers CSS/SCSS dins de `src/`
- Crear utilitats a `src/utils/`
- Modificar `vite.config.js` si cal (proxy, alias, plugins)

## ❌ QUÈ NO POTS FER

- **NO modificar el `Dockerfile`** — Està a la infraestructura compartida
- **NO modificar `docker-compose.*.yml`** — Gestió centralitzada
- **NO utilitzar TypeScript** — El projecte usa JS pur
- **NO crear fitxers fora de `client/`** — Cada servei és independent
- **NO modificar `index.html`** tret que sigui estrictament necessari
- **NO canviar el port 5173** a `vite.config.js`
- **NO eliminar la config `host: '0.0.0.0'`** de `vite.config.js` (necessària per Docker)
- **NO eliminar `usePolling: true`** de `vite.config.js` (necessari per HMR dins Docker)
- **NO instal·lar frameworks CSS complets** sense consens de l'equip (Tailwind, Bootstrap, etc.)
- **NO crear crides directes a MySQL/Redis** — Tot passa per l'API de Laravel

## ⚠️ REGLES IMPORTANTS

1. **Crides a l'API:** Utilitza sempre la variable `VITE_API_URL` per construir les URLs:
   ```js
   const API = import.meta.env.VITE_API_URL || "/api";
   ```
2. **Socket.io:** Connecta sempre via la variable `VITE_SOCKET_URL`:
   ```js
   const SOCKET = import.meta.env.VITE_SOCKET_URL || "";
   ```
3. **Estructura de carpetes recomanada:**
   ```
   src/
   ├── components/    # Components reutilitzables
   ├── pages/         # Pàgines (una per ruta)
   ├── hooks/         # Custom hooks
   ├── context/       # React Context providers
   ├── services/      # Crides a l'API (fetch/axios)
   ├── utils/         # Funcions d'utilitat
   ├── assets/        # Imatges, fonts, etc.
   ├── App.jsx        # Rutes principals
   └── main.jsx       # Punt d'entrada (NO TOCAR)
   ```
4. **Convencions de noms:**
   - Components: `PascalCase.jsx` (ex: `UserCard.jsx`)
   - Hooks: `useCamelCase.js` (ex: `useAuth.js`)
   - Serveis: `camelCase.js` (ex: `authService.js`)
   - Pàgines: `PascalCase.jsx` (ex: `Dashboard.jsx`)

---

## 🔧 Configuració actual

### package.json

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.13.0"
  }
}
```

### vite.config.js

- Plugin: `@vitejs/plugin-react`
- Host: `0.0.0.0` (obligatori per Docker)
- Port: `5173` (strictPort)
- Watch: polling activat (obligatori per HMR dins Docker)

### Variables d'entorn disponibles

| Variable          | Valor (dev)                 | Descripció            |
| ----------------- | --------------------------- | --------------------- |
| `VITE_API_URL`    | `http://localhost:8080/api` | URL base de l'API     |
| `VITE_SOCKET_URL` | `http://localhost:8080`     | URL base de Socket.io |

---

## 📅 Registre de canvis

### 2026-02-19 – Sistema d'autenticació complet + Feedback UX

- **Autor:** @iker
- **Autenticació (Sanctum):**
  - Creat `src/context/AuthContext.jsx` — Provider global amb `login()`, `register()`, `logout()`
    - Restauració automàtica de sessió al muntar (`/api/me`)
    - Parsing correcte de la resposta API (`{ data: { user, token } }`)
    - Missatges de feedback (`authMessage`) amb auto-clear als 6 segons
    - Exporta constant `PASSWORD_REQUIREMENTS` per validació client-side
    - Funció `parseApiError()` per errors de validació Laravel (422)
  - Creat `src/hooks/useAuth.js` — Hook custom per consumir `AuthContext`
  - Creat `src/components/auth/ProtectedRoute.jsx` — Redirigeix a `/welcome` si no autenticat
  - Creat `src/components/auth/PublicOnlyRoute.jsx` — Redirigeix a `/` si ja autenticat
  - Modificat `src/services/api.js`:
    - Header `Authorization: Bearer <token>` automàtic des de `localStorage`
    - Headers per defecte: `Content-Type: application/json`, `Accept: application/json`
  - Modificat `src/App.jsx` — Embolcallat amb `<AuthProvider>`
  - Modificat `src/router/index.jsx` — Rutes protegides amb `ProtectedRoute` i `PublicOnlyRoute`
- **Landing page – Feedback UX:**
  - Requisistos de contrasenya en temps real (8 chars, majúscula, minúscula, número) amb ✓/✗
  - Indicador de coincidència de contrasenyes (borde verd/vermell)
  - Missatges d'èxit (banner verd) i error (banner vermell) animats
  - Botó de registre desactivat fins complir tots els requisits
  - Classes CSS noves: `auth-card__message--success/error`, `auth-card__password-reqs`, `auth-card__match-indicator`, `auth-card__input--valid/invalid`
- **Sidebar:** Afegit botó de Logout i informació d'usuari dinàmica
- **Configuració backend:** `.env` del client creat amb `VITE_API_URL=http://localhost:8080/api`

### 2026-02-19 – Implementació completa UI "Academic Dark Mode"

- **Autor:** @copilot (IA)
- **Sistema de disseny:**
  - Refactoritzat `variables.css` amb paleta Codex (Deep Slate, Teal, Violet)
  - Escala de superfícies amb 6 nivells de profunditat
  - Tipografia: Plus Jakarta Sans (UI) + JetBrains Mono (codi)
  - Variables semàntiques per colors, ombres i animacions
- **Pàgines creades:**
  - `Landing.jsx` + `Landing.css` — Pàgina de benvinguda amb auth
  - `Explore.jsx` + `Explore.css` — Cerca i descobriment amb widgets
  - `Notifications.jsx` + `Notifications.css` — Stream d'activitats filtrable
  - `CenterHub.jsx` + `CenterHub.css` — Dashboard del centre educatiu
- **Components creats:**
  - `layout/MainLayout.jsx` + CSS — Shell 3-columnes (sidebar / main / widgets)
  - `layout/Sidebar.jsx` + CSS — Navegació principal amb icones
  - `layout/RightSection.jsx` + CSS — Widgets laterals (trending, contributors)
  - `feed/Feed.jsx` + CSS — Feed amb tabs (Para ti / Siguiendo / Dudas)
  - `feed/PostInput.jsx` + CSS — Editor de publicacions amb suport codi
  - `feed/PostCard.jsx` + CSS — Tarjeta de post amb syntax highlighting
  - `profile/Profile.jsx` + CSS — Perfil d'usuari minimalista
- **Rutes noves:**
  - `/welcome` → Landing
  - `/center` → CenterHub
- **MockApi:** Dades de prova integrades per a previsualització sense backend

### 2026-02-17 – Estructura completa del projecte, tooling i serveis

- **Autor:** @chuclao (amb IA)
- Refactoritzat **router**: rutes extretes a `src/router/index.jsx`, `App.jsx` ara delega a `<AppRouter />`
- Configurat **alias `@`** a `vite.config.js` per imports absoluts (`@/components/...`)
- Creat **sistema d'estils**: `src/styles/index.css` (entry point), `reset.css`, `variables.css` (design tokens), `base.css`
- Importat estils globals a `main.jsx`
- Creat **servei API** a `src/services/api.js` (wrapper fetch amb GET/POST/PUT/PATCH/DELETE)
- Configurat **ESLint** (flat config v9) amb `eslint.config.js` + plugins react-hooks i react-refresh
- Configurat **Prettier** amb `.prettierrc` i `.prettierignore`
- Afegits scripts `lint`, `lint:fix`, `format`, `format:check` a `package.json`
- Eliminades dependències TypeScript (`@types/react`, `@types/react-dom`), afegides ESLint + Prettier
- Creat `.env.example` amb `VITE_API_URL` i `VITE_SOCKET_URL`
- Creades carpetes amb `.gitkeep`: `components/`, `components/ui/`, `context/`, `hooks/`, `layouts/`, `utils/`, `assets/fonts/`, `assets/icons/`, `assets/images/`

### 2026-02-17 – Estructura base React Router

- **Autor:** @chuclao
- Afegit `react-router-dom` v7
- Creat `src/App.jsx` amb Routes
- Creat `src/pages/Home.jsx` com a pàgina inicial
- Configurat `BrowserRouter` a `main.jsx`

### 2026-02-13 – Infraestructura inicial

- **Autor:** @chuclao
- Creat `Dockerfile` multi-stage (dev/prod)
- Creat `package.json` amb React 18 + Vite 5
- Creat `vite.config.js` configurat per Docker
- Creat `index.html` base
- Creat `src/main.jsx` amb ReactDOM.createRoot

### 2026-02-20 – Verificació de Professor al Registre (Modal)

- **Autor:** @iker
- **Verificació de professor:**
  - Creat `src/components/auth/TeacherVerificationModal.jsx` + `.css` — Modal amb upload de justificant
    - Camps: nom complet, nom del centre, ciutat (opcional), justificant (PDF/JPG/PNG, max 5MB)
    - Drag & drop + validació de fitxer + preview amb mida
    - Estil glassmorphism Codex amb animacions d'entrada
  - Modificat `src/services/api.js`:
    - Nou mètode `upload(endpoint, formData)` per a peticions `multipart/form-data` (no estableix Content-Type)
  - Modificat `src/context/AuthContext.jsx`:
    - Nou mètode `checkDomain(email)` — crida `POST /api/check-domain` per detectar centre
    - Nou mètode `registerWithCenterRequest(userData, centerRequestData)` — registra + envia sol·licitud de centre
  - Modificat `src/pages/Landing.jsx`:
    - Substituïda detecció de domini hardcoded per crida real a `POST /api/check-domain` (debounced 600ms)
    - Mostra missatges dinàmics: centre detectat, sol·licitud pendent, o verificació requerida
    - Si `can_request=true` al registrar → mostra `TeacherVerificationModal`
    - Modal confirma → `registerWithCenterRequest()` registra usuari + envia center request amb justificant
- **Flux complet:**
  1. Usuari escriu email al formulari de registre → frontend crida check-domain (debounced)
  2. Si domini té centre actiu → mostra "Centro detectado" + registre normal com a student
  3. Si domini no té centre (`can_request=true`) → mostra avís + al enviar registre apareix modal
  4. Modal demana: nom complet, nom del centre, justificant (fitxer)
  5. On confirma → `POST /api/register` + `POST /api/center-requests` seqüencials
  6. Usuari redirigit a home amb missatge d'èxit

### 2026-02-20 – Perfil minimalista + Layout full-width + Verificació email

- **Autor:** @iker
- **Perfil redissenyat (minimalista):**
  - Reescrit `src/components/profile/Profile.jsx` — eliminat tot mock data, ara usa `useAuth()` per mostrar dades reals
    - Mostra: nom, @username, rol (Estudiante/Profesor), centre (si té), email, data de registre
    - Avatar generat amb DiceBear basat en username
  - Reescrit `src/components/profile/Profile.css` — disseny centrat amb cover gradient, layout net i responsive
- **Layout full-width:**
  - Modificat `src/components/layout/MainLayout.css`:
    - Eliminat `max-width: 1400px` i `margin: 0 auto` del `.app-layout` → ara ocupa tot l'ample del viewport
    - Eliminat `max-width: var(--feed-width)` del `.main-content__container`
- **Verificació email integrada:**
  - Creat `src/pages/EmailVerification.jsx` + `.css` — pantalla de verificació pendent
    - Mostra email de l'usuari, botó "Reenviar" amb cooldown de 60s
    - Polling automàtic cada 5s via `refreshUser()` per detectar verificació
    - Redirigeix a home automàticament quan email es verifica
    - Botó de logout disponible
  - Modificat `src/context/AuthContext.jsx`:
    - Nou estat `emailVerified` — es sincronitza amb la resposta de `/me`, login, register
    - Nou mètode `refreshUser()` — re-fetch `/me` per comprovar `email_verified`
  - Modificat `src/router/index.jsx`:
    - Nova guarda `VerifiedRoute` — bloqueja usuaris no verificats i redirigeix a `/verify-email`
    - Nova ruta `/verify-email` → `EmailVerification` (protegida però no requereix verificació)
- **Fix config mail backend:** `api/.env` corregit de `MAIL_MAILER=log` a `smtp`, `MAIL_HOST=mailpit`, `MAIL_PORT=1025`

---

## 🎨 Estructura actual de components

```
src/
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.jsx       # Redirigeix si no autenticat
│   │   ├── PublicOnlyRoute.jsx      # Redirigeix si ja autenticat
│   │   ├── TeacherVerificationModal.jsx / .css # Modal verificació professor
│   ├── feed/
│   │   ├── Feed.jsx / Feed.css         # Llista de posts amb tabs
│   │   ├── PostCard.jsx / PostCard.css # Tarjeta de publicació
│   │   └── PostInput.jsx / PostInput.css # Editor de posts
│   ├── layout/
│   │   ├── MainLayout.jsx / MainLayout.css # Shell principal
│   │   ├── Sidebar.jsx / Sidebar.css       # Nav esquerra + Logout
│   │   └── RightSection.jsx / RightSection.css # Widgets dreta
│   ├── profile/
│   │   └── Profile.jsx / Profile.css       # Perfil d'usuari (minimalista, dades reals)
│   └── ui/
│       └── Icons.jsx                # Icones SVG reutilitzables
├── context/
│   └── AuthContext.jsx              # Provider auth global (login/register/logout/emailVerified/refreshUser)
├── hooks/
│   └── useAuth.js                   # Hook per consumir AuthContext
├── pages/
│   ├── Landing.jsx / Landing.css    # Welcome + Auth + Feedback UX
│   ├── Home.jsx                     # Wrapper per Feed
│   ├── Explore.jsx / Explore.css    # Cerca + Descobriment
│   ├── Notifications.jsx / Notifications.css # Activitat
│   ├── CenterHub.jsx / CenterHub.css # Hub institucional
│   ├── EmailVerification.jsx / .css # Pantalla verificació email pendent
│   ├── ProfilePage.jsx              # Wrapper per Profile
│   ├── Messages.jsx                 # (Pendent)
│   └── More.jsx                     # Menú addicional
├── router/
│   └── index.jsx                    # Rutes protegides + públiques + VerifiedRoute
├── services/
│   ├── api.js                       # Client HTTP (amb Bearer token auto + upload)
│   └── mockApi.js                   # Dades de prova
└── styles/
    ├── index.css                    # Entry point
    ├── variables.css                # Design tokens
    ├── base.css                     # Reset + Typography
    └── reset.css                    # CSS reset
```

---

## 📚 Documentació Relacionada

- **Visió Global del Projecte:** [../doc/PROJECT_CONCEPT.md](../doc/PROJECT_CONCEPT.md)
- **Backend (API):** [../api/CONTEXT.md](../api/CONTEXT.md)
- **Real-time (Socket):** [../socket/CONTEXT.md](../socket/CONTEXT.md)
