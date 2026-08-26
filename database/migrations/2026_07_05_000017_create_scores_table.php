<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('scores')) {
            Schema::create('scores', function (Blueprint $table) {
                $table->id();
                $table->foreignId('submission_id')->constrained()->cascadeOnDelete();
                $table->foreignId('judge_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('criterion_id')->nullable()->constrained('competition_score_criteria')->nullOnDelete();
                $table->decimal('score', 8, 2)->default(0);
                $table->text('feedback')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('scores');
    }
};
