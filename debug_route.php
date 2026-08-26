<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = Illuminate\Http\Request::create('/admin/submissions/1/approve', 'POST');
$router = app('router');
$route = $router->getRoutes()->match($request);
$methods = $route->methods();
echo 'matched: ' . implode(', ', $methods) . ' ' . $route->uri() . PHP_EOL;

try {
    $response = $router->dispatch($request);
    echo 'dispatch status=' . $response->getStatusCode() . PHP_EOL;
} catch (Throwable $e) {
    echo get_class($e) . ': ' . $e->getMessage() . PHP_EOL;
}
