<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$competitions = DB::table('competitions as c')
    ->leftJoin('submissions as s', 's.competition_id', '=', 'c.id')
    ->select('c.id as competition_id', 'c.title', 'c.visibility', 'c.status', 'c.winner_announced_at', DB::raw('COUNT(s.id) as submission_count'))
    ->groupBy('c.id', 'c.title', 'c.visibility', 'c.status', 'c.winner_announced_at')
    ->orderBy('c.id')
    ->get();

foreach ($competitions as $competition) {
    echo "Competition {$competition->competition_id}: {$competition->title} | visibility={$competition->visibility} | status={$competition->status} | submissions={$competition->submission_count}\n";
}

echo "\n";

$submissions = DB::table('submissions')
    ->select('id', 'competition_id', 'participant_id', 'title')
    ->orderBy('competition_id')
    ->orderBy('id')
    ->get();

foreach ($submissions as $submission) {
    echo "Submission {$submission->id}: competition={$submission->competition_id} participant={$submission->participant_id} title={$submission->title}\n";
}

echo "\nInserting winners...\n";

$targetCompetitionId = null;
foreach ($competitions as $competition) {
    if ((int) $competition->submission_count >= 6) {
        $targetCompetitionId = (int) $competition->competition_id;
        break;
    }
}

if ($targetCompetitionId === null) {
    foreach ($competitions as $competition) {
        if ((int) $competition->submission_count >= 1) {
            $targetCompetitionId = (int) $competition->competition_id;
            break;
        }
    }
}

if ($targetCompetitionId === null) {
    echo "No competitions with submissions found.\n";
    exit(1);
}

$competitionSubmissions = DB::table('submissions')
    ->where('competition_id', $targetCompetitionId)
    ->select('id', 'participant_id')
    ->orderBy('id')
    ->get();

if ($competitionSubmissions->count() === 0) {
    echo "No submissions for target competition {$targetCompetitionId}.\n";
    exit(1);
}

$rows = [];
$notes = [
    'First place winner',
    'Second place winner',
    'Third place winner',
    'Fourth place winner',
    'Fifth place winner',
    'Sixth place winner',
];
$rankValues = [1, 2, 3, 4, 5, 6];

$selectedSubmissions = $competitionSubmissions->take(min(6, $competitionSubmissions->count()));
foreach ($selectedSubmissions as $index => $submission) {
    $rows[] = [
        'competition_id' => $targetCompetitionId,
        'submission_id' => $submission->id,
        'rank' => $rankValues[$index],
        'notes' => $notes[$index],
        'created_at' => now(),
        'updated_at' => now(),
    ];
}

DB::table('competition_winners')->insert($rows);

echo "Inserted " . count($rows) . " winners for competition {$targetCompetitionId}.\n";
