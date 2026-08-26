<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('competition_sponsors')) {
            Schema::create('competition_sponsors', function (Blueprint $table) {
                $table->foreignId('competition_id')->constrained()->cascadeOnDelete();
                $table->foreignId('sponsor_id')->constrained()->cascadeOnDelete();
                $table->primary(['competition_id', 'sponsor_id']);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('competition_sponsors');
    }
};
