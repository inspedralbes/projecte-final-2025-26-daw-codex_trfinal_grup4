<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. CENTROS (Independiente)
        Schema::create('centers', function (Blueprint $table) {
            $table->id();
            $table->string('name'); 
            $table->string('domain')->unique(); // Ej: "iesfoix.com" (Para validar emails)
            $table->string('city')->nullable();
            $table->string('logo')->nullable(); // URL imagen
            $table->string('website')->nullable();
            $table->text('description')->nullable(); // Descripción/portal del centro
            $table->enum('status', ['pending', 'active', 'rejected'])->default('pending');
            $table->string('justificante')->nullable(); // Path al fichero justificante
            $table->unsignedBigInteger('creator_id')->nullable(); // Profesor que solicitó el centro
            $table->timestamps();
        });

        // 2. USUARIOS (Depende de Centros)
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            
            // NULLABLE: Porque 'admin' y 'userNormal' no tienen centro.
            $table->foreignId('center_id')->nullable()->constrained()->onDelete('cascade');
            
            $table->string('name');
            $table->string('username')->unique(); // @usuario
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password'); // Always set (Google users get a random temp password)
            $table->timestamp('password_set_at')->nullable(); // NULL = user needs to set password (Google OAuth)
            
            // OAuth
            $table->string('google_id')->nullable()->unique(); // Google OAuth identifier
            $table->enum('auth_provider', ['local', 'google'])->default('local');
            
            // ROLES: 
            // - admin/userNormal (Globales, sin centro)
            // - student/teacher (Vinculados a un centro)
            $table->enum('role', ['admin', 'userNormal', 'student', 'teacher'])->default('userNormal');
            
            // Perfil
            $table->string('avatar')->nullable();
            $table->text('bio')->nullable();
            $table->boolean('is_blocked')->default(false); // Bloqueado por profesor/admin
            
            // Redes Sociales
            $table->string('linkedin_url')->nullable();
            $table->string('portfolio_url')->nullable();
            $table->string('external_url')->nullable(); // Twitter/Instagram

            $table->rememberToken();
            $table->timestamps();
        });

        // FK diferida: centers.creator_id → users.id
        Schema::table('centers', function (Blueprint $table) {
            $table->foreign('creator_id')->references('id')->on('users')->onDelete('set null');
        });

        // 2b. SOLICITUDES DE CENTRO (Profesor solicita crear centro)
        Schema::create('center_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('center_name');
            $table->string('domain'); // Dominio propuesto
            $table->string('city')->nullable();
            $table->string('website')->nullable();
            $table->string('full_name'); // Nombre completo del profesor
            $table->string('justificante'); // Path al fichero justificante (obligatorio)
            $table->text('message')->nullable(); // Mensaje opcional para el admin
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('admin_notes')->nullable(); // Notas del admin al aprobar/rechazar
            $table->timestamps();

            $table->index('status');
            $table->index('domain');
        });

        // 3. SEGUIDORES (Usuario sigue a Usuario)
        Schema::create('follows', function (Blueprint $table) {
            $table->foreignId('follower_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('followed_id')->constrained('users')->onDelete('cascade');
            
            // Clave primaria compuesta para evitar duplicados
            $table->primary(['follower_id', 'followed_id']);
            $table->timestamps();
        });

        // 4. POSTS (Contenido)
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Si es NULL -> Post Global. Si tiene ID -> Post del Centro.
            $table->foreignId('center_id')->nullable()->constrained()->onDelete('cascade');

            // REPOST: Si tiene ID, es una copia de otro post.
            $table->foreignId('original_post_id')->nullable()->constrained('posts')->onDelete('cascade');

            // TIPO: Noticia o Duda
            $table->enum('type', ['news', 'question'])->default('news');
            $table->boolean('is_solved')->default(false); // Solo para dudas

            $table->text('content')->nullable(); // Nullable por si es Repost sin texto
            
            // CÓDIGO
            $table->longText('code_snippet')->nullable();
            $table->string('code_language')->nullable(); // 'javascript', 'php', etc.

            $table->timestamps();
            $table->softDeletes(); // Papelera de reciclaje

            // Índices para optimizar consultas del Walled Garden
            $table->index('center_id');
            $table->index(['center_id', 'created_at']);
            $table->index(['user_id', 'center_id']);
        });

        // 5. COMENTARIOS (Respuestas)
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            
            // Hilos (Comentario responde a comentario)
            $table->foreignId('parent_id')->nullable()->constrained('comments')->onDelete('cascade');

            $table->text('content');
            $table->boolean('is_solution')->default(false); // Check verde
            
            $table->timestamps();
        });

        // 6. INTERACCIONES (Likes y Guardados) – Legacy pivot tables
        Schema::create('likes', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            $table->primary(['user_id', 'post_id']);
            $table->timestamp('created_at');
        });

        Schema::create('bookmarks', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            $table->primary(['user_id', 'post_id']);
            $table->timestamp('created_at');
        });

        // 6b. INTERACCIONES POLIMÓRFICAS (like/bookmark sobre posts, comments, etc.)
        Schema::create('interactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->morphs('interactable'); // interactable_id + interactable_type
            $table->enum('type', ['like', 'bookmark'])->default('like');
            $table->timestamps();

            // Evitar duplicados: un usuario solo puede tener una interacción de cada tipo por recurso
            $table->unique(['user_id', 'interactable_id', 'interactable_type', 'type'], 'interactions_unique');
            $table->index(['interactable_id', 'interactable_type']);
        });

        // 7. ETIQUETAS (Tags)
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Ej: "React"
            $table->string('slug')->unique(); // Ej: "react"
            $table->string('color')->nullable(); // Hexadecimal
            $table->timestamps();
        });

        // Pivote: Post tiene Tags
        Schema::create('post_tag', function (Blueprint $table) {
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            $table->foreignId('tag_id')->constrained()->onDelete('cascade');
            $table->primary(['post_id', 'tag_id']);
        });

        // Pivote: Usuario sigue Tags (Notificaciones)
        Schema::create('tag_user', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('tag_id')->constrained()->onDelete('cascade');
            $table->boolean('notify')->default(false); // ¿Enviar push?
            $table->primary(['user_id', 'tag_id']);
        });

        // 8. CHAT (Mensajería Unificada)
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            
            // CHAT PRIVADO: Si tiene receiver_id
            $table->foreignId('receiver_id')->nullable()->constrained('users')->onDelete('cascade');
            
            // CHAT GRUPAL: Si tiene center_id
            $table->foreignId('center_id')->nullable()->constrained('centers')->onDelete('cascade');
            
            $table->text('content');
            $table->boolean('is_read')->default(false); // Leído (Solo 1:1)
            
            $table->timestamps();
            
            // Índices para optimizar la velocidad del chat
            $table->index(['sender_id', 'receiver_id']);
            $table->index('center_id');
        });

        // 9. SANCTUM – Personal Access Tokens
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->text('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();
        });

        // 10. PASSWORD RESET TOKENS
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Borrar en orden inverso para evitar errores de FK
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('tag_user');
        Schema::dropIfExists('post_tag');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('interactions');
        Schema::dropIfExists('bookmarks');
        Schema::dropIfExists('likes');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('follows');
        Schema::dropIfExists('center_requests');
        Schema::table('centers', function (Blueprint $table) {
            $table->dropForeign(['creator_id']);
        });
        Schema::dropIfExists('users');
        Schema::dropIfExists('centers');
    }
};
