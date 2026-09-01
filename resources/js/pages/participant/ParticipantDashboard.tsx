import { useTranslation } from '@/lib/i18n';
import { Head, router, usePage } from "@inertiajs/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, FileText, Award } from "lucide-react";
import {
    StatsCard,
    CountdownTimer,
    PageHeader,
    DashboardSidebar,
    Navbar,
    Footer,
} from "@/components/layout";
import { route } from "ziggy-js";

interface Stats {
    activeCompetitions: number;
    submittedEntries: number;
    awardsWon: number;
    pendingSubmissions: number;
}

interface Competition {
    id: number;
    title: string;
    category: string | null;
    status: string;
    submissionDeadline: string;
    image?: string | null;
    hasSubmitted: boolean;
}

interface Deadline {
    id: number;
    title: string;
    deadline: string;
}

interface RecentSubmission {
    id: number;
    competition: string;
    submittedAt: string;
}

interface User {
    id: number;
    name: string;
    full_name?: string;
    email: string;
    role: string;
}

interface PageProps {
    user: User;
    stats: Stats;
    activeCompetitions: Competition[];
    upcomingDeadlines: Deadline[];
    recentSubmissions: RecentSubmission[];
    [key: string]: any;
}

function ParticipantDashboard() {
    const { t } = useTranslation();

    const {
        user,
        stats,
        activeCompetitions,
        upcomingDeadlines,
        recentSubmissions,
    } = usePage<PageProps>().props;

    return (
        <div className="min-h-screen flex flex-col">
            <Head title={t('participant.participantDashboard.participantDashboardActivityOverview')} />
            <Navbar />

            <div className="flex flex-col lg:flex-row flex-1 min-w-0">
                <DashboardSidebar />

                <main className="flex-1 overflow-auto min-w-0">
                    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
                        <PageHeader
                            title={`Welcome back, ${user.full_name ?? user.name
                                }`}
                            description={t('participant.participantDashboard.heresYourCompetitionActivityOverview')}
                        />

                        {/* Statistics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatsCard
                                label={t('home.heroBadge')}
                                value={stats.activeCompetitions}
                                icon={Trophy}
                            />

                            <StatsCard
                                label={t('participant.participantDashboard.submittedEntries')}
                                value={stats.submittedEntries}
                                icon={FileText}
                            />

                            <StatsCard
                                label={t('participant.participantDashboard.awardsWon')}
                                value={stats.awardsWon}
                                icon={Award}
                            />

                            <StatsCard
                                label={t('participant.participantDashboard.pendingSubmissions')}
                                value={stats.pendingSubmissions}
                                icon={FileText}
                            />
                        </div>

                        {/* Upcoming Deadlines */}
                        <h3 className="font-semibold text-lg mb-4">
                            {t('participant.participantDashboard.upcomingDeadlines')}</h3>

                        <Card className="mb-8">
                            <CardContent className="py-4">
                                {upcomingDeadlines.length > 0 ? (
                                    <div className="space-y-4">
                                        {upcomingDeadlines.map((deadline) => (
                                            <div
                                                key={deadline.id}
                                                className="flex items-center justify-between"
                                            >
                                                <p className="font-medium">
                                                    {deadline.title}
                                                </p>

                                                <CountdownTimer
                                                    deadline={
                                                        deadline.deadline
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">
                                        {t('participant.participantDashboard.noUpcomingDeadlines')}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Submissions */}
                        <h3 className="font-semibold text-lg mb-4">
                            {t('participant.participantDashboard.recentSubmissions')}</h3>

                        <Card className="mb-8">
                            <CardContent className="py-4">
                                {recentSubmissions.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentSubmissions.map(
                                            (submission) => (
                                                <div
                                                    key={submission.id}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div>
                                                        <p className="font-medium">
                                                            {
                                                                submission.competition
                                                            }
                                                        </p>

                                                        <p className="text-sm text-muted-foreground">
                                                            {t('participant.participantDashboard.submittedSuccessfully')}</p>
                                                    </div>

                                                    <Badge>
                                                        {t('participant.participantDashboard.submitted')}</Badge>
                                                </div>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">
                                        {t('participant.participantDashboard.noSubmissionsYet')}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Active Competitions */}
                        <h3 className="font-semibold text-lg mb-4">
                            {t('home.heroBadge')}</h3>

                        {activeCompetitions.length > 0 ? (
                            <div className="space-y-3">
                                {activeCompetitions.map((comp) => (
                                    <Card
                                        key={comp.id}
                                        className="cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() =>
                                            router.visit(
                                                route("competitions.show", {
                                                    id: comp.id,
                                                })
                                            )
                                        }
                                    >
                                        <CardContent className="py-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
                                                    {comp.image ? (
                                                        <img
                                                            src={`/competition_management/public/storage/${comp.image}`}
                                                            alt={comp.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <Trophy className="h-5 w-5 text-primary" />
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="font-medium">
                                                        {comp.title}
                                                    </p>

                                                    <p className="text-sm text-muted-foreground">
                                                        {comp.category ??
                                                            t('participant.participantDashboard.uncategorized')}
                                                    </p>

                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {t('participant.participantDashboard.status')}{comp.status}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <Badge
                                                    variant={
                                                        comp.hasSubmitted
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                >
                                                    {comp.hasSubmitted
                                                        ? t('participant.participantDashboard.submitted')
                                                        : t('participant.participantDashboard.submissionRequired')}
                                                </Badge>

                                                <CountdownTimer
                                                    deadline={
                                                        comp.submissionDeadline
                                                    }
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    {t('participant.participantDashboard.youAreNotCurrentlyParticipating')}</CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
}

export default ParticipantDashboard;