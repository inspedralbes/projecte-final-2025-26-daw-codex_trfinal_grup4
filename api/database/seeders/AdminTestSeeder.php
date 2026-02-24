<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Center;
use App\Models\Post;
use App\Models\CenterRequest;

class AdminTestSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Centers with different statuses
        $centers = [
            [
                'name' => 'IES Joan d\'Austria',
                'domain' => 'iesjoandaustria.org',
                'city' => 'Barcelona',
                'status' => 'pending',
                'description' => 'Centro pendiente de revisión.',
                'created_at' => Carbon::now()->subDays(2),
            ],
            [
                'name' => 'CIFP Pau Casesnoves',
                'domain' => 'paucasesnoves.cat',
                'city' => 'Inca',
                'status' => 'rejected',
                'description' => 'Centro rechazado por documentación incompleta.',
                'created_at' => Carbon::now()->subDays(5),
            ],
            [
                'name' => 'IES Jaume Balmes',
                'domain' => 'jaumebalmes.net',
                'city' => 'Barcelona',
                'status' => 'active',
                'description' => 'Centro activo y verificado.',
                'created_at' => Carbon::now()->subMonths(1),
            ],
        ];

        foreach ($centers as $centerData) {
            DB::table('centers')->insert(array_merge($centerData, [
                'updated_at' => Carbon::now(),
            ]));
        }

        // 2. Flagged User (for Moderation testing)
        $flaggedUserId = DB::table('users')->insertGetId([
            'name' => 'Usuario Problemático',
            'username' => 'toxic_user',
            'email' => 'toxic@example.com',
            'password' => Hash::make('password'),
            'role' => 'userNormal',
            'ban_status' => 'flagged',
            'is_blocked' => false,
            'email_verified_at' => Carbon::now(),
            'created_at' => Carbon::now()->subDays(3),
            'updated_at' => Carbon::now(),
        ]);

        // Add some "toxic" posts for this user
        for ($i = 1; $i <= 5; $i++) {
            DB::table('posts')->insert([
                'user_id' => $flaggedUserId,
                'content' => "Este es el post molesto número $i que infringe las normas de la comunidad.",
                'type' => 'news',
                'created_at' => Carbon::now()->subHours($i * 2),
                'updated_at' => Carbon::now(),
            ]);
        }

        // 3. Banned User
        DB::table('users')->insert([
            'name' => 'Usuario Baneado',
            'username' => 'banned_user',
            'email' => 'banned@example.com',
            'password' => Hash::make('password'),
            'role' => 'userNormal',
            'ban_status' => 'banned',
            'is_blocked' => true,
            'email_verified_at' => Carbon::now(),
            'created_at' => Carbon::now()->subMonths(2),
            'updated_at' => Carbon::now(),
        ]);

        // 4. Center Requests
        $studentId = DB::table('users')->where('username', 'johndoe')->value('id') ?? 1;
        
        DB::table('center_requests')->insert([
            [
                'user_id' => $studentId,
                'center_name' => 'IES La Pineda',
                'domain' => 'ieslapineda.cat',
                'city' => 'Badalona',
                'full_name' => 'Marc Soler',
                'justificante' => 'justificantes/pineda.pdf',
                'message' => 'Solicito la creación de nuestro centro para el curso de DAW.',
                'status' => 'pending',
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now(),
            ],
            [
                'user_id' => $studentId,
                'center_name' => 'IES Provençana',
                'domain' => 'provencana.cat',
                'city' => 'L\'Hospitalet',
                'full_name' => 'Anna Garcia',
                'justificante' => 'justificantes/provencana.pdf',
                'message' => 'Centro de referencia en informática.',
                'status' => 'approved',
                'created_at' => Carbon::now()->subDays(10),
                'updated_at' => Carbon::now(),
            ]
        ]);

        // 5. Some extra users for the overview chart
        for ($i = 1; $i <= 10; $i++) {
            DB::table('users')->insert([
                'name' => "Estudiante Test $i",
                'username' => "student_test_$i",
                'email' => "test$i@example.com",
                'password' => Hash::make('password'),
                'role' => 'student',
                'created_at' => Carbon::now()->subDays(rand(1, 30)),
                'updated_at' => Carbon::now(),
            ]);
        }

        echo "Admin Test Data seeded successfully!\n";
    }
}
