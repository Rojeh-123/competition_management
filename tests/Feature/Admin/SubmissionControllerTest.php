<?php

namespace Tests\Feature\Admin;

use App\Models\Competition;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class SubmissionControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_the_submissions_index_page(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $competition = $this->createCompetition($admin);
        $participant = User::factory()->create(['role' => 'participant']);

        Submission::create([
            'competition_id' => $competition->id,
            'participant_id' => $participant->id,
            'title' => 'Smart AI Assistant',
            'description' => 'An AI assistant demo.',
            'status' => 'pending',
        ]);

        $this->withoutMiddleware()
            ->actingAs($admin)
            ->get('/admin/submissions')
            ->assertOk();
    }

    public function test_admin_can_view_a_single_submission_page(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $competition = $this->createCompetition($admin);
        $participant = User::factory()->create(['role' => 'participant']);

        $submission = Submission::create([
            'competition_id' => $competition->id,
            'participant_id' => $participant->id,
            'title' => 'Portfolio Website',
            'description' => 'A modern portfolio.',
            'status' => 'approved',
        ]);

        $this->withoutMiddleware()
            ->actingAs($admin)
            ->get('/admin/submissions/' . $submission->id)
            ->assertOk();
    }

    public function test_admin_can_approve_a_submission(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $competition = $this->createCompetition($admin);
        $participant = User::factory()->create(['role' => 'participant']);
        $submission = Submission::create([
            'competition_id' => $competition->id,
            'participant_id' => $participant->id,
            'title' => 'Approval test',
            'description' => 'Needs approval.',
            'status' => 'pending',
        ]);

        $this->withoutMiddleware()
            ->actingAs($admin)
            ->post('/admin/submissions/' . $submission->id . '/approve')
            ->assertRedirect();

        $this->assertSame('approved', $submission->fresh()->status);
    }

    public function test_admin_can_remove_a_submission(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $competition = $this->createCompetition($admin);
        $participant = User::factory()->create(['role' => 'participant']);
        $submission = Submission::create([
            'competition_id' => $competition->id,
            'participant_id' => $participant->id,
            'title' => 'Removal test',
            'description' => 'Should be removed.',
            'status' => 'pending',
        ]);

        $this->withoutMiddleware()
            ->actingAs($admin)
            ->delete('/admin/submissions/' . $submission->id)
            ->assertRedirect();

        $this->assertDatabaseMissing('submissions', ['id' => $submission->id]);
    }

    public function test_judge_queue_shows_only_approved_submissions(): void
    {
        $judge = User::factory()->create(['role' => 'judge']);
        $competition = $this->createCompetition($judge);
        $participant = User::factory()->create(['role' => 'participant']);

        Submission::create([
            'competition_id' => $competition->id,
            'participant_id' => $participant->id,
            'title' => 'Approved entry',
            'description' => 'Visible to judges.',
            'status' => 'approved',
        ]);

        Submission::create([
            'competition_id' => $competition->id,
            'participant_id' => $participant->id,
            'title' => 'Pending entry',
            'description' => 'Not visible yet.',
            'status' => 'pending',
        ]);

        $this->withoutMiddleware()
            ->actingAs($judge)
            ->get('/judge/submissions/' . $competition->id)
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('submissions', 1)
                ->where('submissions.0.title', 'Approved entry')
            );
    }

    private function createCompetition(User $creator): Competition
    {
        return Competition::create([
            'title' => 'Sample competition',
            'description' => 'Competition for testing.',
            'start_date' => now()->subDay(),
            'submission_deadline' => now()->addDays(5),
            'end_date' => now()->addDays(10),
            'created_by' => $creator->id,
        ]);
    }
}
