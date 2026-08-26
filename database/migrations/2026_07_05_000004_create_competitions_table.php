<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('competitions')) {
            Schema::create('competitions', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('image', 500)->nullable();
                $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
                $table->boolean('is_featured')->default(false);
                $table->text('description')->nullable();
                $table->text('rules')->nullable();
                $table->dateTime('start_date');
                $table->dateTime('registration_deadline')->nullable();
                $table->dateTime('published_at')->nullable();
                $table->dateTime('submission_deadline');
                $table->dateTime('judging_start_date')->nullable();
                $table->dateTime('judging_end_date')->nullable();
                $table->dateTime('end_date');
                $table->dateTime('winner_announced_at')->nullable();
                $table->integer('max_file_size_mb')->nullable();
                $table->text('allowed_file_types')->nullable();
                $table->integer('number_of_winners')->default(3);
                $table->text('prize_description')->nullable();
                $table->enum('visibility', ['public', 'private'])->default('public');
                $table->boolean('team_allowed')->default(false);
                $table->integer('min_age')->nullable();
                $table->integer('max_age')->nullable();
                $table->boolean('certificate_enabled')->default(true);
                $table->boolean('requires_approval')->default(false);
                $table->string('contact_email')->nullable();
                $table->string('contact_phone', 30)->nullable();
                $table->enum('status', ['upcoming', 'open', 'submission_closed', 'judging', 'results_published', 'archived'])->default('upcoming');
                $table->foreignId('created_by')->constrained('users');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('competitions');
    }
};
