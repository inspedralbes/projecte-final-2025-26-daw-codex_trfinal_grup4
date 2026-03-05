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
    "highlight.js": "^11.11.1",
    "i18next": "^25.x",
    "i18next-browser-languagedetector": "^8.x",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-i18next": "^16.x",
    "react-router-dom": "^7.13.0",
    "socket.io-client": "^4.8.x"
  },
  "devDependencies": {
    "vitest": "^4.x",
    "@testing-library/react": "^16.x",
    "jsdom": "^28.x"
  }
}
```

### vite.config.js

- Plugin: `@vitejs/plugin-react`
- Host: `0.0.0.0` (obligatori per Docker)
- Port: `5173` (strictPort)
- Watch: polling activat (obligatori per HMR dins Docker)
- **Testing**: Vitest configurat amb `jsdom` i globals.

### Variables d'entorn disponibles

| Variable          | Valor (dev)                 | Descripció            |
| ----------------- | --------------------------- | --------------------- |
| `VITE_API_URL`    | `http://localhost:8080/api` | URL base de l'API     |
| `VITE_SOCKET_URL` | `http://localhost:8080`     | URL base de Socket.io |

---

## 📅 Registre de canvis

### 2026-03-04 – Refinament UI del Perfil (Responsive, Punts i Traduccions)

- **Autor:** @iker
- **Millores UI (Mòbil & Desktop):**
  - Transformats els emojis de les nav tabs (Posts, Respostes, etc.) per **icones SVG** propis de Codex per a una estètica més neta.
  - Modificada la barra d'estadístiques d'escriptori (`.profile-guay__stats`) eliminant vores i fons per a un look transparent.
  - **Identitat & Punts (Mòbil):**
    - S'ha dissenyat un component combinat on la info de l'usuari queda a l'esquerra i els punts es mostren com un badge destacat a la dreta amb una icona de medalla (SVG).
    - Alinear a l'esquerra els textos del perfil a mòbil (nom d'usuari, bio).
  - **Stats Inline (Mòbil):**
    - S'han resituat les "Stats" (Seguidors/Seguint/Posts) just abans de la secció de tabs, sota els links de portfolio i web (estil Instagram).
    - Restaurat el `.profile-guay__avatar-row` al layout vertical amb centrat òptim (avatar + botons junts).
- **Traduccions (i18n):**
  - Instal·lada la clau traduïda `profile.links.portfolio` a `ca.json`, `es.json` i `en.json`.

### 2026-02-24 – Suport Multidioma (i18n), Estabilització de l'Entorn i Fix de Referències

- **Autor:** @iker
- **Multi-idioma (i18next):**
  - Implementat suport complet per a **Català (ca)**, **Espanyol (es)** i **Anglès (en)**.
  - Creats fitxers de traducció a `src/locales/`.
  - Configurat `src/i18n.js` amb detector de llenguatge (localStorage/browser) i fallback a espanyol.
  - Creat component `LanguageSwitcher.jsx` per al canvi de llengua en temps real.
  - Localitzades totes les rutes principals: `Feed`, `Profile`, `Explore`, `Notifications`, `CenterHub` i `More`.
- **Estabilització i Debugging:**
  - Corregits errors de referència (`createContext`, `useState`, `useRef`, `i18next`) a `AuthContext.jsx`, `Landing.jsx` i `PostCard.jsx`.
  - Re-instal·lació de dependències dins del contenidor `tfg_client_dev` per resoldre conflictes de resolució de mòduls (`react-i18next`).
  - Verificada l'estabilitat del dev server de Vite i el correcte renderitzat de la UI.
- **Fitxers nous:**
  - `src/i18n.js` — Configuració central d'i18next.
  - `src/locales/{ca,es,en}.json` — Diccionaris de traduccions.
  - `src/components/ui/LanguageSwitcher.jsx` / `.css` — Selector d'idiomes.

### 2026-02-23 – Sustitució del Logo (XC) i Entorn de Testing

- **Autor:** @iker
- **Identitat Visual:**
  - Substituït el logo anterior (forma de terminal) pel nou logo "XC" en format imatge.
  - Actualitzat `Sidebar.jsx` i el footer de `Landing.jsx` per utilitzar `/logo-transparent.png`.
- **Testing (Vitest):**
  - Configurat entorn de proves amb **Vitest** + **React Testing Library** + **jsdom**.
  - Actualitzat `vite.config.js` amb bloc `test` i setup de globals i jsdom.
  - Creat `src/test/setup.js` per a la configuració global de tests (`jest-dom`).
  - Creat `src/components/layout/Sidebar.test.jsx` — Prova automatitzada per verificar la correcta visualització del logo.
- **Accions:** Instal·lats paquets `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.

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

### 2026-02-23 – Temps real de perfil, Càrrega d'àvatars i Sync d'Estat Global

- **Autor:** @iker
- **Perfil en temps real:**
  - `src/hooks/useProfile.js` actualitzat per escoltar `profile.updated` a través de Socket.io.
  - Sincronització automàtica de dades (nom, àvatar, bio, stats) sense recarregar la pàgina.
- **Càrrega d'Àvatars:**
  - Modificat `src/services/api.js`: l'upload ara accepta opcions per sobreescriure el mètode HTTP.
  - Modificat `src/services/profileService.js`: implementat **Method Spoofing** enviant `_method=PUT` dins del `FormData` per compatibilitat amb el backend Laravel i `multipart/form-data`.
- **Sincronització d'Estat Global:**
  - `useProfile` ara crida a `refreshUser()` del `AuthContext` quan l'usuari actualitza el seu propi perfil.
  - Això garanteix que la barra lateral (Sidebar) i altres components vegin el nou àvatar a l'instant.
- **Barra Lateral (Sidebar):**
  - Àvatar de la barra lateral ara fa servir `user.username` com a seed per a Dicebear (consistent amb la pàgina de perfil).
  - Botó de logout completament funcional.

### 2026-02-25 – Resolució de Conflictes i Restauració de Perfil

- **Autor:** @iker
- **Resolució de Conflictes:**
  - Resolució de conflictes de merge a `Profile.jsx` després d'un rebase de git.
  - Restauració de la lògica de pestanyes (`activeTab`, `setActiveTab`) que s'havia perdut.
  - Restauració del fetch de dades per a `posts`, `likedPosts`, `bookmarkedPosts` i `replies`.
- **Millores de Perfil:**
  - Sincronització automàtica de la barra lateral amb el nou àvatar.
  - Redirecció automàtica en cas de canvi d'username.

### 2026-02-24 – Millores de Perfil i Sincronització Real-Time

- **Autor:** @iker
- **Correcció de Redirecció (Rename):**
  - Implementada lògica a `useProfile.js` per detectar canvis d'username.
  - `Profile.jsx` ara redirigeix automàticament a la nova URL de perfil per evitar errors 404.
- **URLs de Perfil Restaurades:**
  - Tornats a afegir els enllaços de **Portfolio** i **Web** a la capçalera del perfil amb els seus respectius icones SVG.
- **Sincronització Real-Time (Sockets):**
  - **`socketService.js`**: Afegit mètode genèric `.on()` per a subscripció a events arbitràris.
  - **`usePosts.js`**: Afegits listeners globals per a `post.deleted` (esborra de feeds) i `interaction.removed` (actualitza comptadors de likes/bookmarks).
  - **`useProfile.js`**: Listener per a `post.deleted` per sincronitzar el comptador total de posts del perfil.
  - **`Profile.jsx`**: Implementats listeners per sincronitzar en viu les pestanyes de Likes, Bookmarks i Replies quan s'eliminen continguts.

### 2026-02-25 – Selector de Visibilitat Global/Centre al crear posts

- **Autor:** @copilot (IA)
- **Selector de Visibilitat (PostInput.jsx):**
  - Usuaris amb `center_id`: poden triar entre "Público" (feed global) i "Solo Centro" (només visible al centre).
  - Usuaris sense `center_id`: veuen badge estàtic "Público" (sense dropdown).
  - Dropdown amb icones SVG (GlobeIcon, CenterIcon) i descripcions.
  - Indicador visual: teal per global, amber per centre.
  - Camp `visibility` s'envia al backend (`global` o `center`).
  - Tancar dropdown amb clic fora (useEffect + ref).
- **Backend (PostController):**
  - `store()`: usa camp `visibility` per decidir `center_id` (global→null, center→user.center_id).
  - `update()`: permet canviar la visibilitat d'un post existent.
  - `StorePostRequest` i `UpdatePostRequest`: validació del camp `visibility` (in:global,center).
- **Traduccions (es/ca/en):**
  - `visibility_center`, `visibility_public_desc`, `visibility_center_desc`
- **Fitxers modificats:** `PostInput.jsx`, `PostInput.css`, `PostController.php`, `StorePostRequest.php`, `UpdatePostRequest.php`, `es.json`, `ca.json`, `en.json`

### 2026-02-25 – Millores de la pàgina Explore (Trending Posts, Suggeriments, Filtres, Categories reals)

- **Autor:** @copilot (IA)
- **Trending Posts (nous widget):**
  - Nou widget "Posts en Tendència" amb icona de foc 🔥.
  - Obté els posts recents i els ordena per score (likes + comments×2), mostra els top 5.
  - Cada post mostra autor, preview del text (max 100 chars) i estadístiques (❤️ / 💬).
  - Clicable per navegar al post individual.
- **Suggeriments de perfils ("A qui seguir"):**
  - Nou widget with icona de persona+ que mostra fins a 6 usuaris suggerits.
  - Reutilitza l'endpoint del leaderboard filtrant l'usuari actual.
  - Botó "Seguir"/"Siguiendo" funcional amb `followService.toggleFollowUser()`.
  - El botó canvia d'estil (teal → border) i mostra "Siguiendo" en hover vermell per deseleccionar.
- **Filtres als resultats de cerca:**
  - Afegida barra de filtres amb 3 tabs: "Todo" / "Usuarios" / "Publicaciones".
  - Cada tab mostra el comptador de resultats.
  - Filtratge instantani al frontend sense re-fetch.
- **Categories amb filtre real per tag:**
  - Les categories ara tenen un `tag` slug associat (frontend, backend, devops, etc.).
  - Clicar una categoria llença una cerca amb el nom de la categoria.
  - Estat visual actiu (teal highlight) quan una categoria està seleccionada.
  - Deseleccionar la categoria neteja els resultats.
- **Eliminat títol "Inicio" del Feed:**
  - `Feed.jsx`: eliminat `<h1>` amb el títol redundant.
  - Les tabs "Para ti" / "Siguiendo" / "Dudas" queden directament sota el header.
- **Traduccions afegides (es, ca, en):**
  - `explore.filter_all`, `explore.filter_posts`
  - `explore.trending_posts`, `explore.no_trending`
  - `explore.who_to_follow`, `explore.no_suggestions`
  - `explore.follow`, `explore.following`
- **Fitxers modificats:**
  - `client/src/pages/Explore.jsx` + `.css`
  - `client/src/components/feed/Feed.jsx`
  - `client/src/locales/{es,ca,en}.json`
- **Emojis substituïts per icones SVG:**
  - Categories: 🎨⚙️🚀🗄️📱🔒 → FrontendIcon, BackendIcon, DevopsIcon, DatabaseIcon, MobileIcon, SecurityIcon
  - Stats trending posts: ❤️💬 → HeartIcon, CommentIcon

### 2026-02-25 – Millores del Feed (Syntax Highlight, Infinite Scroll, Skeleton Loaders, Share, Imatge, Links, Welcome Card)

- **Autor:** @copilot (IA)
- **Syntax Highlighting (highlight.js):**
  - Instal·lat `highlight.js ^11.11.1` com a dependència.
  - `PostCard.jsx` detecta blocs `<code>` dins del contingut i aplica `hljs.highlightElement()` amb el tema `github-dark`.
  - Estils personalitzats per sobreescriure el fons de `code.hljs` i mantenir coherència visual.
- **Infinite Scroll:**
  - Eliminat botó "Carregar més" de `Feed.jsx`.
  - Implementat `IntersectionObserver` amb un `<div>` sentinel i `rootMargin: "200px"` per carregar automàticament la següent pàgina.
  - Spinner de càrrega mostrat mentre es recuperen dades.
- **Skeleton Loaders:**
  - Creat component `PostSkeleton` a `Feed.jsx` amb animació `skeletonPulse`.
  - Es mostren 3 skeletons mentre el feed es carrega inicialment (substitueix la pantalla buida).
- **Welcome Card:**
  - Creat component `WelcomeCard` a `Feed.jsx` per a usuaris nous.
  - Mostra 3 tips: com compartir codi, com fer preguntes, i com seguir gent.
  - Es detecta via `isNewUser` del `useAuth()`.
- **Share Button (Copiar enllaç):**
  - Nou botó de compartir a `PostCard.jsx` amb `navigator.clipboard.writeText()`.
  - Feedback visual "Link copied!" amb animació `fadeIn` durant 2 segons.
- **Link Preview:**
  - `PostCard.jsx` detecta URLs dins del contingut amb regex.
  - Mostra un preview with icona 🔗, domini i URL truncada sota el contingut del post.
- **Temps Relatiu Auto-actualitzat:**
  - Creat hook `useRelativeTime` dins de `PostCard.jsx` que actualitza el temps cada minut amb `setInterval`.
  - Mostra "hace X minutos", "hace X horas", "ayer", etc.
- **Millora del Badge de Pregunta:**
  - `PostCard.jsx` ara mostra un badge amb gradient i icona SVG per a preguntes (obert ↔ resolt).
  - Variants `--open` (taronja) i `--solved` (verd) amb icones diferenciades.
- **Image Upload UI (Frontend Ready):**
  - `PostInput.jsx`: botó d'imatge obre un `<input type="file">` ocult.
  - Preview de la imatge seleccionada amb botó d'eliminar.
  - `PostCard.jsx` mostra `post.image_url` si existeix.
  - ⚠️ El backend encara no suporta camps d'imatge als posts.
- **Link Input Panel:**
  - `PostInput.jsx`: el botó de cadena (🔗) obre un panell per introduir una URL.
  - La URL s'insereix al contingut del textarea amb suport Enter i botó "Afegir".
- **Traduccions afegides (es, ca, en):**
  - `feed.share`, `feed.link_copied`, `feed.open_question`
  - `feed.welcome_title`, `feed.welcome_text`, `feed.welcome_tip_code`, `feed.welcome_tip_question`, `feed.welcome_tip_follow`
  - `feed.link_placeholder`, `feed.add_link_btn`
- **Fitxers modificats:**
  - `client/package.json` (+ highlight.js)
  - `client/src/components/feed/PostCard.jsx` + `.css`
  - `client/src/components/feed/Feed.jsx` + `.css`
  - `client/src/components/feed/PostInput.jsx` + `.css`
  - `client/src/locales/{es,ca,en}.json`

### 2026-02-25 – Redisseny Login i Google OAuth

- **Autor:** @copilot (IA)
- **Redisseny de la pantalla de Landing/Login:**
  - Eliminat el **footer** complet (marca, text, etc.).
  - Mogut el **`LanguageSwitcher`** a la cantonada superior dreta (`.landing__top-bar`).
  - Afegit **botó "Continuar amb Google"** amb icona SVG oficial dels colors de Google.
  - Afegit **divisor** ("o continuar amb") entre el formulari i el botó de Google.
  - Substituïts estils inline del spinner per classe CSS reutilitzable `.auth-card__spinner`.
  - Estils nous: `.auth-card__google-btn`, `.auth-card__spinner`, `.landing__top-bar`.
- **Integració Google OAuth al Frontend:**
  - Creat **`GoogleCallback.jsx`** (`/auth/google/callback`): captura el `code` de la URL de redirecció de Google, l'envia al backend (`POST /api/auth/google/callback`) i redirigeix a `/`.
  - Afegit **`loginWithGoogle(code)`** a `AuthContext.jsx`: gestiona l'intercanvi code→token amb el backend i actualitza l'estat global d'autenticació.
  - Ruta `/auth/google/callback` registrada al router (`router/index.jsx`).
- **Traduccions i18n (3 idiomes: es, ca, en):**
  - `landing.or_continue_with`, `landing.google_login`
  - `landing.errors.google_failed`, `landing.errors.google_no_code`
  - `landing.messages.redirecting`, `landing.messages.google_processing`, `landing.messages.passwords_dont_match`
- **Flux complet Google OAuth:**
  - 1. Usuari clica "Continuar amb Google" → frontend crida `GET /api/auth/google/redirect`
  - 2. Backend retorna URL de Google → frontend redirigeix el navegador
  - 3. Google autentica → redirigeix a `http://localhost:5173/auth/google/callback?code=XXX`
  - 4. `GoogleCallback.jsx` captura el code → `POST /api/auth/google/callback` → token Sanctum
  - 5. Redirecció a `/` amb sessió activa

### 2026-02-26 – UX Navegación Chat-Perfil

- **Autor:** @copilot (IA)
- **Chat → Perfil:**
  - `Messages.jsx`: L'avatar i nom al header del xat ara són clickables per navegar al perfil de l'usuari (`/profile/{username}`).
  - CSS nou: `.msg__chat-user-link` amb efecte hover (background i color teal al passar el ratolí).
- **Perfil → Chat:**
  - `Profile.jsx`: Afegit botó de missatge (icona bombolla) al costat del botó Follow/Unfollow als perfils d'altres usuaris.
  - En clicar redirigeix a `/messages?user={id}` per iniciar/obrir conversa directament.
  - CSS nou: `.profile-guay__btn--message` amb icona SVG i transició hover a teal.
- **Traduccions (es, ca, en):**
  - `profile.sendMessage`: "Enviar mensaje" / "Enviar missatge" / "Send message".
- **Fitxers modificats:**
  - `client/src/pages/Messages.jsx` / `.css`
  - `client/src/components/profile/Profile.jsx` / `.css`
  - `client/src/locales/{es,ca,en}.json`

### 2026-03-05 – Missatges Real-Time, Notificacions i Responsive Mòbil

- **Autor:** @copilot (IA)
- **Traduccions pàgina Missatges (i18n):**
  - `Messages.jsx` ara utilitza `useTranslation()` per a tot el text de la UI.
  - Noves claus: `messages.title`, `messages.search_placeholder`, `messages.no_conversations`, `messages.select_conversation`, `messages.start_conversation`, `messages.type_message`, `messages.send`, `messages.restriction_limit`, `messages.restriction_first`, `messages.new_conversation`, `messages.search_users`, `messages.no_users_found`, `messages.start_chat`.
  - Traduccions afegides a `es.json`, `ca.json`, `en.json`.
- **Notificacions de Missatges:**
  - Backend (`ChatController`) crea notificació tipus `message` quan s'envia un missatge.
  - Frontend (`Notifications.jsx`) mostra notificacions de missatge amb icona de sobre i redirigeix a `/messages?user={senderId}`.
  - CSS nou: `.notif__icon--message` amb color teal.
- **Badges de No Llegits al Sidebar:**
  - `SocketContext.jsx` gestiona `unreadCount` (notificacions) i `unreadMessagesCount` (missatges) globalment.
  - `Sidebar.jsx` mostra badges vermells amb comptador a les icones de notificacions i missatges.
  - CSS nou: `.sidebar__nav-badge` estil badge mínim.
- **Tracking de Conversa Activa:**
  - `SocketContext.jsx` inclou `activeConversationRef` per evitar incrementar el comptador de no llegits si el missatge és de la conversa que estàs veient.
  - `Messages.jsx` crida `setActiveChat(userId)` en obrir conversa i `setActiveChat(null)` en tancar.
- **Fix Real-Time Chat:**
  - Corregit `socket/index.js`: extreu correctament `result.data.message` de la resposta API (abans accedia a `result.message` que és el text d'èxit).
  - Afegida emissió a la room personal `user.{receiverId}` perquè el receptor rebi el missatge encara que no tingui el xat obert.
- **Responsive Mòbil:**
  - `MainLayout.jsx`: Afegits botons de missatges i notificacions al header mòbil amb badges de comptador.
  - CSS nou: `.mobile-header__badge` per a badges al header mòbil.
  - `Sidebar.css`: Reduït bottom nav mòbil a només 3 ítems (Home, Explore, Center) – notificacions i perfil accessibles des del header.
- **Fitxers modificats:**
  - `client/src/pages/Messages.jsx`
  - `client/src/pages/Notifications.jsx` / `.css`
  - `client/src/context/SocketContext.jsx`
  - `client/src/components/layout/Sidebar.jsx` / `.css`
  - `client/src/components/layout/MainLayout.jsx` / `.css`
  - `client/src/locales/{es,ca,en}.json`
  - `socket/index.js`
  - `api/app/Http/Controllers/ChatController.php`
  - `api/app/Services/ChatService.php`

### 2026-03-05 – Correccions UI i Fix Botó Seguir a Explore

- **Autor:** @copilot (IA)
- **Eliminat Botó "Publicar" del Sidebar:**
  - Eliminat el botó gran de "Publicar" que apareixia a la barra lateral perquè no calia.
- **Fix Filtre Notificacions de Centre:**
  - Afegits tipus de notificació `center_request_approved`, `center_request_rejected`, `center_announcement`, `center_post` al mapNotificationType de `Notifications.jsx`.
  - Ara les notificacions relacionades amb centres es filtren correctament sota la categoria "school".
- **Botó de Missatge més Gran al Perfil:**
  - Augmentat el tamany del botó de missatge a `Profile.jsx` de 32x32px a 44x44px.
  - SVG ara usa 100% width/height per adaptar-se al contenidor CSS.
- **Fix Estat Botó Seguir a Explore:**
  - Backend: `ProfileController::leaderboard()` canviat per usar `Auth::guard('sanctum')->user()` per obtenir correctament l'usuari autenticat en ruta pública.
  - Frontend: `Explore.jsx` inicialitza correctament el `followingMap` amb el camp `is_following` de l'API.
  - Resultat: Els usuaris ja seguits mostren "Siguiendo" correctament a la secció "A quien seguir".
- **Fitxers modificats:**
  - `client/src/components/layout/Sidebar.jsx`
  - `client/src/pages/Notifications.jsx`
  - `client/src/components/profile/Profile.jsx` / `.css`
  - `client/src/pages/Explore.jsx`
  - `api/app/Http/Controllers/ProfileController.php`

### 2026-03-05 – Millores Responsive Mòbil (Login, Sidebar, Explore)

- **Autor:** @copilot (IA)
- **Login Mòbil Simplificat:**
  - En pantalles < 640px, el contingut del hero (badge, títol, subtítol, features) s'oculta completament.
  - Només es mostra el formulari d'autenticació centrat a la pantalla.
  - Afegit `min-height: 100dvh` i `align-content: center` per centrar el card.
- **Fix Candau Centre a Mòbil:**
  - Reemplaçat l'emoji 🔒 per un icona SVG que es renderitza consistentment.
  - En desktop: mostra l'icona de candau al costat del text "Centre".
  - En mòbil: l'icona de candau s'oculta per estalviar espai, però l'ítem es veu amb opacitat reduïda (0.45) i `cursor: not-allowed`.
- **Explore Responsive Millorat:**
  - Afegit `max-width: 100%` i `box-sizing: border-box` a tots els contenidors.
  - Widgets amb `overflow: hidden` per evitar desbordament horitzontal.
  - Text llarg de trends i usuaris suggerits es trunca amb `text-overflow: ellipsis`.
  - Grid i resultats de cerca amb `width: 100%` i `max-width: 100vw`.
- **Fitxers modificats:**
  - `client/src/pages/Landing.css`
  - `client/src/components/layout/Sidebar.jsx` / `.css`
  - `client/src/pages/Explore.css`

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
│       ├── Icons.jsx                # Icones SVG reutilitzables
│       └── LanguageSwitcher.jsx / LanguageSwitcher.css # Selector d'idioma
├── context/
│   └── AuthContext.jsx              # Provider auth global (login/register/logout/emailVerified/refreshUser)
├── hooks/
│   └── useAuth.js                   # Hook per consumir AuthContext
├── i18n.js                          # Configuració i18next
├── locales/                         # Fitxers de traducció (ca, es, en)
├── pages/
│   ├── Landing.jsx / Landing.css    # Welcome + Auth + Google OAuth + Feedback UX
│   ├── GoogleCallback.jsx           # Callback per Google OAuth (captura code)
│   ├── Home.jsx                     # Wrapper per Feed
│   ├── Explore.jsx / Explore.css    # Cerca + Descobriment
│   ├── Notifications.jsx / Notifications.css # Activitat
│   ├── CenterHub.jsx / CenterHub.css # Hub institucional
│   ├── EmailVerification.jsx / .css # Pantalla verificació email pendent
│   ├── ProfilePage.jsx              # Wrapper per Profile
│   ├── Messages.jsx / Messages.css  # Sistema de xat complet amb restriccions de seguiment
│   └── More.jsx                     # Menú addicional
├── router/
│   └── index.jsx                    # Rutes protegides + públiques + VerifiedRoute
├── services/
│   ├── api.js                       # Client HTTP (amb Bearer token auto + upload)
│   ├── chatService.js               # Serveis xat (converses, missatges, marcar llegit)
│   ├── socketService.js             # Client Socket.io (connexió, rooms, events P2P)
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
