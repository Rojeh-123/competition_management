<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('submission_files')) {
            Schema::create('submission_files', function (Blueprint $table) {
                $table->id();
                $table->foreignId('submission_id')->constrained()->cascadeOnDelete();
                $table->string('file_name')->nullable();
                $table->text('file_path');
                $table->string('file_type')->nullable();
                $table->bigInteger('file_size')->nullable();
                $table->timestamp('uploaded_at')->useCurrent();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('submission_files');
    }
};
