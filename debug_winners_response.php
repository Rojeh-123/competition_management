<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = Illuminate\Http\Request::create('/winners', 'GET');
$app->instance('request', $request);

$controller = new App\Http\Controllers\CompetitionController;
$response = $controller->winners();
$data = $response->toResponse($request)->getData(true);

var_dump($data['props']['competitions'] ?? null);
