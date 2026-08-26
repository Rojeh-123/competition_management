import { Head, Link, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
    ArrowLeft,
    Compass,
    Home,
    Search,
    Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";

export default function NotFoundPage() {
    const { t } = useTranslation();

    return (
        <>
            <Head title={`404 – ${t('error.404Title')}`} />

            <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-12">
                <Card className="w-full max-w-3xl overflow-hidden border shadow-lg">
                    <CardContent className="relative px-8 py-16 text-center">
                        {/* Decorative Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
                        <div className="absolute -top-20 -left-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
                        <div className="absolute -right-20 -bottom-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

                        <div className="relative z-10">
                            {/* Icon */}
                            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                                <Compass className="h-12 w-12 text-primary" />
                            </div>

                            {/* 404 */}
                            <h1 className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-8xl font-black text-transparent">
                                404
                            </h1>

                            <h2 className="mt-4 text-3xl font-bold">
                                {t('error.404Title')}
                            </h2>

                            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted-foreground">
                                {t('error.404Desc')}
                            </p>

                            {/* Buttons */}
                            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                                <Button
                                    onClick={() => router.visit(route("home"))}
                                    className="cursor-pointer"
                                >
                                    <Home className="mr-2 h-4 w-4" />
                                    {t('nav.home')}
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                    className="cursor-pointer"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    {t('common.goBack')}
                                </Button>
                            </div>

                            {/* Quick Links */}
                            <div className="mt-12 border-t pt-8">
                                <p className="mb-5 text-sm font-medium text-muted-foreground">
                                    {t('error.lookingFor')}
                                </p>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <Link
                                        href={route("competitions.index")}
                                        className="group rounded-xl border bg-background p-5 transition-all hover:border-primary hover:shadow-md"
                                    >
                                        <Trophy className="mx-auto mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-110" />

                                        <p className="font-semibold">
                                            {t('nav.competitions')}
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {t('error.exploreActive')}
                                        </p>
                                    </Link>

                                    <Link
                                        href={route("gallery")}
                                        className="group rounded-xl border bg-background p-5 transition-all hover:border-primary hover:shadow-md"
                                    >
                                        <Search className="mx-auto mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-110" />

                                        <p className="font-semibold">
                                            {t('nav.gallery')}
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {t('error.discoverSubmissions')}
                                        </p>
                                    </Link>

                                    <Link
                                        href={route("winners")}
                                        className="group rounded-xl border bg-background p-5 transition-all hover:border-primary hover:shadow-md"
                                    >
                                        <Trophy className="mx-auto mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-110" />

                                        <p className="font-semibold">
                                            {t('nav.winners')}
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {t('error.viewChampions')}
                                        </p>
                                    </Link>
                                </div>
                            </div>

                            {/* Footer */}
                            <p className="mt-10 text-sm text-muted-foreground">
                                {t('error.supportHelp')}{" "}
                                <Link
                                    href={route("contact")}
                                    className="font-medium text-primary hover:underline"
                                >
                                    {t('nav.contact')}
                                </Link>
                                .
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}