# 💻 Documentació del Frontend

El client de Codex està desenvolupat com una **Single Page Application (SPA)** utilitzant React i Vite.

## 📂 Estructura de fitxers (`/client/src`)

L'aplicació segueix una estructura modular:

| Carpeta | Descripció |
| --- | --- |
| `/components` | Components reutilitzables de la interfície (Botons, Inputs, Cards). |
| `/pages` | Components que representen rutes completes (Home, Profile, Login). |
| `/layouts` | Embolcalls per a diferents estructures de pàgina (MainLayout, AuthLayout). |
| `/services` | Funcions per a realitzar crides a l'API (utilitzant Axios). |
| `/context` | Gestió de l'estat global mitjançant Context API (AuthContext, ThemeContext). |
| `/hooks` | Hooks personalitzats per a encapsular lògica reutilitzable. |
| `/router` | Definició de rutes amb React Router. |
| `/locales` | Fitxers de traducció (i18next) per al suport multiidioma. |

---

## 🎨 Estilisme

S'utilitza **Vanilla CSS** amb variables de CSS per al sistema de disseny. Això permet una gran flexibilitat i un rendiment òptim.

- **Variables globals:** Definides a `src/styles/variables.css`.
- **Temes:** Suport per a mode clar i fosc.

---

## 🔐 Gestió d'Autenticació

L'estat de l'usuari es gestiona a `src/context/AuthContext.jsx`.
- El token de Sanctum es guarda automàticament en una cookie (o localStorage segons config).
- S'utilitzen **PrivateRoutes** per protegir l'accés a pàgines que requereixen estar loguejat.

---

## 🌐 Multiidioma (i18n)

L'app suporta Català, Castellà i Anglès.
- Les traduccions es troben a `src/locales/`.
- Per afegir una nova traducció, s'ha d'actualitzar el fitxer JSON corresponent i utilitzar el hook `useTranslation()` de `react-i18next`.

---

## 🚀 Començar a desenvolupar

1. Entra a la carpeta del client: `cd client`
2. Instal·la dependències: `npm install`
3. Executa el servidor de desenvolupament: `npm run dev`
4. L'app estarà disponible a `http://localhost:5173`.
