<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

/**
 * DemoSeeder — Generates realistic demo data for the Codex platform presentation.
 *
 * Centers:
 *   1. Institut Pedralbes (Barcelona)        — 4 real students + 1 teacher
 *   2. IES Jaume Balmes (Barcelona)          — 4 students + 1 teacher
 *   3. IES Campanar (Valencia)               — 3 students + 1 teacher
 *
 * Also creates 2 userNormal accounts (no center) and 1 admin (hidden from public).
 *
 * Posts: ~50+ posts (news + questions), comments, likes, follows, tags.
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();
        $password = Hash::make('password');

        // ─────────────────────────────────────────────────────────────
        //  CENTERS
        // ─────────────────────────────────────────────────────────────

        $pedralbesId = DB::table('centers')->insertGetId([
            'name'        => 'Institut Pedralbes',
            'domain'      => 'inspedralbes.cat',
            'city'        => 'Barcelona',
            'website'     => 'https://agora.xtec.cat/iespedralbes/',
            'description' => 'Centre educatiu de referència en DAW/DAM a Barcelona. Formem professionals en desenvolupament web i multiplataforma.',
            'status'      => 'active',
            'is_private'  => false,
            'created_at'  => $now->copy()->subMonths(6),
            'updated_at'  => $now,
        ]);

        $balmesId = DB::table('centers')->insertGetId([
            'name'        => 'IES Jaume Balmes',
            'domain'      => 'jaumebalmes.net',
            'city'        => 'Barcelona',
            'website'     => 'https://www.iesjaumebalmes.cat/',
            'description' => 'Centro activo y verificado. Ciclos formativos de DAM, DAW y ASIX con más de 200 alumnos.',
            'status'      => 'active',
            'is_private'  => false,
            'created_at'  => $now->copy()->subMonths(4),
            'updated_at'  => $now,
        ]);

        $campanarId = DB::table('centers')->insertGetId([
            'name'        => 'IES Campanar',
            'domain'      => 'iescampanar.es',
            'city'        => 'Valencia',
            'website'     => 'https://portal.edu.gva.es/iescampanar/',
            'description' => 'Gran oferta formativa en ciclos de informática. Especialistas en desarrollo web y ciberseguridad.',
            'status'      => 'active',
            'is_private'  => false,
            'created_at'  => $now->copy()->subMonths(3),
            'updated_at'  => $now,
        ]);

        echo "✅ 3 Centers created\n";

        // ─────────────────────────────────────────────────────────────
        //  ADMIN (hidden from all public views)
        // ─────────────────────────────────────────────────────────────

        DB::table('users')->insertGetId([
            'name'              => 'Admin System',
            'username'          => 'admin',
            'email'             => 'admin@codex.com',
            'password'          => $password,
            'role'              => 'admin',
            'is_blocked'        => false,
            'auth_provider'     => 'local',
            'email_verified_at' => $now,
            'password_set_at'   => $now,
            'created_at'        => $now->copy()->subMonths(8),
            'updated_at'        => $now,
        ]);

        echo "✅ Admin created (hidden)\n";

        // ─────────────────────────────────────────────────────────────
        //  USERS — Institut Pedralbes
        // ─────────────────────────────────────────────────────────────

        $pedralbesUsers = [];

        // Teacher — Iza (a23izadelesp)
        $pedralbesUsers['iza'] = DB::table('users')->insertGetId([
            'center_id'         => $pedralbesId,
            'name'              => 'Iza Del Espino',
            'username'          => 'izadelesp',
            'email'             => 'a23izadelesp@inspedralbes.cat',
            'password'          => $password,
            'role'              => 'teacher',
            'bio'               => 'Profesor de DAW en Institut Pedralbes. Especialista en Laravel, React y arquitecturas cloud. 🚀',
            'is_blocked'        => false,
            'auth_provider'     => 'local',
            'email_verified_at' => $now,
            'password_set_at'   => $now,
            'created_at'        => $now->copy()->subMonths(5),
            'updated_at'        => $now,
        ]);

        // Student — Ike (a23ikedelgra)
        $pedralbesUsers['ike'] = DB::table('users')->insertGetId([
            'center_id'         => $pedralbesId,
            'name'              => 'Ike Del Gra',
            'username'          => 'ikedelgra',
            'email'             => 'a23ikedelgra@inspedralbes.cat',
            'password'          => $password,
            'role'              => 'student',
            'bio'               => 'Estudiante de DAW 2º. Me encanta React y el desarrollo frontend. Aprendiendo Docker 🐳',
            'is_blocked'        => false,
            'auth_provider'     => 'local',
            'email_verified_at' => $now,
            'password_set_at'   => $now,
            'created_at'        => $now->copy()->subMonths(4),
            'updated_at'        => $now,
        ]);

        // Student — Marc (a23marrojgon)
        $pedralbesUsers['marc'] = DB::table('users')->insertGetId([
            'center_id'         => $pedralbesId,
            'name'              => 'Marc Roj Gonzalez',
            'username'          => 'marrojgon',
            'email'             => 'a23marrojgon@inspedralbes.cat',
            'password'          => $password,
            'role'              => 'student',
            'bio'               => 'Backend enthusiast 🔧 Laravel + Node.js. Siempre buscando la solución más limpia.',
            'is_blocked'        => false,
            'auth_provider'     => 'local',
            'email_verified_at' => $now,
            'password_set_at'   => $now,
            'created_at'        => $now->copy()->subMonths(4),
            'updated_at'        => $now,
        ]);

        // Student — Pol (a23poldiabel)
        $pedralbesUsers['pol'] = DB::table('users')->insertGetId([
            'center_id'         => $pedralbesId,
            'name'              => 'Pol Dia Bel',
            'username'          => 'poldiabel',
            'email'             => 'a23poldiabel@inspedralbes.cat',
            'password'          => $password,
            'role'              => 'student',
            'bio'               => 'Full-stack en formación. Vue.js + MongoDB fan. También hago cosas con Unity 🎮',
            'is_blocked'        => false,
            'auth_provider'     => 'local',
            'email_verified_at' => $now,
            'password_set_at'   => $now,
            'created_at'        => $now->copy()->subMonths(3),
            'updated_at'        => $now,
        ]);

        // Link teacher as center creator
        DB::table('centers')->where('id', $pedralbesId)->update(['creator_id' => $pedralbesUsers['iza']]);

        echo "✅ 4 Pedralbes users created (1 teacher + 3 students)\n";

        // ─────────────────────────────────────────────────────────────
        //  USERS — IES Jaume Balmes
        // ─────────────────────────────────────────────────────────────

        $balmesUsers = [];

        $balmesUsers['teacher'] = DB::table('users')->insertGetId([
            'center_id'         => $balmesId,
            'name'              => 'Laura Martínez',
            'username'          => 'lauramtz',
            'email'             => 'laura.martinez@jaumebalmes.net',
            'password'          => $password,
            'role'              => 'teacher',
            'bio'               => 'Profesora de ASIX y DAM. DevOps, Linux y seguridad informática. 🔒',
            'is_blocked'        => false,
            'auth_provider'     => 'local',
            'email_verified_at' => $now,
            'password_set_at'   => $now,
            'created_at'        => $now->copy()->subMonths(3),
            'updated_at'        => $now,
        ]);

        $balmesUsers['alex'] = DB::table('users')->insertGetId([
            'center_id'         => $balmesId,
            'name'              => 'Àlex Puig',
            'username'          => 'alexpuig',
            'email'             => 'alex.puig@jaumebalmes.net',
            'password'          => $password,
            'role'              => 'student',
            'bio'               => 'DAM 2º año. Kotlin + Android Studio. Me flipa el desarrollo móvil 📱',
            'is_blocked'        => false,
            'auth_provider'     => 'local',
            'email_verified_at' => $now,
            'password_set_at'   => $now,
            'created_at'        => $now->copy()->subMonths(3),
            'updated_at'        => $now,
        ]);

        $balmesUsers['marta'] = DB::table('users')->insertGetId([
            'center_id'         => $balmesId,
            'name'              => 'Marta Soler',
            'username'          => 'martasoler',
            'email'             => 'marta.soler@jaumebalmes.net',
            'password'          => $password,
            'role'              => 'student',
            'bio'               => 'Amante del frontend. CSS art, animaciones y React ✨',
            'is_blocked'        => false,
            'auth_provider'     => 'local',
            'email_verified_at' => $now,
            'password_set_at'   => $now,
            'created_at'        => $now->copy()->subMonths(2),
            'updated_at'        => $now,
        ]);

        $balmesUsers['jordi'] = DB::table('users')->insertGetId([
            'center_id'         => $balmesId,
            'name'              => 'Jordi Vidal',
            'username'          => 'jordividal',
            'email'             => 'jordi.vidal@jaumebalmes.net',
            'password'          => $password,
            'role'              => 'student',
            'bio'               => 'ASIX 1er año. Redes, Linux y algo de Python. Learning every day 💻',
            'is_blocked'        => false,
            'auth_provider'     => 'local',
            'email_verified_at' => $now,
            'password_set_at'   => $now,
            'created_at'        => $now->copy()->subMonths(2),
            'updated_at'        => $now,
        ]);

        $balmesUsers['nuria'] = DB::table('users')->insertGetId([
            'center_id'         => $balmesId,
            'name'              => 'Núria Ferrer',
            'username'          => 'nuriaferrer',
            'email'             => 'nuria.ferrer@jaumebalmes.net',
            'password'          => $password,
            'role'              => 'student',
            'bio'               => 'DAW + diseño UX/UI. Figma + React = ❤️',
            'is_blocked'        => false,
            'auth_provider'     => 'local',
            'email_verified_at' => $now,
            'password_set_at'   => $now,
            'created_at'        => $now->copy()->subMonths(1),
            'updated_at'        => $now,
        ]);

        DB::table('centers')->where('id', $balmesId)->update(['creator_id' => $balmesUsers['teacher']]);

        echo "✅ 5 Balmes users created (1 teacher + 4 students)\n";

        // ─────────────────────────────────────────────────────────────
        //  USERS — IES Campanar
        // ─────────────────────────────────────────────────────────────

        $campanarUsers = [];

        $campanarUsers['teacher'] = DB::table('users')->insertGetId([
            'center_id'         => $campanarId,
            'name'              => 'Carlos Ruiz',
            'username'          => 'carlosruiz',
            'email'             => 'carlos.ruiz@iescampanar.es',
            'password'          => $password,
            'role'              => 'teacher',
            'bio'               => 'Profesor de DAW en IES Campanar. Node.js, MongoDB y metodologías ágiles.',
            'is_blocked'        => false,
            'auth_provider'     => 'local',
            'email_verified_at' => $now,
            'password_set_at'   => $now,
            'created_at'        => $now->copy()->subMonths(3),
            'updated_at'        => $now,
        ]);

        $campanarUsers['pablo'] = DB::table('users')->insertGetId([
            'center_id'         => $campanarId,
            'name'              => 'Pablo Herrero',
            'username'          => 'pabloherrero',
            'email'             => 'pablo.herrero@iescampanar.es',
            'password'          => $password,
            'role'              => 'student',
            'bio'               => 'Aprendiendo desarrollo web. Me gusta Vue.js y probar tecnologías nuevas 🌐',
            'is_blocked'        => false,
            'auth_provider'     => 'local',
            'email_verified_at' => $now,
            'password_set_at'   => $now,
            'created_at'        => $now->copy()->subMonths(2),
            'updated_at'        => $now,
        ]);

        $campanarUsers['elena'] = DB::table('users')->insertGetId([
            'center_id'         => $campanarId,
            'name'              => 'Elena García',
            'username'          => 'elenagarcia',
            'email'             => 'elena.garcia@iescampanar.es',
            'password'          => $password,
            'role'              => 'student',
            'bio'               => 'Backend developer en formación. Python + Django + SQL. También toco algo de ciberseguridad 🛡️',
            'is_blocked'        => false,
            'auth_provider'     => 'local',
            'email_verified_at' => $now,
            'password_set_at'   => $now,
            'created_at'        => $now->copy()->subMonths(2),
            'updated_at'        => $now,
        ]);

        $campanarUsers['david'] = DB::table('users')->insertGetId([
            'center_id'         => $campanarId,
            'name'              => 'David López',
            'username'          => 'davidlopez',
            'email'             => 'david.lopez@iescampanar.es',
            'password'          => $password,
            'role'              => 'student',
            'bio'               => 'Unity Engine + C# para game dev. También me gusta el desarrollo web 🎮',
            'is_blocked'        => false,
            'auth_provider'     => 'local',
            'email_verified_at' => $now,
            'password_set_at'   => $now,
            'created_at'        => $now->copy()->subMonths(1),
            'updated_at'        => $now,
        ]);

        echo "✅ 4 Campanar users created (1 teacher + 3 students)\n";

        // ─────────────────────────────────────────────────────────────
        //  USERS — userNormal (no center)
        // ─────────────────────────────────────────────────────────────

        $normalUsers = [];

        $normalUsers['lucia'] = DB::table('users')->insertGetId([
            'name'              => 'Lucía Romero',
            'username'          => 'luciaromero',
            'email'             => 'lucia.romero@gmail.com',
            'password'          => $password,
            'role'              => 'userNormal',
            'bio'               => 'Autodidacta en programación. Python, JavaScript y mucha curiosidad 🧠',
            'is_blocked'        => false,
            'auth_provider'     => 'local',
            'email_verified_at' => $now,
            'password_set_at'   => $now,
            'created_at'        => $now->copy()->subMonths(2),
            'updated_at'        => $now,
        ]);

        $normalUsers['sergio'] = DB::table('users')->insertGetId([
            'name'              => 'Sergio Navarro',
            'username'          => 'sergionav',
            'email'             => 'sergio.navarro@outlook.com',
            'password'          => $password,
            'role'              => 'userNormal',
            'bio'               => 'Ex-bootcamp. Ahora freelance haciendo webs con React y Node 💼',
            'is_blocked'        => false,
            'auth_provider'     => 'local',
            'email_verified_at' => $now,
            'password_set_at'   => $now,
            'created_at'        => $now->copy()->subMonths(1),
            'updated_at'        => $now,
        ]);

        echo "✅ 2 normal users created\n";

        // Collect all user IDs for easy reference
        $allUserIds = array_merge(
            array_values($pedralbesUsers),
            array_values($balmesUsers),
            array_values($campanarUsers),
            array_values($normalUsers)
        );

        // ─────────────────────────────────────────────────────────────
        //  TAGS
        // ─────────────────────────────────────────────────────────────

        $tags = [];
        $tagData = [
            ['name' => 'Laravel',     'slug' => 'laravel',     'color' => '#FF2D20'],
            ['name' => 'React',       'slug' => 'react',       'color' => '#61DAFB'],
            ['name' => 'Node.js',     'slug' => 'nodejs',      'color' => '#339933'],
            ['name' => 'Docker',      'slug' => 'docker',      'color' => '#2496ED'],
            ['name' => 'Vue.js',      'slug' => 'vuejs',       'color' => '#4FC08D'],
            ['name' => 'MongoDB',     'slug' => 'mongodb',     'color' => '#47A248'],
            ['name' => 'SQL',         'slug' => 'sql',         'color' => '#CC2927'],
            ['name' => 'Unity',       'slug' => 'unity',       'color' => '#222C37'],
            ['name' => 'JavaScript',  'slug' => 'javascript',  'color' => '#F7DF1E'],
            ['name' => 'TypeScript',  'slug' => 'typescript',  'color' => '#3178C6'],
            ['name' => 'Python',      'slug' => 'python',      'color' => '#3776AB'],
            ['name' => 'CSS',         'slug' => 'css',         'color' => '#1572B6'],
            ['name' => 'Git',         'slug' => 'git',         'color' => '#F05032'],
            ['name' => 'PHP',         'slug' => 'php',         'color' => '#777BB4'],
            ['name' => 'Linux',       'slug' => 'linux',       'color' => '#FCC624'],
            ['name' => 'C#',          'slug' => 'csharp',      'color' => '#239120'],
            ['name' => 'API REST',    'slug' => 'api-rest',    'color' => '#009688'],
            ['name' => 'DevOps',      'slug' => 'devops',      'color' => '#FF6F00'],
        ];

        foreach ($tagData as $t) {
            $tags[$t['slug']] = DB::table('tags')->insertGetId(array_merge($t, [
                'created_at' => $now, 'updated_at' => $now,
            ]));
        }

        echo "✅ " . count($tags) . " tags created\n";

        // ─────────────────────────────────────────────────────────────
        //  FOLLOWS  (create a realistic social graph)
        // ─────────────────────────────────────────────────────────────

        $follows = [
            // Pedralbes students follow each other and their teacher
            [$pedralbesUsers['ike'],  $pedralbesUsers['iza']],
            [$pedralbesUsers['marc'], $pedralbesUsers['iza']],
            [$pedralbesUsers['pol'],  $pedralbesUsers['iza']],
            [$pedralbesUsers['ike'],  $pedralbesUsers['marc']],
            [$pedralbesUsers['ike'],  $pedralbesUsers['pol']],
            [$pedralbesUsers['marc'], $pedralbesUsers['ike']],
            [$pedralbesUsers['pol'],  $pedralbesUsers['ike']],
            [$pedralbesUsers['pol'],  $pedralbesUsers['marc']],
            [$pedralbesUsers['marc'], $pedralbesUsers['pol']],
            // Teacher follows students back
            [$pedralbesUsers['iza'],  $pedralbesUsers['ike']],
            [$pedralbesUsers['iza'],  $pedralbesUsers['marc']],

            // Balmes internal follows
            [$balmesUsers['alex'],  $balmesUsers['teacher']],
            [$balmesUsers['marta'], $balmesUsers['teacher']],
            [$balmesUsers['jordi'], $balmesUsers['teacher']],
            [$balmesUsers['nuria'], $balmesUsers['teacher']],
            [$balmesUsers['alex'],  $balmesUsers['marta']],
            [$balmesUsers['marta'], $balmesUsers['alex']],
            [$balmesUsers['nuria'], $balmesUsers['marta']],
            [$balmesUsers['jordi'], $balmesUsers['alex']],

            // Campanar internal follows
            [$campanarUsers['pablo'],  $campanarUsers['teacher']],
            [$campanarUsers['elena'],  $campanarUsers['teacher']],
            [$campanarUsers['david'],  $campanarUsers['teacher']],
            [$campanarUsers['pablo'],  $campanarUsers['elena']],
            [$campanarUsers['elena'],  $campanarUsers['david']],

            // Cross-center follows (people discover each other on the global feed)
            [$pedralbesUsers['ike'],   $balmesUsers['marta']],
            [$pedralbesUsers['pol'],   $campanarUsers['david']],
            [$balmesUsers['alex'],     $pedralbesUsers['marc']],
            [$campanarUsers['elena'],  $pedralbesUsers['iza']],
            [$normalUsers['lucia'],    $pedralbesUsers['ike']],
            [$normalUsers['lucia'],    $balmesUsers['marta']],
            [$normalUsers['sergio'],   $campanarUsers['teacher']],
            [$normalUsers['sergio'],   $pedralbesUsers['pol']],
        ];

        foreach ($follows as [$follower, $followed]) {
            DB::table('follows')->insert([
                'follower_id' => $follower,
                'followed_id' => $followed,
                'created_at'  => $now->copy()->subDays(rand(1, 30)),
                'updated_at'  => $now,
            ]);
        }

        echo "✅ " . count($follows) . " follows created\n";

        // ─────────────────────────────────────────────────────────────
        //  POSTS — Global feed (news + questions, no center)
        // ─────────────────────────────────────────────────────────────

        $postIds = [];

        // Helper to insert a post and return its ID
        $makePost = function (array $data) use ($now, &$postIds) {
            $defaults = [
                'type'       => 'news',
                'center_id'  => null,
                'is_solved'  => false,
                'image_url'  => null,
                'created_at' => $now->copy()->subHours(rand(1, 200)),
                'updated_at' => $now,
            ];
            $id = DB::table('posts')->insertGetId(array_merge($defaults, $data));
            $postIds[] = $id;
            return $id;
        };

        // ── GLOBAL posts (no center_id) ──

        $p1 = $makePost([
            'user_id' => $pedralbesUsers['ike'],
            'content' => "Acabo de desplegar mi primer proyecto con Docker Compose 🐳🎉\n\nTengo un stack con:\n- Nginx como reverse proxy\n- Laravel API con PHP-FPM\n- MySQL 8\n- Redis para caché\n\nLa verdad es que una vez entiendes los volúmenes y las networks, todo tiene mucho más sentido. El docker-compose.yml lo simplifica todo bastante.",
            'code_snippet' => "version: '3.8'\nservices:\n  app:\n    build: ./api\n    volumes:\n      - ./api:/var/www/html\n    depends_on:\n      - mysql\n      - redis\n  \n  nginx:\n    image: nginx:alpine\n    ports:\n      - '80:80'\n    volumes:\n      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf\n  \n  mysql:\n    image: mysql:8.0\n    environment:\n      MYSQL_DATABASE: app\n      MYSQL_ROOT_PASSWORD: secret",
            'code_language' => 'yaml',
            'created_at' => $now->copy()->subHours(3),
        ]);

        $p2 = $makePost([
            'user_id' => $balmesUsers['marta'],
            'content' => "✨ CSS tip del día: ¿Sabíais que con una sola propiedad podéis hacer un grid responsive sin media queries?\n\nEl truco está en usar auto-fit con minmax(). El navegador se encarga de calcular cuántas columnas caben. Esto me ha ahorrado HORAS de media queries.",
            'code_snippet' => ".grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n  gap: 1.5rem;\n  padding: 1rem;\n}",
            'code_language' => 'css',
            'created_at' => $now->copy()->subHours(5),
        ]);

        $p3 = $makePost([
            'user_id' => $campanarUsers['david'],
            'content' => "🎮 Mi primer juego en Unity ya está tomando forma. Es un plataformas 2D estilo retro con mecánicas de dash y wall jump.\n\nEl sistema de movimiento lo he basado en una state machine para manejar las transiciones entre estados (idle, run, jump, dash, wallSlide...).\n\nAquí os dejo el snippet del PlayerController:",
            'code_snippet' => "public class PlayerController : MonoBehaviour\n{\n    [SerializeField] private float moveSpeed = 8f;\n    [SerializeField] private float jumpForce = 16f;\n    [SerializeField] private float dashSpeed = 24f;\n    \n    private Rigidbody2D rb;\n    private PlayerState currentState;\n    \n    void Update()\n    {\n        currentState.HandleInput(this);\n        currentState.Update(this);\n    }\n    \n    public void ChangeState(PlayerState newState)\n    {\n        currentState?.Exit(this);\n        currentState = newState;\n        currentState.Enter(this);\n    }\n}",
            'code_language' => 'csharp',
            'created_at' => $now->copy()->subHours(8),
        ]);

        $p4 = $makePost([
            'user_id' => $pedralbesUsers['marc'],
            'content' => "Tip para los que trabajáis con Laravel: las Form Requests son una maravilla para mantener los controladores limpios. En vez de validar en el controlador, cread una clase Request separada.\n\nVentajas:\n- Controlador limpio y legible\n- Reglas de validación reutilizables\n- Mensajes de error personalizados\n- Autorización integrada con authorize()",
            'code_snippet' => "<?php\n\nnamespace App\\Http\\Requests;\n\nuse Illuminate\\Foundation\\Http\\FormRequest;\n\nclass StorePostRequest extends FormRequest\n{\n    public function authorize(): bool\n    {\n        return true;\n    }\n\n    public function rules(): array\n    {\n        return [\n            'content'       => 'required|string|max:5000',\n            'type'          => 'required|in:news,question',\n            'code_snippet'  => 'nullable|string|max:10000',\n            'code_language' => 'nullable|string|max:50',\n            'tags'          => 'nullable|array|max:5',\n            'tags.*'        => 'string|max:30',\n        ];\n    }\n}",
            'code_language' => 'php',
            'created_at' => $now->copy()->subHours(12),
        ]);

        $p5 = $makePost([
            'user_id' => $normalUsers['sergio'],
            'content' => "Después de 6 meses como freelance puedo decir que aprender a trabajar con APIs REST fue lo mejor que hice.\n\nMi stack actual para clientes:\n🔹 Frontend: React + Tailwind\n🔹 Backend: Node.js + Express\n🔹 DB: MongoDB con Mongoose\n🔹 Deploy: VPS con Docker\n\nEl 80% de los proyectos que me piden se resuelven con esta combinación. Simple, escalable y fácil de mantener.",
            'created_at' => $now->copy()->subHours(18),
        ]);

        $p6 = $makePost([
            'user_id' => $balmesUsers['alex'],
            'content' => "He estado probando Kotlin Coroutines para manejar llamadas a APIs en Android y el código queda muchísimo más limpio que con callbacks o RxJava.\n\nEl concepto de suspend functions + viewModelScope simplifica todo el manejo asíncrono. Os dejo un ejemplo básico:",
            'code_snippet' => "class UserViewModel(private val repo: UserRepository) : ViewModel() {\n    \n    private val _users = MutableStateFlow<List<User>>(emptyList())\n    val users: StateFlow<List<User>> = _users.asStateFlow()\n    \n    fun loadUsers() {\n        viewModelScope.launch {\n            try {\n                _users.value = repo.getUsers()\n            } catch (e: Exception) {\n                Log.e(\"UserVM\", \"Error loading users\", e)\n            }\n        }\n    }\n}",
            'code_language' => 'kotlin',
            'created_at' => $now->copy()->subHours(24),
        ]);

        $p7 = $makePost([
            'user_id' => $campanarUsers['elena'],
            'content' => "🛡️ Recordatorio de seguridad: NUNCA almacenéis contraseñas en texto plano en la base de datos.\n\nUsar bcrypt o Argon2 es obligatorio. En Python con Flask es súper fácil con werkzeug:\n\nTambién recordad: nunca exponer el hash en las APIs, nunca enviar contraseñas por email, y siempre usar HTTPS.",
            'code_snippet' => "from werkzeug.security import generate_password_hash, check_password_hash\n\n# Al registrar\nhashed = generate_password_hash('mi_password', method='pbkdf2:sha256')\n\n# Al hacer login\nif check_password_hash(stored_hash, password_input):\n    print('Login correcto')\nelse:\n    print('Contraseña incorrecta')",
            'code_language' => 'python',
            'created_at' => $now->copy()->subHours(30),
        ]);

        $p8 = $makePost([
            'user_id' => $pedralbesUsers['pol'],
            'content' => "He empezado a aprender Vue.js viniendo de React y la verdad es que la reactividad de Vue se siente muy natural. La Composition API con <script setup> es lo más parecido a React hooks que he visto.\n\nLo que más me gusta:\n- ref() y reactive() son intuitivos\n- computed() en vez de useMemo\n- watchEffect() para side effects\n- v-model que ahorra tanto código\n\nEso sí, echo de menos el ecosistema de librerías de React.",
            'created_at' => $now->copy()->subHours(36),
        ]);

        $p9 = $makePost([
            'user_id' => $normalUsers['lucia'],
            'content' => "📚 Recursos gratuitos que me han ayudado a aprender JavaScript desde cero:\n\n1. The Odin Project — Curriculum completo full-stack\n2. JavaScript.info — La mejor referencia del lenguaje\n3. FreeCodeCamp — Ejercicios prácticos paso a paso\n4. MDN Web Docs — Documentación oficial de referencia\n5. Eloquent JavaScript — Libro gratuito online\n\nSi alguien está empezando, os recomiendo empezar por The Odin Project, es increíble. 💪",
            'created_at' => $now->copy()->subHours(40),
        ]);

        $p10 = $makePost([
            'user_id' => $balmesUsers['jordi'],
            'content' => "Configurando mi primer servidor Linux desde cero para un proyecto de clase. Stack LAMP en Ubuntu Server 22.04.\n\nApuntes rápidos:\n- SSH con clave pública (adiós password)\n- UFW para firewall (solo 22, 80, 443)\n- Fail2ban contra fuerza bruta\n- Certbot para SSL gratis con Let's Encrypt\n\n¿Algún consejo más de hardening para principiantes?",
            'code_snippet' => "# Configuración básica de seguridad\nsudo ufw allow 22/tcp\nsudo ufw allow 80/tcp\nsudo ufw allow 443/tcp\nsudo ufw enable\n\n# Fail2ban\nsudo apt install fail2ban\nsudo systemctl enable fail2ban\n\n# Certbot SSL\nsudo apt install certbot python3-certbot-apache\nsudo certbot --apache -d midominio.com",
            'code_language' => 'bash',
            'created_at' => $now->copy()->subHours(48),
        ]);

        $p11 = $makePost([
            'user_id' => $pedralbesUsers['iza'],
            'content' => "📢 Para mis alumnos y para todos los que estéis aprendiendo desarrollo web:\n\nLa diferencia entre un junior y un mid no es saber más frameworks. Es entender los fundamentos:\n\n- HTTP (métodos, status codes, headers)\n- Cómo funciona DNS\n- Qué pasa cuando escribes una URL en el navegador\n- Autenticación vs Autorización\n- CORS y por qué existe\n- SQL joins y optimización de queries\n\nAntes de aprender el framework de moda, aseguraos de tener esta base sólida. 🧱",
            'created_at' => $now->copy()->subHours(55),
        ]);

        // ── GLOBAL QUESTIONS ──

        $q1 = $makePost([
            'user_id' => $pedralbesUsers['pol'],
            'type'    => 'question',
            'content' => "¿Alguien sabe cómo conectar MongoDB con Node.js usando Mongoose? He seguido la documentación pero me da error de conexión.\n\nEstoy usando MongoDB Atlas (la versión gratuita) y cuando intento conectar me sale:\n`MongoServerError: bad auth : authentication failed`\n\n¿Puede ser un problema con la IP whitelist o con las credenciales?",
            'code_snippet' => "const mongoose = require('mongoose');\n\nmongoose.connect('mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/mydb')\n  .then(() => console.log('Connected to MongoDB'))\n  .catch(err => console.error('Connection error:', err));",
            'code_language' => 'javascript',
            'created_at' => $now->copy()->subHours(6),
        ]);

        $q2 = $makePost([
            'user_id' => $balmesUsers['nuria'],
            'type'    => 'question',
            'content' => "¿Cuál es la mejor manera de manejar el estado global en React? Estoy haciendo un proyecto mediano y no sé si usar Context API, Redux, o Zustand.\n\nEl proyecto tiene:\n- Autenticación (login/register)\n- Un feed de posts con paginación\n- Notificaciones en tiempo real\n- Chat entre usuarios\n\n¿Qué me recomendáis para este nivel de complejidad?",
            'created_at' => $now->copy()->subHours(15),
        ]);

        $q3 = $makePost([
            'user_id' => $campanarUsers['pablo'],
            'type'    => 'question',
            'content' => "Tengo un problema con las migraciones de Laravel. He cambiado una columna en una migración antigua y ahora al hacer `php artisan migrate:fresh` me da error.\n\n¿Es mejor crear una nueva migración que modifique la columna o editar la migración original? ¿Qué hacéis vosotros en un proyecto de equipo?",
            'created_at' => $now->copy()->subHours(22),
        ]);

        $q4 = $makePost([
            'user_id' => $normalUsers['lucia'],
            'type'    => 'question',
            'content' => "¿Cómo puedo hacer que un formulario en JavaScript valide en tiempo real? Quiero que mientras el usuario escribe, le vaya diciendo si el email es válido, si la contraseña cumple los requisitos, etc.\n\n¿Usáis alguna librería o lo hacéis con vanilla JS?",
            'created_at' => $now->copy()->subHours(50),
        ]);

        $q5 = $makePost([
            'user_id' => $balmesUsers['alex'],
            'type'    => 'question',
            'content' => "¿Alguien ha trabajado con Room Database en Android? Necesito cachear datos de una API para que la app funcione offline.\n\n¿Room es la mejor opción o hay alternativas más modernas? He visto que existe SQLDelight también.",
            'created_at' => $now->copy()->subHours(60),
        ]);

        echo "✅ " . count($postIds) . " global posts created\n";

        // ─────────────────────────────────────────────────────────────
        //  POSTS — Center-specific (Institut Pedralbes)
        // ─────────────────────────────────────────────────────────────

        $cp1 = $makePost([
            'user_id'   => $pedralbesUsers['iza'],
            'center_id' => $pedralbesId,
            'content'   => "📢 RECORDATORIO: La entrega del proyecto final es el lunes 9 de marzo.\n\nRequisitos mínimos:\n- Frontend funcional desplegado\n- API REST documentada\n- Docker Compose para el entorno\n- README con instrucciones de instalación\n- Presentación de 10 minutos\n\nSi tenéis dudas sobre el despliegue, venid al laboratorio el viernes por la tarde. ¡Ánimo que ya queda poco! 💪",
            'created_at' => $now->copy()->subHours(2),
        ]);

        $cp2 = $makePost([
            'user_id'   => $pedralbesUsers['ike'],
            'center_id' => $pedralbesId,
            'content'   => "El proyecto va tomando forma 🔥 Hemos conseguido integrar Socket.io con el backend de Laravel para los mensajes en tiempo real.\n\nEl flujo es: React → Socket.io → Node.js server → API Laravel → MySQL, y después broadcast de vuelta al cliente.\n\nHa costado lo suyo pero funciona bastante bien.",
            'created_at' => $now->copy()->subHours(10),
        ]);

        $cp3 = $makePost([
            'user_id'   => $pedralbesUsers['marc'],
            'center_id' => $pedralbesId,
            'type'      => 'question',
            'content'   => "Chicos, ¿alguien sabe cómo hacer que los seeders de Laravel creen datos más realistas? He visto que existe Faker pero no sé cómo usarlo bien con relaciones entre tablas.\n\nPor ejemplo, quiero crear usuarios que tengan posts, y esos posts tengan tags y comentarios. ¿Cómo manejáis esas dependencias?",
            'created_at' => $now->copy()->subHours(20),
        ]);

        $cp4 = $makePost([
            'user_id'   => $pedralbesUsers['pol'],
            'center_id' => $pedralbesId,
            'content'   => "He hecho un mini tutorial para los compañeros sobre cómo configurar ESLint + Prettier en un proyecto React con Vite.\n\nPasos:\n1. `npm install -D eslint prettier eslint-config-prettier`\n2. Crear `.eslintrc.cjs` con las reglas\n3. Crear `.prettierrc` con el formato\n4. Añadir scripts al package.json\n5. Instalar extensiones en VS Code\n\nSi alguien lo necesita le paso la config completa por DM 📩",
            'created_at' => $now->copy()->subHours(28),
        ]);

        $cp5 = $makePost([
            'user_id'   => $pedralbesUsers['iza'],
            'center_id' => $pedralbesId,
            'type'      => 'question',
            'content'   => "Pregunta para debatir en clase: ¿Cuándo usaríais una base de datos NoSQL (MongoDB) en vez de SQL (MySQL/PostgreSQL)?\n\nDadme ejemplos concretos de proyectos donde cada una sería mejor opción. Quiero que lo argumentéis con criterios técnicos.",
            'created_at' => $now->copy()->subHours(72),
        ]);

        echo "✅ 5 Pedralbes center posts created\n";

        // ─────────────────────────────────────────────────────────────
        //  POSTS — Center-specific (IES Jaume Balmes)
        // ─────────────────────────────────────────────────────────────

        $bp1 = $makePost([
            'user_id'   => $balmesUsers['teacher'],
            'center_id' => $balmesId,
            'content'   => "🔔 Horario de tutorías actualizado para este trimestre:\n\n- Lunes: 10:00 - 11:30 (Lab 204)\n- Miércoles: 16:00 - 17:30 (Despacho 12)\n- Viernes: 12:00 - 13:00 (Online por Meet)\n\nPara cualquier duda de ASIX o DAM, no dudéis en venir. También podéis escribirme por aquí.",
            'created_at' => $now->copy()->subHours(4),
        ]);

        $bp2 = $makePost([
            'user_id'   => $balmesUsers['marta'],
            'center_id' => $balmesId,
            'content'   => "He terminado el mockup en Figma para nuestro proyecto de centro. Diseño dark mode con acentos en teal y violeta.\n\nComponentes diseñados:\n✅ Sistema de botones (primary, secondary, ghost)\n✅ Cards para posts y perfiles\n✅ Formularios con validación visual\n✅ Navbar responsive\n✅ Sistema de notificaciones\n\nMañana paso el enlace al Figma para que lo veáis.",
            'created_at' => $now->copy()->subHours(14),
        ]);

        $bp3 = $makePost([
            'user_id'   => $balmesUsers['jordi'],
            'center_id' => $balmesId,
            'type'      => 'question',
            'content'   => "Para el proyecto de redes, necesito montar un servidor DHCP en la red virtual. ¿Alguien ha usado ISC DHCP Server en Ubuntu? Me está costando la configuración del dhcpd.conf.\n\n¿O es mejor usar dnsmasq que hace DHCP + DNS a la vez?",
            'created_at' => $now->copy()->subHours(35),
        ]);

        $bp4 = $makePost([
            'user_id'   => $balmesUsers['alex'],
            'center_id' => $balmesId,
            'content'   => "Nuestra app de Android para el proyecto ya se conecta a la API. Usando Retrofit + Coroutines + Hilt para inyección de dependencias.\n\nEl flow es:\nUI (Jetpack Compose) → ViewModel → Repository → Retrofit → API\n\nEl patrón MVVM con Clean Architecture está quedando muy organizado. Se nota la diferencia cuando el proyecto crece.",
            'created_at' => $now->copy()->subHours(42),
        ]);

        echo "✅ 4 Balmes center posts created\n";

        // ─────────────────────────────────────────────────────────────
        //  POSTS — Center-specific (IES Campanar)
        // ─────────────────────────────────────────────────────────────

        $camp1 = $makePost([
            'user_id'   => $campanarUsers['teacher'],
            'center_id' => $campanarId,
            'content'   => "🎯 Objetivos del sprint 3 para los equipos de DAW:\n\n- Equipo A: Integrar pasarela de pago (Stripe)\n- Equipo B: Sistema de notificaciones push\n- Equipo C: Panel de administración con gráficos\n\nRevisión el viernes a las 12:00. Preparad la demo con datos de prueba.",
            'created_at' => $now->copy()->subHours(7),
        ]);

        $camp2 = $makePost([
            'user_id'   => $campanarUsers['elena'],
            'center_id' => $campanarId,
            'content'   => "He descubierto que SQLAlchemy en Python es una pasada para trabajar con bases de datos. El ORM es muy parecido a Eloquent de Laravel pero en Python.\n\nEl sistema de migrations con Alembic también funciona genial. Si alguien viene de Laravel, la transición es bastante suave.",
            'code_snippet' => "from sqlalchemy import Column, Integer, String, ForeignKey\nfrom sqlalchemy.orm import relationship\n\nclass User(Base):\n    __tablename__ = 'users'\n    \n    id = Column(Integer, primary_key=True)\n    name = Column(String(100), nullable=False)\n    email = Column(String(255), unique=True)\n    posts = relationship('Post', back_populates='author')\n\nclass Post(Base):\n    __tablename__ = 'posts'\n    \n    id = Column(Integer, primary_key=True)\n    title = Column(String(200))\n    user_id = Column(Integer, ForeignKey('users.id'))\n    author = relationship('User', back_populates='posts')",
            'code_language' => 'python',
            'created_at' => $now->copy()->subHours(26),
        ]);

        $camp3 = $makePost([
            'user_id'   => $campanarUsers['david'],
            'center_id' => $campanarId,
            'type'      => 'question',
            'content'   => "¿Alguien del centro ha usado Unity con el nuevo Input System? He pasado del antiguo Input.GetKey() al PlayerInput component y me está costando entender los Action Maps.\n\n¿Algún tutorial que recomendéis?",
            'created_at' => $now->copy()->subHours(50),
        ]);

        echo "✅ 3 Campanar center posts created\n";

        // ─────────────────────────────────────────────────────────────
        //  More global posts for variety
        // ─────────────────────────────────────────────────────────────

        $makePost([
            'user_id' => $pedralbesUsers['iza'],
            'content' => "🧵 Hilo sobre buenas prácticas en Git para equipos:\n\n1. Usa ramas descriptivas: feature/login, fix/navbar-responsive\n2. Commits atómicos con mensajes claros (conventional commits)\n3. Pull Request con al menos 1 reviewer\n4. Nunca hacer push a main directamente\n5. Rebase antes de merge para mantener el historial limpio\n6. Usa .gitignore desde el día 1\n7. Tags para las releases (v1.0.0, v1.1.0)\n\nEstas reglas simples os van a ahorrar MUCHOS problemas en equipo.",
            'created_at' => $now->copy()->subHours(65),
        ]);

        $makePost([
            'user_id' => $balmesUsers['teacher'],
            'content' => "Para los que estáis aprendiendo DevOps, os comparto los conceptos clave que un junior debería conocer:\n\n📦 Contenedores (Docker)\n🔄 CI/CD (GitHub Actions, GitLab CI)\n☁️ Cloud basics (AWS/GCP/Azure)\n📊 Monitorización (Grafana, Prometheus)\n🔒 Seguridad (OWASP, SSL/TLS)\n📝 IaC (Terraform, Ansible)\n\nNo hace falta dominarlos todos, pero sí entender qué hace cada uno y cuándo usarlo.",
            'created_at' => $now->copy()->subHours(75),
        ]);

        $makePost([
            'user_id' => $normalUsers['lucia'],
            'content' => "¡He conseguido mi primera contribución a un proyecto open source! 🎉\n\nFue un fix pequeñito (corregir un typo en la documentación) pero la sensación de que te acepten el PR es increíble.\n\nConsejo: si queréis empezar a contribuir, buscad issues etiquetados como \"good first issue\" o \"beginner friendly\" en GitHub. Hay muchos proyectos buscando ayuda.",
            'created_at' => $now->copy()->subHours(80),
        ]);

        $makePost([
            'user_id' => $campanarUsers['pablo'],
            'content' => "Mi setup de desarrollo para Vue.js 3 + TypeScript:\n\n- Vite como bundler (rapidísimo)\n- Pinia para state management\n- Vue Router 4\n- VueUse para composables útiles\n- Vitest para testing\n- Prettier + ESLint\n\nLa experiencia de desarrollo con Vite es otra cosa comparado con Webpack. Hot reload instantáneo 🚀",
            'code_snippet' => "// stores/counter.ts\nimport { defineStore } from 'pinia'\n\nexport const useCounterStore = defineStore('counter', () => {\n  const count = ref(0)\n  const doubleCount = computed(() => count.value * 2)\n  \n  function increment() {\n    count.value++\n  }\n  \n  return { count, doubleCount, increment }\n})",
            'code_language' => 'typescript',
            'created_at' => $now->copy()->subHours(90),
        ]);

        $makePost([
            'user_id' => $pedralbesUsers['marc'],
            'type'    => 'question',
            'content' => "¿Qué opináis de usar JWT vs sesiones con cookies para autenticación en una API REST?\n\nEn clase usamos Sanctum (Laravel) que soporta ambas. Para una SPA, ¿cuál es más seguro y práctico?\n\nHe leído que JWT tiene problemas con la revocación de tokens y que las cookies httpOnly son más seguras... pero JWT es stateless, lo cual mola para escalar.",
            'created_at' => $now->copy()->subHours(100),
        ]);

        $makePost([
            'user_id' => $balmesUsers['nuria'],
            'content' => "🎨 Principios de diseño que todo developer debería conocer:\n\n1. Contraste — Asegura legibilidad\n2. Jerarquía — Guía el ojo del usuario\n3. Whitespace — No tengas miedo del espacio vacío\n4. Consistencia — Mismos patrones en toda la app\n5. Feedback — El usuario siempre debe saber qué está pasando\n6. Accesibilidad — Diseña para todos\n\nNo hace falta ser diseñador para aplicar estos principios. Tu UX mejorará un 200%.",
            'created_at' => $now->copy()->subHours(110),
        ]);

        $makePost([
            'user_id' => $campanarUsers['teacher'],
            'content' => "Hoy he enseñado en clase cómo estructurar una API REST correctamente. Resumo los puntos clave:\n\n✅ Usar sustantivos en plural: /api/users, /api/posts\n✅ Verbos HTTP correctos: GET, POST, PUT/PATCH, DELETE\n✅ Status codes adecuados: 200, 201, 400, 401, 403, 404, 422, 500\n✅ Versionado: /api/v1/users\n✅ Paginación en listas: ?page=1&per_page=20\n✅ Filtros como query params: ?status=active&role=student\n\nUna API bien diseñada es un placer para quien la consume.",
            'created_at' => $now->copy()->subHours(120),
        ]);

        echo "✅ " . count($postIds) . " total posts created\n";

        // ─────────────────────────────────────────────────────────────
        //  TAG ASSIGNMENTS
        // ─────────────────────────────────────────────────────────────

        $tagAssignments = [
            [$p1,  ['docker', 'laravel', 'devops']],
            [$p2,  ['css', 'javascript']],
            [$p3,  ['unity', 'csharp']],
            [$p4,  ['laravel', 'php']],
            [$p5,  ['react', 'nodejs', 'mongodb', 'api-rest']],
            [$p6,  ['javascript', 'api-rest']],
            [$p7,  ['python', 'sql']],
            [$p8,  ['vuejs', 'react', 'javascript']],
            [$p9,  ['javascript']],
            [$p10, ['linux', 'devops']],
            [$p11, ['api-rest', 'sql']],
            [$q1,  ['mongodb', 'nodejs', 'javascript']],
            [$q2,  ['react', 'javascript']],
            [$q3,  ['laravel', 'php']],
            [$q4,  ['javascript']],
            [$q5,  ['sql']],
            [$cp1, ['docker', 'laravel', 'react']],
            [$cp2, ['react', 'laravel', 'nodejs']],
            [$cp3, ['laravel', 'php']],
            [$cp4, ['react', 'javascript']],
            [$cp5, ['mongodb', 'sql']],
            [$bp2, ['css', 'react']],
            [$bp3, ['linux']],
            [$bp4, ['api-rest']],
            [$camp2, ['python', 'sql']],
            [$camp3, ['unity', 'csharp']],
        ];

        foreach ($tagAssignments as [$postId, $slugs]) {
            foreach ($slugs as $slug) {
                if (isset($tags[$slug])) {
                    DB::table('post_tag')->insert([
                        'post_id' => $postId,
                        'tag_id'  => $tags[$slug],
                    ]);
                }
            }
        }

        echo "✅ Tag assignments done\n";

        // ─────────────────────────────────────────────────────────────
        //  COMMENTS
        // ─────────────────────────────────────────────────────────────

        $comments = [
            // Comments on Docker post (p1)
            [$p1, $pedralbesUsers['marc'], 'Muy bien explicado! A mí me costó entender lo de los volúmenes al principio. Un truco: usa named volumes para persistir datos de MySQL entre rebuilds.'],
            [$p1, $balmesUsers['alex'], 'Docker Compose es de lo mejor que he aprendido este año. Tip: añade `restart: unless-stopped` a los servicios para que se levanten solos tras un reboot.'],
            [$p1, $pedralbesUsers['iza'], 'Buen trabajo Ike 👏 Para la presentación, asegúrate de tener un .env.example documentado para que cualquiera pueda levantar el entorno.'],

            // Comments on CSS Grid post (p2)
            [$p2, $balmesUsers['nuria'], '¡Me encanta este truco! Lo he aplicado en mi portfolio y queda genial. Adiós media queries para el grid 🎉'],
            [$p2, $pedralbesUsers['pol'], 'Wow, no conocía auto-fit. Siempre hacía media queries manualmente. Esto me ahorra mucho tiempo, gracias!'],
            [$p2, $normalUsers['lucia'], 'CSS Grid es una maravilla. ¿Has probado combinarlo con subgrid? Es el futuro del layout 💯'],

            // Comments on Unity post (p3)
            [$p3, $campanarUsers['david'], 'Actualización: ya tengo el dash funcionando. El truco fue usar Coroutines para el cooldown.'],
            [$p3, $campanarUsers['pablo'], 'Qué chulo! Si necesitas sprites gratuitos, mira itch.io, tienen packs retro increíbles.'],

            // Comments on MongoDB question (q1)
            [$q1, $pedralbesUsers['marc'], "El error de autenticación suele ser porque no has añadido tu IP actual al whitelist de Atlas. Ve a Network Access → Add IP Address → Allow Access from Anywhere (para desarrollo)."],
            [$q1, $normalUsers['sergio'], "También comprueba que el usuario de la base de datos tiene permisos de readWrite. En Atlas a veces se crea con permisos limitados."],
            [$q1, $pedralbesUsers['iza'], 'Recordad que en producción NO debéis usar "Allow Access from Anywhere". Siempre restringid las IPs. Para desarrollo está bien temporalmente.'],

            // Comments on React state question (q2)
            [$q2, $pedralbesUsers['ike'], "Para ese nivel de complejidad yo usaría Zustand. Es mucho más simple que Redux y más potente que Context API. La API es mínima y funciona genial."],
            [$q2, $balmesUsers['marta'], "Context API para auth y tema, y Zustand para el estado más complejo como el feed. Es la combinación que usamos en nuestro proyecto y va muy bien."],
            [$q2, $normalUsers['sergio'], 'Redux Toolkit ha mejorado mucho. Ya no es tan verboso como antes. Pero si es tu primer proyecto grande, Zustand es más fácil de aprender.'],

            // Comments on Laravel migrations question (q3)
            [$q3, $pedralbesUsers['marc'], 'En equipo, SIEMPRE nueva migración. Nunca edites una migración que ya se haya ejecutado en otro entorno. `php artisan make:migration modify_column_in_table`'],
            [$q3, $pedralbesUsers['iza'], 'Marc tiene razón. La regla de oro: las migraciones una vez pusheadas son inmutables. Si necesitas cambiar algo, crea una nueva migración que altere la tabla.'],

            // Comments on center posts
            [$cp1, $pedralbesUsers['ike'], '¡Listo para la entrega! Docker Compose ya funciona, solo falta pulir el README. Nos vemos el viernes en el lab.'],
            [$cp1, $pedralbesUsers['pol'], 'Yo también voy a ir el viernes. Tengo un problema con el build de producción que quiero revisar.'],
            [$cp2, $pedralbesUsers['marc'], 'La integración con Socket.io ha quedado brutal. El tiempo real se nota mucho en la experiencia de usuario.'],
            [$cp3, $pedralbesUsers['iza'], 'Buena pregunta Marc. Te recomiendo mirar las Factories de Laravel. Puedes definir estados y relaciones. El método `has()` y `for()` son clave.'],

            // Comments on Balmes center posts
            [$bp1, $balmesUsers['alex'], 'Genial, iré el lunes por la mañana. Tengo dudas sobre el proyecto de Android.'],
            [$bp2, $balmesUsers['jordi'], 'El diseño queda muy profesional Marta. ¿Usaste algún design system como base?'],
            [$bp2, $balmesUsers['nuria'], 'Me encanta la paleta de colores! Dark mode con teal queda muy tech. Ojalá hacemos algo así para nuestro proyecto.'],

            // Comments on Campanar center post
            [$camp1, $campanarUsers['elena'], 'Equipo C aquí ✋ Ya tenemos Chart.js integrado con los datos del backend. La demo estará lista.'],
            [$camp2, $campanarUsers['david'], 'Interesante! No sabía que SQLAlchemy era tan parecido a Eloquent. A lo mejor lo pruebo para el TFG.'],

            // Comments on JS validation question (q4)
            [$q4, $pedralbesUsers['ike'], "Con vanilla JS puedes usar el evento 'input' en vez de 'change' para validar en tiempo real. Crea funciones de validación separadas y llámalas en cada input."],
            [$q4, $balmesUsers['nuria'], "Yo uso React Hook Form + Zod. La validación es declarativa y el rendimiento es excelente. Para vanilla JS, Yup también está bien."],
        ];

        foreach ($comments as [$postId, $userId, $content]) {
            DB::table('comments')->insert([
                'post_id'    => $postId,
                'user_id'    => $userId,
                'content'    => $content,
                'created_at' => $now->copy()->subHours(rand(1, 48)),
                'updated_at' => $now,
            ]);
        }

        // Mark q1 as solved (MongoDB question)
        DB::table('posts')->where('id', $q1)->update(['is_solved' => true]);

        echo "✅ " . count($comments) . " comments created\n";

        // ─────────────────────────────────────────────────────────────
        //  LIKES (using interactions table — polymorphic)
        // ─────────────────────────────────────────────────────────────

        $likeTargets = [
            // Popular posts get more likes
            [$p1,   [$pedralbesUsers['marc'], $pedralbesUsers['pol'], $pedralbesUsers['iza'], $balmesUsers['alex'], $normalUsers['sergio'], $campanarUsers['elena']]],
            [$p2,   [$balmesUsers['nuria'], $pedralbesUsers['pol'], $normalUsers['lucia'], $balmesUsers['alex'], $campanarUsers['elena']]],
            [$p3,   [$campanarUsers['pablo'], $campanarUsers['teacher'], $pedralbesUsers['pol'], $balmesUsers['jordi']]],
            [$p4,   [$pedralbesUsers['ike'], $pedralbesUsers['pol'], $balmesUsers['teacher'], $normalUsers['sergio']]],
            [$p5,   [$normalUsers['lucia'], $pedralbesUsers['ike'], $balmesUsers['marta'], $campanarUsers['pablo']]],
            [$p6,   [$balmesUsers['teacher'], $balmesUsers['marta'], $campanarUsers['elena']]],
            [$p7,   [$campanarUsers['teacher'], $campanarUsers['david'], $pedralbesUsers['marc'], $balmesUsers['jordi'], $normalUsers['lucia']]],
            [$p8,   [$pedralbesUsers['ike'], $pedralbesUsers['marc'], $balmesUsers['nuria']]],
            [$p9,   [$normalUsers['sergio'], $pedralbesUsers['pol'], $balmesUsers['marta'], $campanarUsers['pablo'], $balmesUsers['jordi']]],
            [$p10,  [$balmesUsers['teacher'], $campanarUsers['elena'], $pedralbesUsers['iza']]],
            [$p11,  [$pedralbesUsers['ike'], $pedralbesUsers['marc'], $pedralbesUsers['pol'], $balmesUsers['alex'], $balmesUsers['marta'], $campanarUsers['elena'], $normalUsers['lucia']]],
            [$q1,   [$pedralbesUsers['iza'], $pedralbesUsers['marc'], $normalUsers['sergio']]],
            [$q2,   [$pedralbesUsers['ike'], $balmesUsers['marta'], $normalUsers['sergio']]],
            [$q3,   [$pedralbesUsers['iza'], $pedralbesUsers['marc']]],
            [$cp1,  [$pedralbesUsers['ike'], $pedralbesUsers['marc'], $pedralbesUsers['pol']]],
            [$cp2,  [$pedralbesUsers['marc'], $pedralbesUsers['pol'], $pedralbesUsers['iza']]],
            [$cp5,  [$pedralbesUsers['ike'], $pedralbesUsers['marc'], $pedralbesUsers['pol']]],
            [$bp2,  [$balmesUsers['alex'], $balmesUsers['jordi'], $balmesUsers['nuria'], $balmesUsers['teacher']]],
        ];

        $likeCount = 0;
        foreach ($likeTargets as [$postId, $userIds]) {
            foreach ($userIds as $uid) {
                DB::table('interactions')->insert([
                    'user_id'           => $uid,
                    'interactable_id'   => $postId,
                    'interactable_type' => 'App\\Models\\Post',
                    'type'              => 'like',
                    'created_at'        => $now->copy()->subHours(rand(1, 72)),
                    'updated_at'        => $now,
                ]);
                $likeCount++;
            }
        }

        echo "✅ $likeCount likes created\n";

        // ─────────────────────────────────────────────────────────────
        //  BOOKMARKS
        // ─────────────────────────────────────────────────────────────

        $bookmarkTargets = [
            [$p1,  [$pedralbesUsers['pol'], $balmesUsers['jordi']]],
            [$p2,  [$balmesUsers['nuria'], $pedralbesUsers['ike']]],
            [$p7,  [$campanarUsers['elena'], $balmesUsers['jordi']]],
            [$p9,  [$normalUsers['lucia'], $pedralbesUsers['pol'], $campanarUsers['pablo']]],
            [$p11, [$pedralbesUsers['ike'], $pedralbesUsers['marc'], $balmesUsers['alex']]],
            [$q2,  [$balmesUsers['nuria']]],
        ];

        $bookmarkCount = 0;
        foreach ($bookmarkTargets as [$postId, $userIds]) {
            foreach ($userIds as $uid) {
                DB::table('interactions')->insert([
                    'user_id'           => $uid,
                    'interactable_id'   => $postId,
                    'interactable_type' => 'App\\Models\\Post',
                    'type'              => 'bookmark',
                    'created_at'        => $now->copy()->subHours(rand(1, 48)),
                    'updated_at'        => $now,
                ]);
                $bookmarkCount++;
            }
        }

        echo "✅ $bookmarkCount bookmarks created\n";

        // ─────────────────────────────────────────────────────────────
        //  SOME NOTIFICATIONS (recent ones for demo)
        // ─────────────────────────────────────────────────────────────

        $notifications = [
            [$pedralbesUsers['ike'], $pedralbesUsers['marc'], 'like', 'App\\Models\\Post', $p1, 'ha dado me gusta a tu publicación'],
            [$pedralbesUsers['ike'], $pedralbesUsers['iza'], 'comment', 'App\\Models\\Post', $p1, 'ha comentado en tu publicación'],
            [$pedralbesUsers['ike'], $balmesUsers['alex'], 'like', 'App\\Models\\Post', $p1, 'ha dado me gusta a tu publicación'],
            [$pedralbesUsers['ike'], $balmesUsers['marta'], 'follow', 'App\\Models\\User', $balmesUsers['marta'], 'ha comenzado a seguirte'],
            [$pedralbesUsers['marc'], $pedralbesUsers['ike'], 'like', 'App\\Models\\Post', $p4, 'ha dado me gusta a tu publicación'],
            [$pedralbesUsers['pol'], $campanarUsers['david'], 'follow', 'App\\Models\\User', $campanarUsers['david'], 'ha comenzado a seguirte'],
            [$balmesUsers['marta'], $balmesUsers['nuria'], 'like', 'App\\Models\\Post', $p2, 'ha dado me gusta a tu publicación'],
            [$balmesUsers['marta'], $pedralbesUsers['pol'], 'comment', 'App\\Models\\Post', $p2, 'ha comentado en tu publicación'],
            [$campanarUsers['david'], $campanarUsers['pablo'], 'comment', 'App\\Models\\Post', $p3, 'ha comentado en tu publicación'],
            [$normalUsers['lucia'], $pedralbesUsers['ike'], 'follow', 'App\\Models\\User', $pedralbesUsers['ike'], 'ha comenzado a seguirte'],
        ];

        foreach ($notifications as [$userId, $senderId, $type, $notifiableType, $notifiableId, $message]) {
            DB::table('notifications')->insert([
                'user_id'          => $userId,
                'sender_id'        => $senderId,
                'type'             => $type,
                'notifiable_type'  => $notifiableType,
                'notifiable_id'    => $notifiableId,
                'message'          => $message,
                'created_at'       => $now->copy()->subHours(rand(1, 24)),
                'updated_at'       => $now,
            ]);
        }

        echo "✅ " . count($notifications) . " notifications created\n";

        echo "\n🎉 Demo seeder completed! All users have password: 'password'\n";
        echo "📧 Pedralbes accounts:\n";
        echo "   - a23izadelesp@inspedralbes.cat (teacher)\n";
        echo "   - a23ikedelgra@inspedralbes.cat (student)\n";
        echo "   - a23marrojgon@inspedralbes.cat (student)\n";
        echo "   - a23poldiabel@inspedralbes.cat (student)\n";
        echo "🔑 Admin: admin@codex.com\n";
    }
}
