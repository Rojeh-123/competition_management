import { CompetitionCard, Footer, Navbar } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowRight, Award, Globe, Shield, Star, Target, Trophy, Users, Zap } from 'lucide-react';
import { route } from "ziggy-js";
import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import { useTranslation } from '@/lib/i18n';

interface PageProps extends InertiaPageProps {
    numberOfJudges: number;
    numberOfParticipants: number;
    competitions: any[];
    numberOfActiveCompetitions: number;
    category: any[];
}

export default function HomePage() {
    const {
        numberOfJudges,
        numberOfParticipants,
        competitions,
        numberOfActiveCompetitions,
        category,
    } = usePage<PageProps>().props;
    const { t } = useTranslation();

    return (
        <>
            <Head title={`${t('nav.home')} – CompeteHub`} />
            <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">
                    <div className="min-h-screen">
                        {/* Hero Section */}
                        <section className="from-primary/5 via-background to-accent/5 relative overflow-hidden bg-gradient-to-br py-20 lg:py-32">
                            <div className="from-primary/10 absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] via-transparent to-transparent" />
                            <div className="relative container mx-auto px-4">
                                <div className="mx-auto max-w-3xl text-center">
                                    <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
                                        <Zap className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                                        {numberOfActiveCompetitions} {t('home.heroBadge')}
                                    </Badge>
                                    <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                                        {t('home.heroTitle1')} <span className="text-primary">{t('home.heroTitle2')}</span>
                                    </h1>
                                    <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg text-balance">
                                        {t('home.heroSubtitle')}
                                    </p>
                                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                        <Button size="lg" className="cursor-pointer px-8 text-base" onClick={() => router.visit(route('competitions.index'))}>
                                            {t('common.exploreChallenges')}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="cursor-pointer px-8 text-base"
                                            onClick={() => router.visit(route('login'))}
                                        >
                                            {t('common.joinNow')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Stats Bar */}
                        <section className="bg-card border-y">
                            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                                <div className="grid grid-cols-1 gap-6 text-center sm:grid-cols-2 md:grid-cols-3">
                                    <div>
                                        <p className="text-2xl font-bold lg:text-3xl">{numberOfParticipants}</p>
                                        <p className="text-muted-foreground flex items-center justify-center gap-1 text-sm">
                                            <Users className="h-3.5 w-3.5" />
                                            {t('home.registeredUsers')}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-2xl font-bold lg:text-3xl">{numberOfActiveCompetitions}</p>
                                        <p className="text-muted-foreground flex items-center justify-center gap-1 text-sm">
                                            <Trophy className="h-3.5 w-3.5" />
                                            {t('home.activeEvents')}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-2xl font-bold lg:text-3xl">{numberOfJudges}</p>
                                        <p className="text-muted-foreground flex items-center justify-center gap-1 text-sm">
                                            <Star className="h-3.5 w-3.5" />
                                            {t('home.expertJudges')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Featured Competitions */}
                        <section className="py-16 lg:py-24">
                            <div className="container mx-auto px-4">
                                <div className="mb-8 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold lg:text-3xl">{t('home.featuredTitle')}</h2>
                                        <p className="text-muted-foreground mt-1">{t('home.featuredSubtitle')}</p>
                                    </div>
                                    <Button variant="ghost" className="hidden cursor-pointer sm:flex" onClick={() => router.visit(route('competitions.index'))}>
                                        {t('common.viewAll')} <ArrowRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {competitions.map((comp) => (
                                        <CompetitionCard key={comp.id} competition={comp} onClick={() => router.visit(route('competitions.show', { id: comp.id }))} />
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* How It Works */}
                        <section className="bg-muted/30 py-16 lg:py-24">
                            <div className="container mx-auto px-4">
                                <div className="mb-12 text-center">
                                    <h2 className="mb-3 text-2xl font-bold lg:text-3xl">{t('home.howItWorksTitle')}</h2>
                                    <p className="text-muted-foreground mx-auto max-w-xl">{t('home.howItWorksSubtitle')}</p>
                                </div>
                                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                                    {[
                                        { icon: Globe, title: t('home.step1Title'), desc: t('home.step1Desc') },
                                        { icon: Target, title: t('home.step2Title'), desc: t('home.step2Desc') },
                                        { icon: Shield, title: t('home.step3Title'), desc: t('home.step3Desc') },
                                        { icon: Award, title: t('home.step4Title'), desc: t('home.step4Desc') },
                                    ].map((step, i) => (
                                        <div key={i} className="text-center">
                                            <div className="bg-primary/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                                                <step.icon className="text-primary h-7 w-7" />
                                            </div>
                                            <h3 className="mb-2 font-semibold">{step.title}</h3>
                                            <p className="text-muted-foreground text-sm">{step.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Categories Preview */}
                        <section className="py-16 lg:py-24">
                            <div className="container mx-auto px-4">
                                <div className="mb-12 text-center">
                                    <h2 className="mb-3 text-2xl font-bold lg:text-3xl">{t('home.categoriesTitle')}</h2>
                                    <p className="text-muted-foreground">{t('home.categoriesSubtitle')}</p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {category.map((cat) => (
                                        <Badge
                                            key={cat.id}
                                            variant="secondary"
                                            className="hover:bg-primary hover:text-primary-foreground cursor-pointer px-4 py-2 text-sm transition-colors"
                                        >
                                            {cat.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* CTA */}
                        <section className="bg-primary text-primary-foreground py-16 lg:py-24">
                            <div className="container mx-auto px-4 text-center">
                                <h2 className="mb-4 text-2xl font-bold lg:text-3xl">{t('home.ctaTitle')}</h2>
                                <p className="text-primary-foreground/80 mx-auto mb-8 max-w-lg">
                                    {t('home.ctaSubtitle')}
                                </p>
                                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        className="cursor-pointer px-8 text-base"
                                        onClick={() => router.visit(route('login'))}
                                    >
                                        {t('common.createFreeAccount')}
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 cursor-pointer px-8 text-base"
                                        onClick={() => router.visit(route('competitions.index'))}
                                    >
                                        {t('common.browseCompetitions')}
                                    </Button>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
}