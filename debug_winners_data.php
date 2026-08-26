<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$competitions = DB::table('competitions')->select('id','title','visibility','status','winner_announced_at','end_date')->get();
$winners = DB::table('competition_winners')->select('id','competition_id','submission_id','rank','notes')->get();
$submissions = DB::table('submissions')->select('id','competition_id','participant_id')->get();
$users = DB::table('users')->select('id','name','role')->get();

echo "Competitions:\n";
foreach ($competitions as $c) {
    echo "- {$c->id}: {$c->title} | visibility={$c->visibility} | status={$c->status} | winner_announced_at={$c->winner_announced_at} | end_date={$c->end_date}\n";
}

echo "\nWinners:\n";
foreach ($winners as $w) {
    echo "- winner id={$w->id}, competition_id={$w->competition_id}, submission_id={$w->submission_id}, rank={$w->rank}, notes={$w->notes}\n";
}

echo "\nSubmissions:\n";
foreach ($submissions as $s) {
    echo "- submission id={$s->id}, competition_id={$s->competition_id}, participant_id={$s->participant_id}\n";
}

echo "\nUsers:\n";
foreach ($users as $u) {
    echo "- user id={$u->id}, name={$u->name}, role={$u->role}\n";
}
