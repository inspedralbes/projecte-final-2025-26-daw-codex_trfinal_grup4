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
        Schema::table('group_members', function (Blueprint $table) {
            $table->boolean('is_admin')->default(false)->after('user_id');
            $table->foreignId('last_read_message_id')->nullable()->after('is_admin')->constrained('chat_messages')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('group_members', function (Blueprint $table) {
            $table->dropForeign(['last_read_message_id']);
            $table->dropColumn(['is_admin', 'last_read_message_id']);
        });
    }
};
