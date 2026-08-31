import { useTranslation } from '@/lib/i18n';
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";

type BlogArticleLayoutProps = {
    title: string;
    description?: string;
    children: React.ReactNode;
};

export default function BlogArticleLayout({
    title,
    description,
    children,
}: BlogArticleLayoutProps) {
  const { t } = useTranslation();

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <div className="mx-auto max-w-4xl px-6 pt-8">
                <button
                    onClick={() => router.visit(route('blog.index'))}
                    className="text-sm text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline"
                >
                    {t('blog.blogArticleLayout.backToBlog')}</button>
            </div>

            <article className="mx-auto max-w-3xl px-6 py-12">
                <header className="border-b border-slate-200 pb-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
                        {t('blog.blogArticleLayout.blogArticle')}</p>

                    <h1 className="mt-4 font-serif text-4xl leading-tight text-slate-950 sm:text-5xl">
                        {title}
                    </h1>

                    {description && (
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                            {description}
                        </p>
                    )}
                </header>

                <div className="mt-10">{children}</div>
            </article>
        </main>
    );
}