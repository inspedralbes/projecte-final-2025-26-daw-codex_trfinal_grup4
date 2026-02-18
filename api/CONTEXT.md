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

6. **Migracions (Entorn de testing):** Estem en fase de desenvolupament/testing. **NO crear migracions noves.** Modifica directament l'esquema principal a `database/migrations/2025_02_17_000000_create_full_schema.php` i executa `php artisan migrate:fresh --seed` per recrear la BD.

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

---

## 📚 Documentació Relacionada

*   **Visió Global del Projecte:** [../doc/PROJECT_CONCEPT.md](../doc/PROJECT_CONCEPT.md)
*   **Frontend (Cliente):** [../client/CONTEXT.md](../client/CONTEXT.md)
*   **Real-time (Socket):** [../socket/CONTEXT.md](../socket/CONTEXT.md)
