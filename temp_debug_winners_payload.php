<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\CompetitionController;
use Illuminate\Http\Request;

$request = Request::create('/winners', 'GET');
$app->instance('request', $request);

$controller = new CompetitionController();
$response = $controller->winners();
$data = $response->toResponse($request)->getData(true);

$competitions = $data['props']['competitions'] ?? [];
file_put_contents(__DIR__ . '/debug_winners_payload.json', json_encode($competitions, JSON_PRETTY_PRINT));

echo "wrote " . count($competitions) . " competition(s) to debug_winners_payload.json\n";
