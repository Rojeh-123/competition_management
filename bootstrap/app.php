<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\StatusMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Auth\Access\AuthorizationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )

    ->withMiddleware(function (Middleware $middleware) {

        // Web middleware stack
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'status' => StatusMiddleware::class,
        ]);
    })

    ->withExceptions(function (Exceptions $exceptions) {

        $exceptions->render(function (\Throwable $e, $request) {

            if (
                $e instanceof AuthorizationException ||
                ($e instanceof HttpExceptionInterface && $e->getStatusCode() === 403)
            ) {

                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => $e->getMessage() ?: 'Forbidden',
                    ], 403);
                }

                return Inertia::render('Errors/403UnAuthorized', [
                    'message' => $e->getMessage(),
                ])->toResponse($request)->setStatusCode(403);
            }

            return null;
        });

    })
    ->create();