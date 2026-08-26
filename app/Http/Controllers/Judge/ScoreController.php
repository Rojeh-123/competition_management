<?php

namespace App\Http\Controllers\Judge;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\Score;
use Illuminate\Http\Request;
use App\Helpers\AuditLogger;
use Illuminate\Support\Facades\Auth;

class ScoreController extends Controller
{
    public function saveDraft(Request $request)
    {
        $request->validate([
            'submission_id' => ['required', 'exists:submissions,id'],
            'comment' => ['nullable', 'string'],
            'max_total' => ['required'],
            'total_score' => ['required'],
            'scores' => ['required', 'array'],
            'scores.*.criterion_id' => [
                'required',
                'exists:competition_score_criteria,id'
            ],
            'scores.*.score' => [
                'required',
                'numeric',
                'min:0'
            ],
        ]);

        $alreadyLocked = Score::where(
            'submission_id',
            $request->submission_id
        )
            ->where('judge_id', Auth::id())
            ->where('status', 'Locked')
            ->exists();

        if ($alreadyLocked) {
            return back()->with('error', 'This evaluation has already been submitted.');
        }

        foreach ($request->scores as $index => $score) {

            Score::updateOrCreate(
                [
                    'submission_id' => $request->submission_id,
                    'judge_id' => Auth::id(),
                    'criterion_id' => $score['criterion_id'],
                ],
                [
                    'score' => $score['score'],
                    'comment' => $index === count($request->scores) - 1
                        ? $request->comment
                        : null,
                    'status' => 'In Draft',
                ]
            );
        }

        $submission = Submission::find($request->submission_id);

        AuditLogger::log(
            action: 'CREATE',
            table: 'scores',
            recordId: $request->submission_id,
            details: "Judge '" . Auth::user()->full_name .
                "' saved an evaluation draft for submission '{$submission->title}' " .
                "(Submission ID: {$submission->id}) with a total score of {$request->total_score}/{$request->max_total}.",
            request: $request
        );

        return back()->with('success', 'Draft saved successfully.');
    }

    public function submit(Request $request)
    {
        $request->validate([
            'submission_id' => ['required', 'exists:submissions,id'],
            'comment' => ['nullable', 'string'],
            'max_total' => ['required'],
            'total_score' => ['required'],
            'scores' => ['required', 'array'],
            'scores.*.criterion_id' => ['required', 'exists:competition_score_criteria,id'],
            'scores.*.score' => ['required', 'numeric', 'min:0'],
        ]);

        $alreadyLocked = Score::where(
            'submission_id',
            $request->submission_id
        )
            ->where('judge_id', Auth::id())
            ->where('status', 'Locked')
            ->exists();

        if ($alreadyLocked) {
            return back()->with('error', 'This evaluation has already been submitted.');
        }

        foreach ($request->scores as $index => $score) {
            Score::updateOrCreate(
                [
                    'submission_id' => $request->submission_id,
                    'judge_id'      => Auth::id(),
                    'criterion_id' => $score['criterion_id'],
                ],
                [
                    'score' => $score['score'],
                    'comment' => $index == count($request->scores) - 1
                        ? $request->comment
                        : null,
                    'status' => 'Locked',
                ]
            );
        }

        $submission = Submission::find($request->submission_id);

        AuditLogger::log(
            action: 'SUBMIT',
            table: 'scores',
            recordId: $request->submission_id,
            details: "Judge '" . Auth::user()->full_name .
                "' submitted the final evaluation for submission '{$submission->title}' " .
                "(Submission ID: {$submission->id}) with a total score of {$request->total_score}/{$request->max_total}.",
            request: $request
        );

        return redirect()
            ->route('judge.competitions')
            ->with('success', 'Evaluation submitted successfully.');
    }
}
