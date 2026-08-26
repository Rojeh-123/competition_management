<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Competition;
use App\Models\CompetitionWinner;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WinnersPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_winners_page_shows_public_results_with_backend_data(): void
    {
        $creator = User::factory()->create(['role' => 'admin']);
        $participant = User::factory()->create(['role' => 'participant']);
        $category = Category::create([
            'name' => 'Design',
            'slug' => 'design',
        ]);

        $competition = Competition::create([
            'title' => 'AI Design Challenge',
            'description' => 'A public challenge with published winners.',
            'category_id' => $category->id,
            'start_date' => now()->subDays(10),
            'submission_deadline' => now()->subDays(2),
            'end_date' => now()->subDay(),
            'visibility' => 'public',
            'status' => 'results_published',
            'winner_announced_at' => now(),
            'created_by' => $creator->id,
        ]);

        $submission = Submission::create([
            'competition_id' => $competition->id,
            'participant_id' => $participant->id,
            'title' => 'Winning concept',
            'description' => 'A polished submission.',
            'status' => 'approved',
        ]);

        CompetitionWinner::forceCreate([
            'competition_id' => $competition->id,
            'submission_id' => $submission->id,
            'rank' => 1,
            'notes' => 'First place',
        ]);

        $response = $this->actingAs($creator)
            ->get('/winners')
            ->assertOk();

        $payload = $response->json('props.competitions');

        $this->assertCount(1, $payload);
        $this->assertSame('AI Design Challenge', $payload[0]['title']);
        $this->assertSame('Design', $payload[0]['category']);
        $this->assertSame($participant->name, $payload[0]['winners'][0]['participantName']);
    }
}
