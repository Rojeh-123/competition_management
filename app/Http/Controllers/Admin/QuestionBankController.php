<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Models\Question;
use App\Models\QuestionBank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class QuestionBankController extends Controller
{
    /**
     * Display the admin question bank.
     */
    public function edit(Competition $competition)
    {
        abort_unless(Auth::user()->role === 'admin', 403);

        abort_unless($competition->has_question_bank, 404);

        $questionBank = QuestionBank::firstOrCreate(
            [
                'competition_id' => $competition->id,
            ],
            [
                'number_of_questions' => 10,
                'duration_minutes' => 30,
            ]
        );

        $questionBank->load('questions');

        return Inertia::render('admin/QuestionBank', [
            'competition' => $competition,
            'questionBank' => $questionBank,
        ]);
    }

    /**
     * Create/update the entire question bank.
     */
    public function sync(
        Request $request,
        Competition $competition
    ) {
        abort_unless(Auth::user()->role === 'admin', 403);

        abort_unless($competition->has_question_bank, 404);

        $validated = $request->validate([
            'number_of_questions' => [
                'required',
                'integer',
                'min:1',
            ],

            'duration_minutes' => [
                'required',
                'integer',
                'min:1',
            ],

            'questions' => [
                'required',
                'array',
            ],

            'questions.*.id' => [
                'nullable',
                'integer',
            ],

            'questions.*.question_text' => [
                'required',
                'string',
                'max:10000',
            ],

            'questions.*.choices' => [
                'required',
                'array',
            ],

            'questions.*.choices.A' => [
                'required',
                'string',
                'max:1000',
            ],

            'questions.*.choices.B' => [
                'required',
                'string',
                'max:1000',
            ],

            'questions.*.choices.C' => [
                'required',
                'string',
                'max:1000',
            ],

            'questions.*.choices.D' => [
                'required',
                'string',
                'max:1000',
            ],

            'questions.*.correct_answer' => [
                'required',
                'in:A,B,C,D',
            ],

            'questions.*.points' => [
                'required',
                'numeric',
                'min:0',
            ],

            'questions.*.sort_order' => [
                'required',
                'integer',
                'min:0',
            ],
        ]);

        if (
            $validated['number_of_questions']
            > count($validated['questions'])
        ) {
            return back()->withErrors([
                'number_of_questions' =>
                'The number of exam questions cannot exceed the number of questions in the bank.',
            ]);
        }

        DB::transaction(function () use (
            $validated,
            $competition
        ) {
            $questionBank = QuestionBank::updateOrCreate(
                [
                    'competition_id' => $competition->id,
                ],
                [
                    'number_of_questions' =>
                    $validated['number_of_questions'],

                    'duration_minutes' =>
                    $validated['duration_minutes'],
                ]
            );

            $existingIds = [];

            foreach ($validated['questions'] as $index => $questionData) {
                $question = Question::updateOrCreate(
                    [
                        'id' => $questionData['id'] ?? null,
                        'question_bank_id' => $questionBank->id,
                    ],
                    [
                        'question_text' =>
                        $questionData['question_text'],

                        'choices' =>
                        $questionData['choices'],

                        'correct_answer' =>
                        $questionData['correct_answer'],

                        'points' =>
                        $questionData['points'],

                        'sort_order' =>
                        $index,
                    ]
                );

                $existingIds[] = $question->id;
            }

            /*
             * Delete questions removed from the frontend.
             */
            Question::where(
                'question_bank_id',
                $questionBank->id
            )
                ->whereNotIn('id', $existingIds)
                ->delete();
        });

        return redirect()->route('competitions.show', ['id' => $competition->id])->with(
            'success',
            'Question bank saved successfully.'
        );
    }
}
