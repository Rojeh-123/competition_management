<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

$request = Illuminate\Http\Request::create('/admin/submissions/1/approve', 'POST');
$app->instance('request', $request);
Illuminate\Support\Facades\Context::addHidden('request', $request);

$response = $kernel->handle($request);
echo 'status=' . $response->getStatusCode() . PHP_EOL;
echo $response->getContent() . PHP_EOL;
$kernel->terminate($request, $response);
