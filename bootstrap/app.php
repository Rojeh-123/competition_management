<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\StatusMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpFoundation\File\Exception\FileNotFoundException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
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

            $isDownloadNotFound = $e instanceof FileNotFoundException
                || $e->getMessage() === 'errors.download_not_found';

            $isNotFound = $e instanceof ModelNotFoundException
                || $isDownloadNotFound
                || $e instanceof NotFoundHttpException
                || ($e instanceof HttpExceptionInterface && $e->getStatusCode() === 404);

            if ($isNotFound) {
                $message = match (true) {
                    $isDownloadNotFound => 'error.downloadNotFound',
                    $e instanceof NotFoundHttpException && $e->getMessage() === 'errors.page_not_found' => 'error.pageNotFound',
                    $e instanceof NotFoundHttpException && $e->getMessage() === 'errors.feature_not_found' => 'error.featureNotFound',
                    default => 'error.resourceNotFound',
                };

                if ($request->expectsJson()) {
                    return response()->json(['message' => $message], 404);
                }

                return Inertia::render('Errors/404NotFoundPage', [
                    'message' => $message,
                ])->toResponse($request)->setStatusCode(404);
            }

            if (
                $e instanceof AuthorizationException ||
                ($e instanceof HttpExceptionInterface && $e->getStatusCode() === 403)
            ) {
                $message = str_starts_with($e->getMessage(), 'error.')
                    ? $e->getMessage()
                    : 'error.403Desc';

                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => $message,
                    ], 403);
                }

                return Inertia::render('Errors/403UnAuthorized', [
                    'message' => $message,
                ])->toResponse($request)->setStatusCode(403);
            }

            return null;
        });
    })
    ->create();

Route::fallback(function () {
    abort(403, 'errors.page_not_found');
});
