# 🔧 CONTEXT – Backend (Laravel 11)

> **Directrius i registre de canvis per a la carpeta `api/`.**
> Llegeix SEMPRE aquest fitxer abans de treballar al backend.

---

## 📌 Informació del servei

| Camp                        | Valor                                   |
| --------------------------- | --------------------------------------- |
| **Framework**               | Laravel 11                              |
| **PHP**                     | 8.3-FPM Alpine                          |
| **Base de dades**           | MySQL 8.0                               |
| **Caché/Sessions/Cues**     | Redis 7                                 |
| **Correu (dev)**            | Mailpit (SMTP :1025)                    |
| **Port**                    | 9000 (FastCGI intern, no exposat)       |
| **Accés**                   | `http://localhost:8080/api` (via Nginx) |
| **Contenidor**              | `tfg_api_dev`                           |
| **Directori al contenidor** | `/var/www/html`                         |

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

6. **Migracions (Entorn de testing):** Estem en fase de desenvolupament/testing. **NO crear migracions noves.** Modifica directament l'esquema principal a `database/migrations/2025_02_17_000000_create_full_schema.php` i executa `php artisan migrate:fresh --seed` per recrear la BD.

7. **Execució de comandes Artisan:**

    ```bash
    docker compose -f docker-compose.dev.yml exec api php artisan <comanda>
    ```

8. **Estructura de resposta estàndard:**
    ```json
    {
        "status": "success",
        "data": {},
        "message": "Operació completada"
    }
    ```
    Per errors:
    ```json
    {
        "status": "error",
        "message": "Descripció de l'error",
        "errors": {}
    }
    ```

---

## 🔧 Configuració actual

### Connexions (definides a `api/.env`)

| Servei  | Host                              | Port | Credencials                           |
| ------- | --------------------------------- | ---- | ------------------------------------- |
| MySQL   | `mysql`                           | 3306 | `tfg_user` / `tfg_password`           |
| Redis   | `redis`                           | 6379 | sense password (dev)                  |
| Mail    | `mail.codex.daw.inspedralbes.cat` | 25   | `noreply` (auth via Hestia)           |

### Drivers configurats

| Funció        | Driver           |
| ------------- | ---------------- |
| Base de dades | `mysql`          |
| Caché         | `redis`          |
| Sessions      | `redis`          |
| Cues          | `redis`          |
| Broadcasting  | `redis`          |
| Correu        | `smtp` (Hestia)  |

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
    - `RegisterRequest`: name, username (unique, alphanum\_), email (unique), password (min:8, confirmed)
    - `LoginRequest`: email, password
- Actualitzat `routes/api.php` amb rutes d'autenticació (públiques i protegides amb `auth:sanctum`)

### 2026-02-18 – US#2: Feed Global i Publicació Simple

- **Autor:** @chuclao (amb IA)
- Creat **`PostController`** a `app/Http/Controllers/`:
    - `GET /api/posts` — Feed global paginat (públic, sense auth)
    - `GET /api/posts/{post}` — Detall d'un post (públic)
    - `POST /api/posts` — Crear post (auth:sanctum), auto-assigna `center_id` de l'usuari
    - `DELETE /api/posts/{post}` — Soft-delete, només l'autor pot eliminar
- Creat **`StorePostRequest`** a `app/Http/Requests/`:
    - Validació: content (requerit sense code), code_snippet (requerit sense content), code_language, type (enum), tags (array max 5)
- Creat **`PostResource`** a `app/Http/Resources/`:
    - Transforma posts amb user, center, tags, i comptadors (likes, comments, bookmarks)
- Tags: es creen automàticament si no existeixen (firstOrCreate amb slug)

### 2026-02-18 – US#3: Sanitització Markdown/XSS

- **Autor:** @chuclao (amb IA)
- Instal·lat **stevebauman/purify** (wrapper HTMLPurifier per Laravel)
- Creat **`SanitizationService`** a `app/Services/`:
    - `sanitizeHtml()`: neteja HTML perillós (scripts, events) però manté tags segurs (`<p>`, `<b>`, etc.)
    - `sanitizeCode()`: escapa tot l'HTML amb `htmlspecialchars` (codi es guarda com text pla segur)
    - `sanitizePlain()`: `strip_tags` per camps de text pla (com `code_language`)
- Integrat al **`PostController@store`**: content, code_snippet i code_language es sanititzen abans de guardar

### 2026-02-18 – US#5: Hub Privat (Walled Garden) i Etiquetes per Centre

- **Autor:** @chuclao (amb IA)
- Actualitzat **`PostController`**:
    - `GET /api/posts` — Ara filtra només posts globals (`center_id IS NULL`), suporta filtre per `?tag=slug`
    - `GET /api/center/posts` — Nou endpoint: feed exclusiu del centre de l'usuari (auth:sanctum), filtre per tag
- Creat **`TagController`** a `app/Http/Controllers/`:
    - `GET /api/tags` — Llista totes les etiquetes amb comptador de posts (públic)
    - `GET /api/center/tags` — Etiquetes usades dins del centre de l'usuari (auth:sanctum)

### 2026-02-18 – US#6: Broadcasting Redis + Comentaris

- **Autor:** @chuclao (amb IA)
- Creat **`CommentController`** a `app/Http/Controllers/`:
    - `GET /api/posts/{postId}/comments` — Llista comentaris d'un post amb estructura threaded (públic)
    - `POST /api/comments` — Crear comentari (auth:sanctum), sanititza contingut, llança event broadcast
    - `DELETE /api/comments/{comment}` — Eliminar comentari, només l'autor pot fer-ho (auth:sanctum)
- Creat **`StoreCommentRequest`** a `app/Http/Requests/`:
    - Validació: post_id (required, exists), parent_id (nullable, exists, same post), content (required, max:5000)
- Creat **`NewCommentEvent`** a `app/Events/`:
    - Implementa `ShouldBroadcastNow` (dispatx síncron a Redis, sense cua)
    - Broadcast al canal `post.{post_id}` amb nom d'event `new.comment`
    - Payload: id, post_id, parent_id, content, created_at, user (id, name, username, avatar)
- Comentaris amb respostes anidades (replies) via relació `parent_id`
- Integrat **SanitizationService** per netejar contingut dels comentaris

### 2026-02-18 – US#7: Perfil d'Usuari amb Agregacions

- **Autor:** @chuclao (amb IA)
- Creat **`ProfileController`** a `app/Http/Controllers/`:
    - `GET /api/profile/{username}` — Perfil públic amb stats agregades (posts, comments, followers, following, total likes rebuts)
    - `GET /api/profile/{username}/posts` — Posts paginats d'un usuari (públic)
    - `PUT /api/profile` — Actualitzar perfil de l'usuari autenticat (auth:sanctum)
- Stats retornades: `posts_count`, `comments_count`, `followers_count`, `following_count`, `total_likes_received`
- Inclou info del centre i dades de xarxes socials (bio, linkedin, portfolio, external_url)
- Validació d'update: name, bio (max:1000), avatar, linkedin_url, portfolio_url, external_url (totes url vàlides)

### 2026-02-18 – US#8: CRUD Centres amb Estats i Upload de Justificant

- **Autor:** @chuclao (amb IA)
- Afegits camps `status` (enum: pending/active/rejected) i `justificante` (path fitxer) a la taula `centers` a l'esquema principal
- Actualitzat model **`Center`**: nous fillable, scopes `active()` i `pending()`
- Creat **`CenterController`** a `app/Http/Controllers/`:
    - `GET /api/centers` — Llista pública (només actius) / Admin veu tots amb filtre `?status=`
    - `GET /api/centers/{center}` — Detall (públic: només actius, admin: tots)
    - `POST /api/centers` — Crear centre (admin → actiu, usuari normal → pending) amb upload justificant
    - `PUT /api/centers/{center}` — Actualitzar centre (admin only)
    - `DELETE /api/centers/{center}` — Eliminar centre i fitxer justificant (admin only)
    - `PATCH /api/centers/{center}/status` — Canviar estat (approve/reject) (admin only)
- Creat **`EnsureIsAdmin`** middleware a `app/Http/Middleware/` (alias `admin`, retorna 403)
- Registrat alias `admin` a `bootstrap/app.php`
- Creats **FormRequests**: `StoreCenterRequest` i `UpdateCenterRequest`
    - Validació: name, domain (unique), city, logo, website (url), status, justificante (file: pdf/jpg/jpeg/png, max 5MB)
- Upload de justificant a `storage/app/public/justificantes/` via disc `public`
- Creat symlink `public/storage` amb `php artisan storage:link`

### 2026-02-18 – Sprint 2 US#5: Walled Garden – Seguretat, Global Scope i Índexs

- **Autor:** @chuclao (amb IA)
- Creat **`EnsureSameCenter`** middleware a `app/Http/Middleware/`:
    - Compara `center_id` de l'usuari amb el `center_id` del post sol·licitat
    - Retorna 403 si no coincideixen (alias `same-center`)
- Creat **`CenterScope`** (Global Scope) a `app/Models/Scopes/`:
    - Filtra automàticament posts pel `center_id` de l'usuari autenticat
    - S'aplica via `Post::centerFiltered()` (scope local)
- Actualitzat model **`Post`**:
    - Afegit scope `scopeCenterFiltered()` que aplica `CenterScope`
    - Afegit scope `scopeGlobal()` per filtrar posts sense centre
- Actualitzat **`PostController`**:
    - `centerPosts()` ara usa `Post::centerFiltered()` en lloc de filtre manual
    - `index()` ara usa `Post::global()` en lloc de `whereNull`
    - `show()` verifica accés: si el post té `center_id`, només usuaris del mateix centre hi poden accedir
- Afegits **índexs** a la taula `posts` a l'esquema principal:
    - `index('center_id')` — Filtre ràpid per centre
    - `index(['center_id', 'created_at'])` — Feed del centre ordenat
    - `index(['user_id', 'center_id'])` — Posts d'un usuari dins d'un centre
- Registrat alias `same-center` a `bootstrap/app.php`

### 2026-02-18 – Sprint 2 US#6: Interaccions Polimòrfiques + Event NewInteraction

- **Autor:** @chuclao (amb IA)
- Afegida taula **`interactions`** polimòrfica a l'esquema principal:
    - Camps: `id`, `user_id`, `interactable_id`, `interactable_type`, `type` (like/bookmark)
    - Índex únic per evitar duplicats, índex morph per rendiment
- Creat model **`Interaction`** a `app/Models/`:
    - Relació `user()` (BelongsTo), `interactable()` (MorphTo)
- Afegida relació `interactions(): MorphMany` als models **Post** i **Comment**
- Creat **`NewInteractionEvent`** a `app/Events/`:
    - Implementa `ShouldBroadcastNow` (Redis síncron)
    - Broadcast al canal `user.{ownerId}` amb nom `new.interaction`
    - Payload: id, type, interactable_type, interactable_id, user info
    - Només notifica si l'autor del recurs és diferent de l'usuari que interactua
- Creat **`InteractionController`** a `app/Http/Controllers/`:
    - `POST /api/interactions` — Toggle like/bookmark (auth:sanctum). Si existeix, l'elimina; si no, el crea
    - `GET /api/posts/{postId}/interactions` — Comptadors (likes, bookmarks) + estat de l'usuari autenticat
- Suporta interaccions sobre `post` i `comment` (polimòrfic)

### 2026-02-18 – Sprint 2 US#7: Reputació, Medalles i Top Tags al Perfil

- **Autor:** @chuclao (amb IA)
- Creat **`ReputationService`** a `app/Services/`:
    - `calculateReputation()`: punts basats en likes rebuts (code posts ×2, regular ×1, solucions acceptades ×5)
    - `getBadge()`: retorna la medalla actual segons puntuació
    - `getAllBadges()`: retorna totes les medalles amb estat `unlocked`
    - `getTopTags()`: top N etiquetes més usades per l'usuari
- Medalles: 🌱 Newcomer (0), ⭐ Contributor (5), 🌟 Rising Star (25), 💎 Expert (100), 👑 Master (500), 🏆 Legend (1000)
- Actualitzat **`ProfileController::show()`**:
    - Ara retorna `reputation` (score, current_badge, all_badges) i `top_tags`
    - Injecta `ReputationService` via constructor

### 2026-02-18 – Sprint 2 US#8: Approve/Reject Dedicat + Download Justificant

- **Autor:** @chuclao (amb IA)
- Actualitzat **`CenterController`** amb nous endpoints admin:
    - `PATCH /api/centers/{center}/approve` — Canvia estat de PENDING a ACTIVE (error si ja actiu)
    - `PATCH /api/centers/{center}/reject` — Canvia estat a REJECTED (error si ja rebutjat)
    - `GET /api/centers/{center}/justificante` — Descarrega el fitxer justificant (admin only)
- Download retorna el fitxer amb nom descriptiu: `justificante_{domain}.{ext}`
- Gestió d'errors: 404 si no hi ha fitxer o no existeix al disc

### 2026-02-19 – Fluix de Registre de Professor + Gestió de Centre

- **Autor:** @chuclao (amb IA)
- **Esquema BD** (`2025_02_17_000000_create_full_schema.php`):
    - Afegit `creator_id` (FK → users) i `description` (text) a la taula `centers`
    - Afegit `is_blocked` (boolean, default false) a la taula `users`
    - Creada taula **`center_requests`**: id, user_id (FK), center_name, domain, city, website, full_name, justificante, message, status (pending/approved/rejected), admin_notes, timestamps, índexs (status, domain)
    - FK diferida `centers.creator_id` → `users.id` (onDelete set null)
- Creat model **`CenterRequest`** a `app/Models/`:
    - Scopes: `pending()`, `approved()`, `rejected()`
    - Relació: `user()` BelongsTo
- Actualitzat model **`Center`**:
    - Nous fillable: `creator_id`, `description`
    - Nova relació: `creator()` BelongsTo (professor que va sol·licitar el centre)
    - Noves relacions: `teachers()` i `students()` (HasMany amb filtre per role)
- Actualitzat model **`User`**:
    - Nou fillable: `is_blocked`
    - Nou cast: `is_blocked` → boolean
    - Nous helpers: `isAdmin()`, `isTeacher()`, `isStudent()`, `isTeacherOrAdmin()`
    - Noves relacions: `createdCenters()` HasMany, `centerRequests()` HasMany
- Creat **`CenterRequestController`** a `app/Http/Controllers/`:
    - `GET /api/center-requests` — Admin: llista totes les sol·licituds amb filtre `?status=`
    - `GET /api/center-requests/{id}` — Admin: detall d'una sol·licitud
    - `POST /api/center-requests` — Usuari autenticat sol·licita crear centre (requereix `full_name` + `justificante` PDF/imatge)
    - `GET /api/center-requests/my` — Usuari veu les seves sol·licituds
    - `PATCH /api/center-requests/{id}/approve` — Admin aprova: crea centre actiu + promou sol·licitant a teacher + l'assigna al centre (transacció DB)
    - `PATCH /api/center-requests/{id}/reject` — Admin rebutja amb notes opcionals
    - `GET /api/center-requests/{id}/justificante` — Admin descarrega justificant
- Creat **`CenterMemberController`** a `app/Http/Controllers/`:
    - `GET /api/center/members` — Teacher: llista membres del seu centre (filtre per role, is_blocked, search)
    - `GET /api/center/members/{user}` — Teacher: detall d'un membre
    - `PATCH /api/center/members/{user}/role` — Teacher: canvia rol (student ↔ teacher), no pot canviar-se a si mateix
    - `PATCH /api/center/members/{user}/block` — Teacher: bloqueja un alumne (no pot bloquejar altres teachers ni admins)
    - `PATCH /api/center/members/{user}/unblock` — Teacher: desbloqueja un alumne
    - `DELETE /api/center/members/{user}` — Teacher: expulsa un membre del centre (center_id=null, role=userNormal)
- Creat **`EnsureIsTeacher`** middleware a `app/Http/Middleware/` (alias `teacher`, permet teacher + admin)
- Creat **`EnsureNotBlocked`** middleware a `app/Http/Middleware/` (alias `not-blocked`, retorna 403 si `is_blocked=true`)
- Registrats nous alias a `bootstrap/app.php`: `teacher`, `not-blocked`
- Totes les rutes protegides ara inclouen middleware `not-blocked` (usuaris bloquejats no poden interactuar)
- Creat **`StoreCenterRequestRequest`** a `app/Http/Requests/`:
    - Validació: center_name (required), domain (required, unique:centers), full_name (required), justificante (required, file: pdf/jpg/jpeg/png, max 5MB), message (optional)
- Actualitzat **`AuthService`**:
    - `register()`: ara només detecta centres **actius** (no pending/rejected)
    - `detectCenter()`: retorna objecte amb `has_center`, `is_pending`, `can_request`
- Actualitzat **`AuthController::checkDomain()`**: retorna `can_request` (indica si l'usuari pot sol·licitar crear un centre per a aquest domini)
- Actualitzat **`CenterController::update()`**: ara permite teachers editar el seu propi centre (no poden canviar `status`)
- Actualitzat **`UpdateCenterRequest`**: afegit camp `description`
- Actualitzat **seeder**: afegit `is_blocked=false` a tots els users, `description` al centre, vinculat `creator_id`, afegit usuari `normaluser` per testing
- **Fluix complet del professor:**
    1. Usuari es registra amb email d'un domini sense centre → `role=userNormal`
    2. Fa `POST /api/center-requests` amb `full_name` + `justificante`
    3. Admin revisa sol·licituds a `GET /api/center-requests?status=pending`
    4. Admin aprova → es crea centre actiu + usuari promogut a `teacher` + vinculat al centre
    5. Futurs registres amb aquell domini → `role=student` al centre
    6. Teacher pot gestionar alumnes: bloquejar, canviar rol, expulsar
    7. Teacher pot editar el portal del seu centre (nom, descripció, logo, etc.)

### 2026-02-19 – Verificació d'Email

- **Autor:** @chuclao (amb IA)
- **Esquema BD** (`2025_02_17_000000_create_full_schema.php`):
    - Afegit `email_verified_at` (timestamp, nullable) a la taula `users`
- Actualitzat model **`User`**:
    - Implementa interfície `MustVerifyEmail` (Illuminate\Contracts\Auth\MustVerifyEmail)
    - Override `sendEmailVerificationNotification()` amb notificació personalitzada `VerifyEmailNotification`
    - Afegit cast `email_verified_at` → datetime
- Creada **`VerifyEmailNotification`** a `app/Notifications/`:
    - Genera URL signada temporal (60 minuts) cap a `verification.verify`
    - Email amb branding Codex: assumpte "Verify your email address – Codex"
    - Conté botó de verificació + link alternatiu en text pla
- Creat **`VerificationController`** a `app/Http/Controllers/`:
    - `GET /api/email/verify/{id}/{hash}` — Verifica email via URL signada (pública, middleware `signed`)
    - `POST /api/email/resend` — Reenvia email de verificació (auth:sanctum, throttle:6,1)
    - `GET /api/email/status` — Retorna estat de verificació de l'usuari (auth:sanctum)
- Actualitzat **`AuthController`**:
    - `register()`: ara envia email de verificació automàticament i retorna `email_verified: false`
    - `login()`: ara retorna `email_verified` al response
    - `me()`: ara retorna `email_verified` al response
- Actualitzat **`routes/api.php`**:
    - `GET /api/email/verify/{id}/{hash}` — Ruta pública amb middleware `signed`, nom `verification.verify`
    - `POST /api/email/resend` — Ruta protegida amb `auth:sanctum` i `throttle:6,1`
    - `GET /api/email/status` — Ruta protegida amb `auth:sanctum`
- Configurat **`.env`** del contenidor:
    - `MAIL_FROM_ADDRESS=noreply@codex.dev`, `MAIL_FROM_NAME=Codex`
    - `CACHE_STORE=redis` (necessari pel throttle middleware, que depèn del cache store)
- Actualitzat **seeder**: tots els usuaris de seed tenen `email_verified_at` assignat (pre-verificats per a testing)
- **Fluix de verificació d'email:**
    1. Usuari es registra → rep email amb URL signada (vàlida 60 min)
    2. Clic al link → `GET /api/email/verify/{id}/{hash}` marca `email_verified_at`
    3. Si no ha rebut l'email → `POST /api/email/resend` (throttle: max 6 intents/minut)
    4. Pot consultar estat amb `GET /api/email/status`
    5. Login i /me retornen `email_verified` per al frontend

### 2026-02-20 – Fix configuració correu (.env)

- **Autor:** @iker
- Corregit `.env`: `MAIL_MAILER` canviat de `log` a `smtp`, `MAIL_HOST` a `mailpit`, `MAIL_PORT` a `1025`
- `MAIL_FROM_ADDRESS` canviat de `hello@example.com` a `no-reply@tfg.local`
- Sense aquest fix, els emails de verificació s'escrivien al log però no s'enviaven realment a Mailpit

### 2026-02-19 – Login amb Google (OAuth 2.0)

- **Autor:** @chuclao (amb IA)
- Instal·lat **Laravel Socialite v5** per a OAuth amb Google
- **Esquema BD** (`2025_02_17_000000_create_full_schema.php`):
    - `password` continua sent **NOT NULL** (veure feature password-management per detalls)
    - Afegit `google_id` (string, nullable, unique) a la taula `users`
    - Afegit `auth_provider` (enum: local/google, default: local) a la taula `users`
- Actualitzat model **`User`**:
    - Nous fillable: `google_id`, `auth_provider`, `email_verified_at`
- Actualitzat **`AuthService`** a `app/Services/`:
    - Nou mètode `handleGoogleUser()`: gestiona login/registre via Google amb 3 escenaris:
        1. Usuari existent per `google_id` → login directe (actualitza nom si ha canviat)
        2. Usuari existent per `email` (compte local) → vincula Google, manté avatar existent
        3. Usuari nou → crea amb dades de Google, avatar de Google, email auto-verificat
    - Nou mètode `generateUniqueUsername()`: genera username únic a partir de l'email de Google
    - **Política d'avatar:**
        - Usuari nou des de Google → usa avatar de Google
        - Usuari existent amb avatar → **el manté** (no sobreescriu)
        - Usuari existent sense avatar → usa avatar de Google
- Creat **`GoogleAuthController`** a `app/Http/Controllers/`:
    - `GET /api/auth/google/redirect` — Retorna la URL de redirecció OAuth de Google (stateless per SPA)
    - `POST /api/auth/google/callback` — Rep el codi d'autorització, intercanvia per dades d'usuari, crea/login
        - Retorna token Sanctum + `is_new_user` + `auth_provider` + `email_verified`
        - Verifica si l'usuari està bloquejat (403)
- Actualitzat **`AuthController`**:
    - `login()`: detecta usuaris Google sense password → retorna error 422 indicant que han d'usar Google login
    - `register()`, `login()`, `me()`: ara retornen `auth_provider` al response
- Actualitzat **`routes/api.php`**:
    - `GET /api/auth/google/redirect` — Ruta pública (obté URL OAuth)
    - `POST /api/auth/google/callback` — Ruta pública (intercanvi de codi per token)
- Configurat **`config/services.php`**: afegit bloc `google` amb `client_id`, `client_secret`, `redirect` des de `.env`
- Configurat **`.env`** del contenidor:
    - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- Actualitzat **seeder**: tots els usuaris de seed tenen `auth_provider=local`
- **Fluix de login amb Google (SPA):**
    1. Frontend crida `GET /api/auth/google/redirect` → obté URL de Google
    2. Frontend redirigeix el navegador a la URL de Google
    3. Usuari autoritza → Google redirigeix al frontend amb `?code=xxx`
    4. Frontend envia el codi a `POST /api/auth/google/callback`
    5. Backend intercanvia codi per dades d'usuari → crea o vincula compte
    6. Retorna token Sanctum + dades d'usuari (incloent `is_new_user`, `auth_provider`)
    7. Si l'usuari és nou, l'email es marca com verificat automàticament
    8. Si l'usuari ja existia amb compte local, es vincula Google + manté avatar

### 2026-02-19 – Gestió de Contrasenyes (Set, Update, Forgot, Reset)

- **Autor:** @chuclao (amb IA)
- **Esquema BD** (`2025_02_17_000000_create_full_schema.php`):
    - `password` torna a ser **NOT NULL** (usuaris Google reben una contrasenya temporal aleatòria)
    - Afegit `password_set_at` (timestamp, nullable) a la taula `users` — si és NULL, l'usuari necessita establir contrasenya
    - Creada taula **`password_reset_tokens`**: email (primary), token (hashed), created_at
- Actualitzat model **`User`**:
    - Nou fillable: `password_set_at`
    - Nou cast: `password_set_at` → datetime
    - `google_id` afegit a `$hidden`
    - Nou helper `needsPassword(): bool` — retorna `true` si `password_set_at === null`
- Actualitzat **`AuthService`** a `app/Services/`:
    - `register()`: ara estableix `password_set_at => now()` i `auth_provider => 'local'`
    - `handleGoogleUser()`: nous usuaris Google reben `Hash::make(Str::random(32))` com a contrasenya temporal + `password_set_at => null`
- Creat **`PasswordController`** a `app/Http/Controllers/`:
    - `POST /api/password/set` — Usuaris Google estableixen la seva primera contrasenya (auth:sanctum)
        - Verifica `needsPassword()`, retorna 409 si ja té contrasenya establerta
        - Actualitza password + password_set_at
    - `PUT /api/password/update` — Canviar contrasenya existent (auth:sanctum)
        - Requereix `current_password` per verificar, retorna 422 si `needsPassword()` és true
    - `POST /api/password/forgot` — Envia email de reset (públic, throttle:5,1)
        - Genera token aleatori, guarda hash a `password_reset_tokens`
        - Sempre retorna missatge d'èxit (anti-enumeració d'emails)
    - `POST /api/password/reset` — Restableix contrasenya amb token (públic)
        - Valida email + token + contrasenya, comprova expiració (60 min)
        - Actualitza password + password_set_at, elimina token, revoca tots els tokens Sanctum
- Creada **`ResetPasswordNotification`** a `app/Notifications/`:
    - Email amb branding Codex: assumpte "Reset your password – Codex"
    - Link al frontend: `{FRONTEND_URL}/reset-password?token=xxx&email=xxx`
    - Expiració de 60 minuts indicada a l'email
- Actualitzat **`AuthController`**:
    - `login()`: detecta `needsPassword()` en lloc de comprovar si password és null
    - `register()`, `login()`, `me()`: ara retornen `needs_password` al response
- Actualitzat **`GoogleAuthController`**: `callback()` ara retorna `needs_password` al response
- Actualitzat **`routes/api.php`**:
    - Noves rutes públiques: `POST /api/password/forgot` (throttle:5,1), `POST /api/password/reset`
    - Noves rutes protegides: `POST /api/password/set`, `PUT /api/password/update`
- Actualitzat **`config/app.php`**: afegit `frontend_url` amb variable d'entorn `FRONTEND_URL`
- Configurat **`.env`** del contenidor: `FRONTEND_URL=http://localhost:5173`
- Actualitzat **seeder**: tots els usuaris de seed tenen `password_set_at => Carbon::now()`
- **Fluix de contrasenya per a usuaris Google:**
    1. Usuari es registra/login via Google → rep contrasenya temporal aleatòria + `password_set_at=null`
    2. Response retorna `needs_password: true` → frontend redirigeix a pàgina "Estableix contrasenya"
    3. `POST /api/password/set` amb nova contrasenya → `password_set_at` s'actualitza
    4. A partir d'ara pot fer login amb email + contrasenya a més de Google
- **Fluix de restabliment de contrasenya (forgot/reset):**
    1. Usuari fa `POST /api/password/forgot` amb el seu email
    2. Si l'email existeix, rep email amb link de reset (60 min expiració)
    3. Frontend obté token i email de la URL → mostra formulari de nova contrasenya
    4. `POST /api/password/reset` amb email + token + nova contrasenya
    5. Contrasenya actualitzada, tots els tokens Sanctum revocats → l'usuari ha de fer login de nou

### 2026-02-19 – Follow/Unfollow Usuaris

- **Autor:** @chuclao (amb IA)
- Creat **`FollowController`** a `app/Http/Controllers/`:
    - `POST /api/users/{user}/follow` — Toggle follow/unfollow (auth:sanctum), no permet seguir-se a si mateix (422)
    - `GET /api/users/{user}/followers` — Llista de seguidors d'un usuari (públic), paginada, amb flag `is_following` i `is_self`
    - `GET /api/users/{user}/following` — Llista d'usuaris que segueix (públic), paginada, amb flag `is_following` i `is_self`
    - `GET /api/users/{user}/follow-status` — Estat de follow per a l'usuari autenticat (auth:sanctum)
- Actualitzat **`ProfileController::show()`**: afegit flag `is_following` al response del perfil

### 2026-02-19 – Marcar Comentari com a Solució

- **Autor:** @chuclao (amb IA)
- Actualitzat **`CommentController`**:
    - `PATCH /api/comments/{comment}/solution` — Toggle mark/unmark solució (auth:sanctum)
    - Només l'autor del post pot marcar solucions, només en posts tipus `question`
    - Comportament toggle: si ja hi ha una solució, la desmarca i marca la nova
    - Actualitza `comment.is_solution` i `post.is_solved` simultàniament

### 2026-02-19 – Llistat de Posts Guardats i Posts amb Like

- **Autor:** @chuclao (amb IA)
- Actualitzat **`InteractionController`**:
    - `GET /api/bookmarks` — Llista paginada de posts guardats (bookmark) de l'usuari autenticat
    - `GET /api/liked` — Llista paginada de posts amb like de l'usuari autenticat
- Ambdós endpoints usen `PostResource` i retornen comptadors agregats

### 2026-02-19 – Feed de Seguiment + Filtre per Tipus

- **Autor:** @chuclao (amb IA)
- Actualitzat **`PostController`**:
    - `GET /api/feed/following` — Feed de posts d'usuaris seguits (auth:sanctum)
    - Mostra posts globals + posts del centre de l'usuari dels users seguits
    - Retorna missatge informatiu si no segueix ningú
    - Afegit filtre `?type=question|news` al feed global (`GET /api/posts`)

### 2026-02-19 – Cerca Global i per Centre

- **Autor:** @chuclao (amb IA)
- Creat **`SearchController`** a `app/Http/Controllers/`:
    - `GET /api/search` — Cerca pública en posts globals, usuaris i tags, amb filtre `?type=posts|users|tags`
    - `GET /api/center/search` — Cerca dins del centre de l'usuari: posts i membres (auth:sanctum)
- Validació: query mínim 2 caràcters, màxim 100

### 2026-02-19 – Edició de Posts

- **Autor:** @chuclao (amb IA)
- Actualitzat **`PostController`**:
    - `PUT /api/posts/{post}` — Actualitzar post (auth:sanctum), només l'autor pot editar
    - Sanititza contingut, sincronitza tags
- Creat **`UpdatePostRequest`** a `app/Http/Requests/`:
    - Validació parcial amb tots els camps `sometimes` (no requerits)

### 2026-02-19 – Edició de Comentaris

- **Autor:** @chuclao (amb IA)
- Actualitzat **`CommentController`**:
    - `PUT /api/comments/{comment}` — Actualitzar comentari (auth:sanctum), només l'autor pot editar
    - Validació inline: content required, max 5000 caràcters
    - Sanititza contingut amb SanitizationService

### 2026-02-19 – Follow/Unfollow Etiquetes amb Notificacions

- **Autor:** @chuclao (amb IA)
- Actualitzat **`TagController`**:
    - `POST /api/tags/{tag}/follow` — Toggle follow/unfollow etiqueta (auth:sanctum)
    - `PATCH /api/tags/{tag}/notify` — Toggle notificacions d'una etiqueta seguida (auth:sanctum)
    - `GET /api/tags/followed` — Llista d'etiquetes seguides per l'usuari (auth:sanctum)
- Llistes de tags (`index`, `centerTags`) ara inclouen flag `is_following` per a usuaris autenticats
- Utilitza taula pivot `tag_user` amb columna `notify`

### 2026-02-19 – Repost

- **Autor:** @chuclao (amb IA)
- Actualitzat **`PostController`**:
    - `POST /api/posts/{post}/repost` — Repost d'un post existent (auth:sanctum)
    - No permet repostejar el propi post (422) ni duplicar reposts (409)
    - Repost d'un repost apunta sempre a l'original
- Actualitzat **`PostResource`**:
    - Nous camps: `original_post` (amb user aniuat), `is_repost`, `reposts_count`
- Actualitzades totes les queries de feed (index, centerPosts, followingFeed, show, store, update) per incloure `originalPost.user` i `reposts` count

### 2026-02-19 – Notificacions REST

- **Autor:** @chuclao (amb IA)
- **Esquema BD** (`2025_02_17_000000_create_full_schema.php`):
    - Creada taula **`notifications`**: id, user_id (FK), sender_id (FK), type, morphs(notifiable), message, read_at, timestamps
    - Índexs: (user_id, read_at) per consultes d'unread, (user_id, created_at) per llistat ordenat
- Creat model **`Notification`** a `app/Models/`:
    - Scope `unread()`, relacions `user()`, `sender()`, `notifiable()` (MorphTo)
- Creat **`NotificationService`** a `app/Services/`:
    - `create()`: crea notificació, salta si sender === receiver (no auto-notificar)
- Creat **`NotificationController`** a `app/Http/Controllers/`:
    - `GET /api/notifications` — Llista paginada amb filtre `?unread_only=true`, inclou `unread_count` a meta
    - `GET /api/notifications/count` — Comptador d'unread
    - `PATCH /api/notifications/{notification}/read` — Marcar com a llegida
    - `PATCH /api/notifications/read-all` — Marcar totes com a llegides
    - `DELETE /api/notifications/{notification}` — Eliminar notificació
- Integrat **NotificationService** als controllers existents:
    - **CommentController**: notifica l'autor del post quan rep un comentari, notifica l'autor del comentari pare quan rep una reply
    - **InteractionController**: notifica l'autor del recurs quan rep un like (no bookmarks)
    - **FollowController**: notifica l'usuari quan algú el comença a seguir
    - **PostController**: notifica l'autor del post original quan algú el reposteja

### 2026-02-19 – Notificacions en Temps Real (Redis Pub/Sub → Socket.io)

- **Autor:** @chuclao (amb IA)
- Afegit `BROADCAST_CONNECTION=redis` al `.env`
- Creat **`config/broadcasting.php`**: driver `redis` usant la connexió `default` de `database.redis`
    - Prefix Redis: `tfg-database-` (generat per Str::slug d'APP_NAME)
- Creat **`NewNotificationEvent`** a `app/Events/`:
    - Implementa `ShouldBroadcastNow` (publicació síncrona a Redis, sense cua)
    - Broadcast al canal `user.{userId}` amb nom d'event `new.notification`
    - Payload: id, type, message, read_at, created_at, sender (id, name, username, avatar), notifiable (type, id)
- Actualitzat **`NotificationService`**:
    - Ara crida `broadcast(new NewNotificationEvent($notification))` després de crear cada notificació
    - Carrega la relació `sender` abans del broadcast per tenir les dades completes
- **Flux complet Laravel → Node → Client:**
    1. Una acció (like, comment, follow, repost, reply) crea una notificació via `NotificationService`
    2. `NotificationService` persiste a BD i fa `broadcast()` → Laravel publica a Redis canal `tfg-database-user.{id}`
    3. Node (Socket.io) rep el missatge via `psubscribe('tfg-database-*')`
    4. Node extreu el canal (`user.{id}`) i l'event (`new.notification`) i emet a la room Socket.io corresponent
    5. El client React que està a la room `user.{id}` rep l'event en temps real
- **Events broadcasts disponibles:**
    - `new.notification` → canal `user.{id}` — Notificacions (like, follow, comment, reply, repost)
    - `new.interaction` → canal `user.{id}` — Interaccions like/bookmark (ja existent)
    - `new.comment` → canal `post.{id}` — Comentaris nous a un post (ja existent)
    - `post.deleted` → canal `user.{id}` i `profile.{id}` — Eliminació de post (Nou)
    - `interaction.removed` → canal `user.{id}` — Like o bookmark eliminat (Nou)

### 2026-02-20 – Cerca per Tags i Leaderboard

- **Autor:** @copilot (IA)
- Actualitzat **`SearchController`**:
    - `GET /api/search` — Ara cerca posts per títol, contingut I per nom de tags relacionats
    - Afegit `orWhereHas('tags', ...)` per incloure posts que tenen tags coincidents amb la query
- Actualitzat **`ProfileController`**:
    - `GET /api/leaderboard` — Nou endpoint públic que retorna els top N usuaris per reputació (default 5)
    - Utilitza `ReputationService` per calcular puntuació
    - Retorna: id, name, username, avatar, reputation (score, current_badge)
- Actualitzat **`routes/api.php`**:
    - Nova ruta pública: `GET /api/leaderboard?limit=N`

### 2026-02-23 – Temps real de Perfil, Àvatars i Taula de Notificacions

- **Autor:** @iker
- Creat **`ProfileUpdatedEvent`** a `app/Events/`:
    - Broadcast al canal `profile.{userId}` quan un usuari actualitza el seu perfil.
    - Payload: `user_id`, `name`, `avatar`, `bio`, `followers_count`, `following_count`.
- **Gestió d'Àvatars (Carga de fitxers):**
    - `ProfileController@update` actualitzat per acceptar `multipart/form-data`.
    - Guarda l'àvatar al disc públic (`storage/app/public/avatars`) i borra l'anterior si existia.
    - Retorna la URL completa de la imatge.
- **Corregit error 500 en Follow:**
    - Creada la migració de la taula `notifications` que faltava i que bloquejava el `NotificationService`.
- **Configuració de Servidor:**
    - Canviat `FILESYSTEM_DISK=public` al `.env`.
    - Fixat `APP_URL=http://localhost:8080` per a URLs d'àvatar correctes.
    - Creat symlink de `storage` dins del contenidor.
    - Configurat Nginx per servir `/storage/` directament des del disc des de la carpeta `public`.

### 2026-02-24 – Sincronització Real-Time de Eliminacions i Interaccions

- **Autor:** @iker
- **Nous Events Broadcast:**
    - `PostDeleted`: S'emet quan un post és eliminat sàviament. Canal `user.{userId}` i `profile.{userId}`.
    - `InteractionRemoved`: S'emet quan es desfà un like o bookmark. Canal `user.{userId}`.
- **Canvis en Controladors:**
    - `PostController@destroy`: Ara dispara `PostDeleted`.
    - `InteractionController@toggle`: Ara dispara `InteractionRemoved` quan l'estat passa a `active: false`.

### 2026-02-25 – Selector de Visibilitat Global/Centre al crear/editar posts

- **Autor:** @copilot (IA)
- **StorePostRequest:** Afegit camp `visibility` (`sometimes|string|in:global,center`)
- **UpdatePostRequest:** Afegit camp `visibility` (`sometimes|string|in:global,center`)
- **PostController::store():** Usa `visibility` per decidir `center_id`:
    - `global` → `center_id = null` (visible a tothom)
    - `center` → `center_id = user->center_id` (només al centre de l'usuari)
    - Abans sempre assignava `user->center_id` automàticament
- **PostController::update():** Permet canviar la visibilitat d'un post existent amb el mateix camp `visibility`

### 2026-02-25 – Documentació de Profiling i Neteja

- **Autor:** @iker
- Actualització de `CONTEXT.md` amb el resum de les darreres funcionalitats de real-time i gestió de perfils.

### 2026-02-25 – Sistema de Xat amb restriccions de seguiment mutu

- **Autor:** @copilot (IA)
- **Nous Fitxers:**
    - `app/Services/ChatService.php`: Lògica de negoci per xat amb restriccions de seguiment mutu.
        - `areMutualFollowers()`: Comprova si dos usuaris es segueixen mútuament.
        - `canSendMessage()`: Retorna si l'usuari pot enviar missatge (restricció: 1 missatge si no és mutu).
        - `getConversationStatus()`: Obté l'estat de la conversa (mutual, restricted, messagesRemaining).
        - `getConversations()`: Llista de converses amb últim missatge i unread count.
        - `getMessages()`: Paginació de missatges d'una conversa.
        - `markAsRead()`: Marca missatges com a llegits.
        - `getUnreadCount()`: Compta missatges no llegits totals.
    - `app/Http/Controllers/ChatController.php`: 7 endpoints RESTful per xat.
    - `app/Events/NewMessageEvent.php`: Broadcast de nous missatges via Redis→Socket.io.
    - `app/Events/MessageReadEvent.php`: Broadcast de missatges llegits.
    - `app/Http/Requests/StoreMessageRequest.php`: Validació de missatges.
- **Noves Rutes API (`routes/api.php`):**
    - `GET /api/chat/conversations` → Llista converses
    - `GET /api/chat/conversations/{userId}` → Missatges amb usuari
    - `POST /api/chat/messages` → Enviar missatge
    - `POST /api/chat/conversations/{userId}/read` → Marcar com llegits
    - `GET /api/chat/unread` → Comptador no llegits
    - `GET /api/chat/can-message/{userId}` → Verificar si pot enviar
    - `GET /api/chat/search-users` → Cercar usuaris per nova conversa
- **Regles de Negoci:**
    - Si els usuaris NO es segueixen mútuament: només 1 missatge permès per direcció.
    - Si els usuaris ES segueixen mútuament: conversa completa sense límits.

### 2026-02-26 – Header X-Socket-P2P per evitar broadcasts duplicats

- **Autor:** @copilot (IA)
- **ChatController::store():**
  - Afegit check `$request->hasHeader('X-Socket-P2P')` abans de fer `event(new NewMessageEvent(...))`.
  - Si existeix el header, el socket ja emet l'event directament i Laravel no ha de fer broadcast duplicat.
  - Això permet que el sistema P2P funcioni sense que arribin dos missatges al client.

### 2026-03-04 – Configuració Correu Producció (Hestia Mail Server)

- **Autor:** @copilot (IA)
- **Configuració de correu per producció:**
    - Migrat de Mailpit (dev) a **Hestia Mail Server** per producció
    - Servidor: `mail.codex.daw.inspedralbes.cat` (IP: `187.33.146.183`)
    - Port: 25 (sense TLS per compatibilitat) o 587 (amb TLS)
    - Username: `noreply` (sense domini)
    - From address: `noreply@codex.daw.inspedralbes.cat`
- **DNS configurat correctament:**
    - SPF: `v=spf1 a mx ip4:187.33.146.183 -all`
    - DKIM: Activat amb clau RSA 2048-bit
    - DMARC: `v=DMARC1; p=quarantine; pct=100`
    - MX: `mail.codex.daw.inspedralbes.cat` (prioritat 10)
- **Actualitzat `docker-compose.dev.yml`:**
    - Afegit `extra_hosts` per a resolució DNS dins dels contenidors Docker
    - Mapeja `mail.codex.daw.inspedralbes.cat` a `187.33.146.183`
- **Fitxers modificats:** `.env`, `.env.prod.example`, `docker-compose.dev.yml`, `config/cors.php`, `bootstrap/app.php`
- **Nota:** Per a desenvolupament local es pot seguir usant Mailpit canviant `.env`

### 2026-03-05 – Notificacions de Missatges i Millora Permisos de Xat

- **Autor:** @copilot (IA)
- **Notificacions de Missatges:**
    - `ChatController::store()` ara crea una notificació de tipus `message` per al receptor quan s'envia un missatge.
    - Utilitza el `NotificationService` existent amb `notifiableType: ChatMessage::class`.
- **Millora Permisos de Xat (ChatService):**
    - `canSendMessage()` ara permet continuar la conversa si l'altre usuari ja ha respost.
    - Regla anterior: Si no es segueixen mútuament, només 1 missatge permès.
    - Regla nova: Si l'altre ha respost (existeix missatge en direcció inversa), la conversa es considera establerta i ambdós poden continuar.
    - Nou return `reason: 'conversation_established'` quan el receptor ja ha respost.
- **Fitxers modificats:**
    - `api/app/Http/Controllers/ChatController.php`
    - `api/app/Services/ChatService.php`

---

## 📚 Documentació Relacionada

- **Visió Global del Projecte:** [../doc/PROJECT_CONCEPT.md](../doc/PROJECT_CONCEPT.md)
- **Frontend (Cliente):** [../client/CONTEXT.md](../client/CONTEXT.md)
- **Real-time (Socket):** [../socket/CONTEXT.md](../socket/CONTEXT.md)
