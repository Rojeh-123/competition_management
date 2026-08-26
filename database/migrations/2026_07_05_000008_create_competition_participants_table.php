<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('competition_participants')) {
            Schema::create('competition_participants', function (Blueprint $table) {
                $table->foreignId('competition_id')->constrained()->cascadeOnDelete();
                $table->foreignId('participant_id')->constrained('users')->cascadeOnDelete();
                $table->timestamp('joined_at')->useCurrent();
                $table->enum('status', ['joined', 'withdrawn'])->default('joined');
                $table->primary(['competition_id', 'participant_id']);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('competition_participants');
    }
};
