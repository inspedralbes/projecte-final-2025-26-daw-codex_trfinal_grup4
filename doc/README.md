# 📚 Documentació Tècnica de Codex

Benvingut a la documentació tècnica del projecte. Aquest és el punt d'entrada per a qualsevol persona que vulgui entendre com funciona el sistema o vulgui contribuir al codi.

## 🗺️ Índex de Documentació

| Document | Descripció |
| --- | --- |
| [🏗️ Arquitectura](./ARCHITECTURE.md) | Visió global del sistema, components i fluxos de dades. |
| [📡 API Reference](./API.md) | Documentació dels endpoints de l'API REST de Laravel. |
| [💻 Frontend](./FRONTEND.md) | Estructura de React, components i gestió de l'estat. |
| [🤝 Contributing](./CONTRIBUTING.md) | Guia per a nous desenvolupadors i estàndards de codi. |
| [📝 Project Concept](./PROJECT_CONCEPT.md) | Descripció funcional i objectius del projecte. |

---

## 🏗️ Resum de l'Arquitectura

El projecte Codex utilitza una arquitectura de microserveis containeritzada:

- **Backend:** Laravel 11 (API REST).
- **Frontend:** React + Vite (SPA).
- **Real-time:** Node.js + Socket.io.
- **Base de dades:** MySQL + Redis.
- **Proxy:** Nginx actua com a punt d'entrada únic.

Pots veure el diagrama detallat a [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 💻 Entorn de Desenvolupament Ràpid

Si vols començar a programar ara mateix, segueix aquests passos:

1. **Requisits:** Docker i Docker Compose instal·lats.
2. **Setup:**
   ```bash
   git clone https://github.com/inspedralbes/projecte-final-2025-26-daw-codex_trfinal_grup4.git
   cd projecte-final-2025-26-daw-codex_trfinal_grup4
   git checkout dev
   chmod +x init-dev.sh && ./init-dev.sh
   ```
3. **Accés:**
   - App: `http://localhost:8080`
   - API: `http://localhost:8080/api`
   - Adminer (BD): `http://localhost:8081`

Per a més detalls sobre com contribuir, consulta [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## 👥 Equip de Desenvolupament

| Nom             | Rol            |
| --------------- | -------------- |
| Izan De La Cruz | Desenvolupador |
| Marc Rojano     | Desenvolupador |
| Iker Delgado    | Desenvolupador |
| Pol Díaz        | Desenvolupador |

