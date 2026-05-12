<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trending_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('posts')->onDelete('cascade');
            $table->decimal('score', 10, 4)->default(0);
            $table->unsignedInteger('rank')->default(0);
            $table->timestamp('window_start');
            $table->timestamp('window_end');
            $table->timestamp('computed_at');
            $table->timestamps();

            $table->index(['window_start', 'window_end']);
            $table->index(['computed_at']);
            $table->index(['score']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trending_posts');
    }
};
