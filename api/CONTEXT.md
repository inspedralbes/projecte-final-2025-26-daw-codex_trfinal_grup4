# 🔧 CONTEXT – Backend (Laravel 11)

> **Directrius i registre de canvis per a la carpeta `api/`.**
> Llegeix SEMPRE aquest fitxer abans de treballar al backend.

---

## 📌 Informació del servei

| Camp | Valor |
|---|---|
| **Framework** | Laravel 11 |
| **PHP** | 8.3-FPM Alpine |
| **Base de dades** | MySQL 8.0 |
| **Caché/Sessions/Cues** | Redis 7 |
| **Correu (dev)** | Mailpit (SMTP :1025) |
| **Port** | 9000 (FastCGI intern, no exposat) |
| **Accés** | `http://localhost:8080/api` (via Nginx) |
| **Contenidor** | `tfg_api_dev` |
| **Directori al contenidor** | `/var/www/html` |

---

## ✅ QUÈ POTS FER

- Crear models a `app/Models/`
- Crear controllers a `app/Http/Controllers/`
- Crear migracions a `database/migrations/`
- Crear seeders a `database/seeders/`
- Crear middleware a `app/Http/Middleware/`
- Crear requests (Form Requests) a `app/Http/Requests/`
- Crear resources (API Resources) a `app/Http/Resources/`
- Crear events i listeners a `app/Events/` i `app/Listeners/`
- Crear jobs (cues) a `app/Jobs/`
- Crear policies a `app/Policies/`
- Definir rutes API a `routes/api.php`
- Instal·lar paquets via Composer
- Crear tests a `tests/`
- Configurar fitxers a `config/`
- Crear commands Artisan a `app/Console/Commands/`

## ❌ QUÈ NO POTS FER

- **NO modificar el `Dockerfile`** — Està a la infraestructura compartida
- **NO modificar `docker-compose.*.yml`** — Gestió centralitzada
- **NO modificar `routes/web.php`** per a l'API — Utilitza `routes/api.php`
- **NO crear vistes Blade per al frontend** — El frontend és React (carpeta `client/`)
- **NO modificar `.env` manualment per canviar ports o hosts Docker** — Estan coordinats amb el `docker-compose`
- **NO canviar el driver de BD** — Ha de ser MySQL
- **NO instal·lar Laravel Breeze/Jetstream/UI** — El frontend és separat
- **NO tocar `public/index.php`** ni `bootstrap/app.php` tret que sigui estrictament necessari
- **NO crear fitxers fora de `api/`** — Cada servei és independent
- **NO desactivar CORS** — L'API ha de permetre peticions del frontend

## ⚠️ REGLES IMPORTANTS

1. **Totes les rutes API han d'anar a `routes/api.php`:**
   ```php
   // ✅ Correcte
   Route::prefix('v1')->group(function () {
       Route::apiResource('users', UserController::class);
   });
   ```

2. **Totes les respostes han de ser JSON:**
   ```php
   // ✅ Correcte
   return response()->json(['data' => $users], 200);

   // ✅ Millor – usar API Resources
   return UserResource::collection($users);
   ```

3. **Prefix de rutes:** L'API s'accedeix via `/api` (gestionat per Nginx). Les rutes a `routes/api.php` ja tenen el prefix `/api` automàticament per Laravel. Per tant:
   - Ruta definida: `Route::get('/users', ...)` → URL final: `/api/users`

4. **Autenticació:** Utilitza Laravel Sanctum per a tokens API.

5. **Validació:** Utilitza sempre Form Requests per validar dades d'entrada:
   ```php
   // ✅ Correcte
   public function store(StoreUserRequest $request) { ... }

   // ❌ Incorrecte
   public function store(Request $request) {
       $request->validate([...]); // No fer inline
   }
   ```

6. **Migracions:** Cada canvi a la BD ha de tenir la seva migració. Mai modificar migracions ja executades — crea'n una de nova.

7. **Execució de comandes Artisan:**
   ```bash
   docker compose -f docker-compose.dev.yml exec api php artisan <comanda>
   ```

8. **Estructura de resposta estàndard:**
   ```json
   {
     "status": "success",
     "data": { },
     "message": "Operació completada"
   }
   ```
   Per errors:
   ```json
   {
     "status": "error",
     "message": "Descripció de l'error",
     "errors": { }
   }
   ```

---

## 🔧 Configuració actual

### Connexions (definides a `api/.env`)
| Servei | Host | Port | Credencials |
|---|---|---|---|
| MySQL | `mysql` | 3306 | `tfg_user` / `tfg_password` |
| Redis | `redis` | 6379 | sense password (dev) |
| Mailpit | `mailpit` | 1025 | - |

### Drivers configurats
| Funció | Driver |
|---|---|
| Base de dades | `mysql` |
| Caché | `redis` |
| Sessions | `redis` |
| Cues | `redis` |
| Broadcasting | `redis` |
| Correu | `smtp` (Mailpit) |

### Extensions PHP disponibles
`pdo_mysql`, `bcmath`, `redis`, `zip`, `gd`, `intl`, `mbstring`, `opcache`, `xdebug` (dev)

---

## 📅 Registre de canvis

### 2026-02-13 – Infraestructura inicial
- **Autor:** @chuclao
- Creat `Dockerfile` multi-stage PHP 8.3-FPM (dev/prod)
- Creat `composer.json` placeholder
- Creat `public/index.php` placeholder (health check)
- Creat `.env` amb connexions Docker

### 2026-02-17 – Instal·lació Laravel 11
- **Autor:** @chuclao
- Instal·lat Laravel 11 complet (`composer create-project`)
- Executat `composer install` dins del contenidor
- Generat `APP_KEY`
- Verificat que PHP-FPM respon correctament via Nginx
- Laravel retorna 404 a `/api` (correcte: no hi ha rutes definides encara)

### 2026-02-17 – Models, Enums, Middleware i estructura base
- **Autor:** @chuclao (amb IA)
- Creats **Enums**: `PostType` (news/question), `UserRole` (admin/userNormal/student/teacher) a `app/Enums/`
- Completats **Models Eloquent** amb `$fillable`, casts i relacions:
  - `User.php`: relacions center, posts, comments, followers, following, likedPosts, bookmarkedPosts, followedTags
  - `Center.php`: relacions users, posts
  - `Post.php`: SoftDeletes, relacions user, center, originalPost, reposts, comments, tags, likedByUsers, bookmarkedByUsers
  - `Comment.php`: relacions user, post, parent, replies
  - `Tag.php`: relacions posts, users (amb pivot notify)
  - `ChatMessage.php`: relacions sender, receiver, center
- Creat **Middleware** `ForceJsonResponse` a `app/Http/Middleware/` (força `Accept: application/json`)
- Creat **Trait** `ApiResponse` a `app/Traits/` amb mètodes `success()` i `error()`
- Configurat `bootstrap/app.php`: registre de rutes API i middleware ForceJsonResponse
- Creat `routes/api.php` amb ruta `/health`
- Netejat `routes/web.php` (API-only)
- Actualitzat `UserFactory.php` amb camps username, role i states (student, teacher, admin)
- Creades carpetes amb `.gitkeep`: Exceptions, Requests, Resources, Services, Traits

### 2026-02-18 – US#1: Sistema de Registre amb Detecció de Centre
- **Autor:** @chuclao (amb IA)
- Instal·lat **Laravel Sanctum v4** per a autenticació API per tokens
- Afegit trait `HasApiTokens` al model `User`
- Creat **`AuthService`** a `app/Services/`:
  - `register()`: crea usuari, detecta domini email → assigna `center_id` i role (`student` si centre trobat, `userNormal` si no)
  - `extractDomain()`: extreu el domini d'un email
  - `detectCenter()`: comprova si un domini correspon a un centre registrat
- Creat **`AuthController`** a `app/Http/Controllers/`:
  - `POST /api/register` — Registre amb auto-detecció de centre
  - `POST /api/login` — Login amb token Sanctum
  - `POST /api/logout` — Logout (auth:sanctum)
  - `GET /api/me` — Usuari autenticat amb info del centre
  - `POST /api/check-domain` — Endpoint públic per verificar si un email pertany a un centre
- Creats **FormRequests**:
  - `RegisterRequest`: name, username (unique, alphanum_), email (unique), password (min:8, confirmed)
  - `LoginRequest`: email, password
- Actualitzat `routes/api.php` amb rutes d'autenticació (públiques i protegides amb `auth:sanctum`)

---

## 📚 Documentació Relacionada

*   **Visió Global del Projecte:** [../doc/PROJECT_CONCEPT.md](../doc/PROJECT_CONCEPT.md)
*   **Frontend (Cliente):** [../client/CONTEXT.md](../client/CONTEXT.md)
*   **Real-time (Socket):** [../socket/CONTEXT.md](../socket/CONTEXT.md)
