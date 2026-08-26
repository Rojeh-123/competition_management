<?php

namespace Tests\Feature;

use App\Models\Competition;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DebugSubmissionRoutesTest extends TestCase
{
    use RefreshDatabase;

    public function test_debug_submission_route_response(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $competition = Competition::create([
            'title' => 'Sample competition',
            'description' => 'Competition for testing.',
            'start_date' => now()->subDay(),
            'submission_deadline' => now()->addDays(5),
            'end_date' => now()->addDays(10),
            'created_by' => $admin->id,
        ]);
        $participant = User::factory()->create(['role' => 'participant']);
        $submission = Submission::create([
            'competition_id' => $competition->id,
            'participant_id' => $participant->id,
            'title' => 'Approval test',
            'description' => 'Needs approval.',
            'status' => 'pending',
        ]);

        $response = $this->withoutMiddleware()
            ->actingAs($admin)
            ->post('/admin/submissions/' . $submission->id . '/approve');

        file_put_contents(__DIR__.'/debug_response.txt', $response->getStatusCode()."\n".$response->getContent()."\n".json_encode($response->headers->all()));
        $this->assertTrue(true);
    }
}
