<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create a Center
        $centerId = DB::table('centers')->insertGetId([
            'name' => 'Institut Pedralbes',
            'domain' => 'inspedralbes.cat',
            'city' => 'Barcelona',
            'website' => 'https://agora.xtec.cat/iespedralbes/',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        echo "Center created: ID $centerId\n";

        // 2. Create an Admin User (Global)
        $adminId = DB::table('users')->insertGetId([
            'name' => 'Admin System',
            'username' => 'admin',
            'email' => 'admin@codex.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        echo "Admin User created: ID $adminId\n";

        // 3. Create a Teacher User (Linked to Center)
        $teacherId = DB::table('users')->insertGetId([
            'center_id' => $centerId,
            'name' => 'Professor X',
            'username' => 'profx',
            'email' => 'profx@inspedralbes.cat',
            'password' => Hash::make('password'),
            'role' => 'teacher',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        echo "Teacher User created: ID $teacherId\n";

        // 4. Create a Student User (Linked to Center)
        $studentId = DB::table('users')->insertGetId([
            'center_id' => $centerId,
            'name' => 'John Doe',
            'username' => 'johndoe',
            'email' => 'john@inspedralbes.cat',
            'password' => Hash::make('password'),
            'role' => 'student',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        echo "Student User created: ID $studentId\n";

        // 5. Create a Follow
        DB::table('follows')->insert([
            'follower_id' => $studentId,
            'followed_id' => $teacherId,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        echo "Follow created: Student follows Teacher\n";

        // 6. Create a Tag
        $tagId = DB::table('tags')->insertGetId([
            'name' => 'Laravel',
            'slug' => 'laravel',
            'color' => '#FF2D20',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        echo "Tag created: ID $tagId\n";

        // 7. Create a Post (Question)
        $postId = DB::table('posts')->insertGetId([
            'user_id' => $studentId,
            'center_id' => $centerId,
            'type' => 'question',
            'content' => 'How do I install Laravel?',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        echo "Post created: ID $postId\n";

        // 8. Attach Tag to Post
        DB::table('post_tag')->insert([
            'post_id' => $postId,
            'tag_id' => $tagId,
        ]);

        echo "Tag attached to Post\n";

        // 9. Create a Comment (Answer)
        $commentId = DB::table('comments')->insertGetId([
            'user_id' => $teacherId,
            'post_id' => $postId,
            'content' => 'Use composer create-project laravel/laravel',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        echo "Comment created: ID $commentId\n";
    }
}
