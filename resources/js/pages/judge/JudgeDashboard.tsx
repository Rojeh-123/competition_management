import { useTranslation } from '@/lib/i18n';
import { Head, router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";

import {
    Trophy,
    Clock,
    CheckCircle,
    FileText,
    AlertTriangle,
} from "lucide-react";

import {
    Navbar,
    Footer,
    PageHeader,
    StatsCard,
    DashboardSidebar,
} from "@/components/layout";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Stats {
    assignedCompetitions: number;
    pendingReviews: number;
    draftEvaluations: number;
    completedEvaluations: number;
    completionPercentage: number;
}

interface PageProps {
    stats: Stats;
    [key: string]: any;
}

function JudgeDashboard() {
  const { t } = useTranslation();

    const { stats } = usePage<PageProps>().props;

    return (
        <div className="flex min-h-screen flex-col">
            <Head title={t('judge.judgeDashboard.evaluationControlCenterReviewProgress')} />
            <Navbar />

            <div className="flex flex-col lg:flex-row flex-1 min-w-0">
                <DashboardSidebar />

                <main className="flex-1 overflow-auto min-w-0">
                    <div className="p-4 sm:p-6 lg:p-8 min-w-0">

                        <PageHeader
                            title={t('judge.judgeDashboard.evaluationControlCenter')}
                            description={t('judge.judgeDashboard.manageAndMonitorYourAssigned')}
                        />

                        {/* Statistics */}

                        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                            <StatsCard
                                label={t('sidebar.assignedCompetitions')}
                                value={stats.assignedCompetitions}
                                icon={Trophy}
                            />

                            <StatsCard
                                label={t('judge.judgeDashboard.pendingReviews')}
                                value={stats.pendingReviews}
                                icon={Clock}
                            />

                            <StatsCard
                                label={t('judge.judgeDashboard.draftEvaluations')}
                                value={stats.draftEvaluations}
                                icon={FileText}
                            />

                            <StatsCard
                                label={t('judge.judgeDashboard.completedReviews')}
                                value={stats.completedEvaluations}
                                icon={CheckCircle}
                            />
                        </div>

                        {/* Progress */}

                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    {t('judge.judgeDashboard.evaluationProgress')}</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {t('judge.judgeDashboard.overallCompletion')}</span>

                                    <span className="font-medium">
                                        {stats.completionPercentage}%
                                    </span>
                                </div>

                                <Progress
                                    value={stats.completionPercentage}
                                    className="h-3"
                                />

                                {stats.pendingReviews > 0 && (
                                    <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/10">

                                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                                        <p className="text-sm text-amber-700 dark:text-amber-300">
                                            {t('judge.judgeDashboard.youHave')}{" "}
                                            <span className="font-semibold">
                                                {stats.pendingReviews}
                                            </span>{" "}
                                            pending review
                                            {stats.pendingReviews > 1
                                                ? "s"
                                                : ""}
                                            {" "}{t('judge.judgeDashboard.waitingForEvaluation')}</p>
                                    </div>
                                )}

                                {stats.draftEvaluations > 0 && (
                                    <div className="mt-3 rounded-lg border bg-muted/50 p-3">

                                        <p className="text-sm text-muted-foreground">
                                            {t('judge.judgeDashboard.youCurrentlyHave')}{" "}
                                            <span className="font-semibold text-foreground">
                                                {stats.draftEvaluations}
                                            </span>{" "}
                                            draft evaluation
                                            {stats.draftEvaluations > 1
                                                ? "s"
                                                : ""}
                                            {" "}{t('judge.judgeDashboard.thatCanBeCompletedAnd')}</p>

                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}

                        <h3 className="mb-4 font-semibold">
                            {t('judge.judgeDashboard.quickActions')}</h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                            <Card
                                className="cursor-pointer transition-shadow hover:shadow-md"
                                onClick={() =>
                                    router.visit(
                                        route("judge.competitions")
                                    )
                                }
                            >
                                <CardContent className="flex items-center gap-4 py-5">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <Trophy className="h-5 w-5 text-primary" />
                                    </div>

                                    <div>
                                        <p className="font-medium">
                                            {t('sidebar.assignedCompetitions')}</p>

                                        <p className="text-sm text-muted-foreground">
                                            {t('judge.judgeDashboard.viewCompetitionsAssignedToYou')}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                className="cursor-pointer transition-shadow hover:shadow-md"
                                onClick={() =>
                                    router.visit(
                                        route("judge.history")
                                    )
                                }
                            >
                                <CardContent className="flex items-center gap-4 py-5">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                                    </div>

                                    <div>
                                        <p className="font-medium">
                                            {t('sidebar.evaluationHistory')}</p>

                                        <p className="text-sm text-muted-foreground">
                                            {t('judge.judgeDashboard.reviewYourCompletedEvaluations')}</p>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
}

export default JudgeDashboard;