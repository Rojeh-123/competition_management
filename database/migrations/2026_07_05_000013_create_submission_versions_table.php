<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('submission_versions')) {
            Schema::create('submission_versions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('submission_id')->constrained()->cascadeOnDelete();
                $table->integer('version_number');
                $table->string('title')->nullable();
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('submission_versions');
    }
};
