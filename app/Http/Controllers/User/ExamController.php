<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Models\ExamAttempt;
use App\Models\ExamAttemptQuestion;
use App\Models\QuestionBank;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ExamController extends Controller
{
    /**
     * Show question-bank information.
     */
    public function questionBank(Competition $competition)
    {
        abort_unless(Auth::user()->role === 'participant', 403);
        abort_unless($competition->has_question_bank, 404);

        $questionBank = $competition
            ->questionBank()
            ->withCount('questions')
            ->firstOrFail();

        $attempt = ExamAttempt::where('competition_id', $competition->id)
            ->where('participant_id', Auth::id())
            ->first();

        return Inertia::render('participant/QuestionBank', [
            'competition' => $competition,

            'questionBank' => [
                'id' => $questionBank->id,
                'number_of_questions' => $questionBank->number_of_questions,
                'duration_minutes' => $questionBank->duration_minutes,
                'questions_count' => $questionBank->questions_count,
            ],

            'attempt' => $attempt ? [
                'id' => $attempt->id,
                'status' => $attempt->status,
                'score' => $attempt->score,
                'max_score' => $attempt->max_score,
            ] : null,
        ]);
    }

    /**
     * Load the exam page.
     *
     * This is the single source of truth for "starting" an exam:
     * if the participant doesn't have an attempt yet, one is created
     * here (with a freshly randomized question set) before the page
     * is rendered. This means either "Start Exam" button in the UI
     * can safely land here directly.
     */
    public function showExam(Competition $competition)
    {
        abort_unless(Auth::user()->role === 'participant', 403);
        abort_unless($competition->has_question_bank, 404);

        $questionBank = $competition->questionBank()->firstOrFail();

        $attempt = $this->getOrCreateAttempt($competition, $questionBank);

        /*
         * Already finished — can't re-enter.
         */
        if ($attempt->status !== 'in_progress') {
            return redirect()
                ->route('participant.competitions.question-bank', $competition)
                ->with('error', 'This exam has already been completed.');
        }

        /*
         * Server-side expiry check.
         */
        $expiresAt = $attempt->started_at->copy()->addMinutes($questionBank->duration_minutes);

        if (now()->greaterThanOrEqualTo($expiresAt)) {
            $attempt->finalize('expired');

            return redirect()
                ->route('participant.competitions.question-bank', $competition)
                ->with('error', 'Your exam time has expired.');
        }

        $attempt->load([
            'attemptQuestions' => function ($query) {
                $query
                    ->orderBy('question_order')
                    ->with(['question:id,question_bank_id,question_text,choices,points']);
            },
        ]);

        return Inertia::render('participant/Exam', [
            'competition' => [
                'id' => $competition->id,
                'title' => $competition->title,
            ],

            'questionBank' => [
                'id' => $questionBank->id,
                'number_of_questions' => $questionBank->number_of_questions,
                'duration_minutes' => $questionBank->duration_minutes,
            ],

            'attempt' => [
                'id' => $attempt->id,
                'started_at' => $attempt->started_at->toIso8601String(),
                'expires_at' => $expiresAt->toIso8601String(),
                'status' => $attempt->status,
            ],

            'questions' => $attempt->attemptQuestions
                ->map(fn($attemptQuestion) => [
                    'id' => $attemptQuestion->question->id,
                    'attempt_question_id' => $attemptQuestion->id,
                    'question_text' => $attemptQuestion->question->question_text,
                    'choices' => $attemptQuestion->question->choices,
                    'points' => $attemptQuestion->question->points,
                    'selected_answer' => $attemptQuestion->selected_answer,
                ])
                ->values(),
        ]);
    }

    /**
     * Save answers without submitting the exam.
     */
    public function saveAnswers(Request $request, Competition $competition)
    {
        abort_unless(Auth::user()->role === 'participant', 403);

        $validated = $request->validate([
            'answers' => ['required', 'array'],
            'answers.*' => ['nullable', 'in:A,B,C,D'],
        ]);

        $attempt = ExamAttempt::where('id', $request->input('attempt_id'))
            ->where('competition_id', $competition->id)
            ->where('participant_id', Auth::id())
            ->firstOrFail();

        if ($attempt->status !== 'in_progress') {
            return response()->json([
                'message' => 'This exam attempt is no longer active.',
            ], 422);
        }

        $questionBank = $competition->questionBank()->firstOrFail();

        $expiresAt = $attempt->started_at->copy()->addMinutes($questionBank->duration_minutes);

        if (now()->greaterThanOrEqualTo($expiresAt)) {
            $attempt->finalize('expired');

            return response()->json([
                'message' => 'Exam time has expired.',
                'expired' => true,
            ], 422);
        }

        foreach ($validated['answers'] as $attemptQuestionId => $answer) {
            ExamAttemptQuestion::where('id', $attemptQuestionId)
                ->where('exam_attempt_id', $attempt->id)
                ->update(['selected_answer' => $answer]);
        }

        return response()->json(['message' => 'Answers saved successfully.']);
    }

    /**
     * Submit the exam manually or automatically.
     */
    public function submit(Request $request, Competition $competition)
    {
        abort_unless(Auth::user()->role === 'participant', 403);

        $attempt = ExamAttempt::where('id', $request->input('attempt_id'))
            ->where('competition_id', $competition->id)
            ->where('participant_id', Auth::id())
            ->firstOrFail();

        if ($attempt->status !== 'in_progress') {
            return redirect()
                ->route('participant.competitions.question-bank', $competition->id)
                ->with('error', 'This exam has already been submitted.');
        }

        if ($request->has('answers')) {
            $validated = $request->validate([
                'answers' => ['array'],
                'answers.*' => ['nullable', 'in:A,B,C,D'],
            ]);

            foreach ($validated['answers'] ?? [] as $attemptQuestionId => $answer) {
                ExamAttemptQuestion::where('id', $attemptQuestionId)
                    ->where('exam_attempt_id', $attempt->id)
                    ->update(['selected_answer' => $answer]);
            }
        }

        $questionBank = $competition->questionBank()->firstOrFail();

        $expiresAt = $attempt->started_at->copy()->addMinutes($questionBank->duration_minutes);

        $status = now()->greaterThanOrEqualTo($expiresAt) ? 'expired' : 'submitted';

        $attempt->finalize($status);

        return redirect()
            ->route('participant.competitions.question-bank', $competition->id)
            ->with(
                'success',
                $status === 'expired'
                    ? 'Your exam time expired and your answers were saved.'
                    : 'Your exam was submitted successfully.'
            );
    }

    /**
     * Fetch the participant's attempt for this competition, creating
     * it — with a freshly randomized question set — if it doesn't
     * exist yet. Safe to call from multiple entry points.
     */
    private function getOrCreateAttempt(
        Competition $competition,
        QuestionBank $questionBank
    ): ExamAttempt {

        $existing = ExamAttempt::where('competition_id', $competition->id)
            ->where('participant_id', Auth::id())
            ->first();

        if ($existing) {
            return $existing;
        }

        try {
            return DB::transaction(function () use ($competition, $questionBank) {

                $attempt = ExamAttempt::create([
                    'competition_id' => $competition->id,
                    'participant_id' => Auth::id(),
                    'started_at' => now(),
                    'status' => 'in_progress',
                ]);

                /*
                 * Randomize here, once, at creation time.
                 */
                $questions = $questionBank
                    ->questions()
                    ->reorder()
                    ->inRandomOrder()
                    ->limit($questionBank->number_of_questions)
                    ->get();

                if ($questions->count() < $questionBank->number_of_questions) {
                    abort(422, 'There are not enough questions in the question bank.');
                }

                foreach ($questions as $index => $question) {
                    ExamAttemptQuestion::create([
                        'exam_attempt_id' => $attempt->id,
                        'question_id' => $question->id,
                        'question_order' => $index + 1,
                    ]);
                }

                return $attempt;
            });
        } catch (QueryException $e) {
            /*
             * Two concurrent requests (e.g. a double-click) both
             * found no existing attempt and both tried to create
             * one. Requires a unique index on
             * (competition_id, participant_id) in the exam_attempts
             * table for this to be caught — add one if it's missing.
             * Whichever lost the race just reads the winner's row.
             */
            return ExamAttempt::where('competition_id', $competition->id)
                ->where('participant_id', Auth::id())
                ->firstOrFail();
        }
    }
}
