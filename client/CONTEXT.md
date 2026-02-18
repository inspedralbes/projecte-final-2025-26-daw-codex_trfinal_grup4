# 🖥️ CONTEXT – Frontend (React + Vite)

> **Directrius i registre de canvis per a la carpeta `client/`.**
> Llegeix SEMPRE aquest fitxer abans de treballar al frontend.

---

## 📌 Informació del servei

| Camp | Valor |
|---|---|
| **Framework** | React 18 (JS pur, sense TypeScript) |
| **Bundler** | Vite 5 |
| **Routing** | React Router DOM v7 |
| **Port dev** | 5173 (directe) / 8080 (via Nginx) |
| **Contenidor** | `tfg_client_dev` |
| **Directori al contenidor** | `/app` |

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
   const API = import.meta.env.VITE_API_URL || '/api';
   ```
2. **Socket.io:** Connecta sempre via la variable `VITE_SOCKET_URL`:
   ```js
   const SOCKET = import.meta.env.VITE_SOCKET_URL || '';
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
| Variable | Valor (dev) | Descripció |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/api` | URL base de l'API |
| `VITE_SOCKET_URL` | `http://localhost:8080` | URL base de Socket.io |

---

## 📅 Registre de canvis

### 2026-02-13 – Infraestructura inicial
- **Autor:** @chuclao
- Creat `Dockerfile` multi-stage (dev/prod)
- Creat `package.json` amb React 18 + Vite 5
- Creat `vite.config.js` configurat per Docker
- Creat `index.html` base
- Creat `src/main.jsx` amb ReactDOM.createRoot

### 2026-02-17 – Estructura base React Router
- **Autor:** @chuclao
- Afegit `react-router-dom` v7
- Creat `src/App.jsx` amb Routes
- Creat `src/pages/Home.jsx` com a pàgina inicial
- Configurat `BrowserRouter` a `main.jsx`

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

---

## 📚 Documentació Relacionada

*   **Visió Global del Projecte:** [../doc/PROJECT_CONCEPT.md](../doc/PROJECT_CONCEPT.md)
*   **Backend (API):** [../api/CONTEXT.md](../api/CONTEXT.md)
*   **Real-time (Socket):** [../socket/CONTEXT.md](../socket/CONTEXT.md)
