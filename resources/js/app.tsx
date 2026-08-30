import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster, toast } from 'sonner';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

type FlashProps = {
    success?: string;
    error?: string;
};

router.on('success', (event) => {
    const flash = (event.detail.page.props as { flash?: FlashProps }).flash;

    if (flash?.success) {
        toast.success(flash.success);
    }

    if (flash?.error) {
        toast.error(flash.error);
    }
});

import { LanguageProvider } from './lib/i18n';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <LanguageProvider>
                <App {...props} />
                <Toaster
                    richColors
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            '--success-bg': 'var(--primary)',
                            '--success-text': 'var(--primary-foreground)',
                            '--success-border': 'var(--primary)',
                            '--error-bg': 'var(--destructive)',
                            '--error-text': 'var(--destructive-foreground)',
                            '--error-border': 'var(--destructive)',
                        } as React.CSSProperties,
                    }}
                />
            </LanguageProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});