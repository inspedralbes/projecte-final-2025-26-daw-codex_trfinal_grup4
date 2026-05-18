# 📡 Documentació de l'API

L'API de Codex és una API RESTful construïda amb Laravel 11. Totes les respostes es retornen en format JSON.

## 🔐 Autenticació

L'autenticació es gestiona amb **Laravel Sanctum**.

| Mètode | Endpoint | Descripció |
| --- | --- | --- |
| POST | `/api/login` | Inicia sessió i retorna un token. |
| POST | `/api/register` | Registra un nou usuari. |
| POST | `/api/logout` | Tanca la sessió actual (requereix auth). |
| GET | `/api/me` | Retorna les dades de l'usuari autenticat. |

---

## 📝 Posts i Comentaris

| Mètode | Endpoint | Descripció |
| --- | --- | --- |
| GET | `/api/posts` | Llista tots els posts públics. |
| POST | `/api/posts` | Crea un nou post (requereix auth). |
| GET | `/api/posts/{id}` | Mostra un post específic. |
| PUT | `/api/posts/{id}` | Actualitza un post propi. |
| DELETE | `/api/posts/{id}` | Elimina un post (propi o per part d'un admin). |
| GET | `/api/posts/{id}/comments` | Llista els comentaris d'un post. |
| POST | `/api/comments` | Afegeix un comentari a un post. |

---

## 🏫 Centres Educatius

| Mètode | Endpoint | Descripció |
| --- | --- | --- |
| GET | `/api/centers` | Llista els centres disponibles. |
| GET | `/api/centers/{id}` | Mostra informació d'un centre. |
| POST | `/api/center-requests` | Sol·licita unir-se a un centre. |
| GET | `/api/center/members` | Llista els membres del centre actual (profes/admins). |

---

## 💬 Xat i Grups

| Mètode | Endpoint | Descripció |
| --- | --- | --- |
| GET | `/api/chat/conversations` | Llista les converses actives. |
| GET | `/api/chat/conversations/{userId}` | Missatges d'una conversa privada. |
| POST | `/api/chat/messages` | Envia un missatge nou. |
| GET | `/api/groups` | Llista els grups de l'usuari. |
| POST | `/api/groups` | Crea un nou grup de xat. |

---

## 🛡️ Administració

| Mètode | Endpoint | Descripció |
| --- | --- | --- |
| GET | `/api/admin/stats` | Estadístiques globals del sistema. |
| GET | `/api/admin/users` | Llistat d'usuaris per a gestió. |
| GET | `/api/admin/posts` | Llistat global de posts per a moderació de continguts. |
| POST | `/api/admin/users/{id}/ban` | Baneja un usuari. |
| PATCH | `/api/center-requests/{id}/approve` | Aprova una sol·licitud de centre. |

---

## 🛠️ Generació de documentació (Swagger)

Si vols generar la documentació interactiva en local, pots utilitzar `L5-Swagger`. 

1. Instal·la la dependència (si no hi és):
   ```bash
   composer require "darkaonline/l5-swagger"
   ```
2. Publica la configuració:
   ```bash
   php artisan vendor:publish --provider "DarkaOnLine\L5Swagger\L5SwaggerServiceProvider"
   ```
3. Genera la documentació:
   ```bash
   php artisan l5-swagger:generate
   ```
4. Accedeix a: `http://localhost:8080/api/documentation`
