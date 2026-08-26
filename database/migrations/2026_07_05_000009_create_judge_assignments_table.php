<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('judge_assignments')) {
            Schema::create('judge_assignments', function (Blueprint $table) {
                $table->foreignId('competition_id')->constrained()->cascadeOnDelete();
                $table->foreignId('judge_id')->constrained('users')->cascadeOnDelete();
                $table->timestamp('assigned_at')->useCurrent();
                $table->primary(['competition_id', 'judge_id']);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('judge_assignments');
    }
};
