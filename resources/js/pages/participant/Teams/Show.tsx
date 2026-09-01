import { useTranslation } from '@/lib/i18n';
import { route } from "ziggy-js";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Mail, MapPin, Cake, Send, Info } from 'lucide-react';
import { PageHeader, Navbar, Footer, DashboardSidebar } from '@/components/layout';
import { Head, Link, usePage } from '@inertiajs/react';

interface Competition {
    id: number;
    title: string;
    status: string;
    description: string | null;
    start_date: string;
    submission_deadline: string;
    end_date: string;
    prize_description: string | null;
    number_of_winners: number;
    category?: {
        id: number;
        name: string;
    } | null;
}

interface Member {
    id: number;
    username: string;
    full_name: string;
    email: string;
    image: string | null;
    age: number | null;
    country: string | null;
    bio: string | null;
}

interface Team {
    id: number;
    name: string;
    competition: Competition | null;
    members: Member[];
}

interface ShowProps {
    team: Team;
    hasSubmitted: boolean;
}

interface PageProps {
    user: {
        id: number;
    };
    [key: string]: unknown;
}

function TeamShowPage({ team, hasSubmitted }: ShowProps) {
    const { t } = useTranslation();

    const { user } = usePage<PageProps>().props;
    const statusColors: Record<string, string> = {
        upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        open: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        submission_closed: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        judging: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        results_published: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        archived: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
    };

    // Map status to translated label
    const statusMap: Record<string, string> = {
        upcoming: t('status.upcoming'),
        open: t('status.open'),
        submission_closed: t('status.submission_closed'),
        judging: t('status.judging'),
        results_published: t('status.results_published'),
        archived: t('status.archived'),
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Head title={`Team – ${team.name}`} />
            <Navbar />
            <div className="flex flex-1">
                <DashboardSidebar />
                <main className="flex-1 overflow-auto">
                    <div className="p-6 space-y-6">
                        <PageHeader title={team.name} description={t('participant.teams.show.yourTeamRosterAndCompetition')} />
                        <Card>
                            <CardContent className="p-6">
                                {team.competition ? (
                                    <div className="space-y-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                    <Trophy className="h-4 w-4 text-amber-500" />
                                                    {t('participant.teams.show.competingIn')}</div>

                                                <h2 className="mt-1 text-xl font-semibold">
                                                    {team.competition.title}
                                                </h2>
                                            </div>


                                            <Badge className={`text-xs border-0 ${statusColors[team.competition.status] || ''}`}>
                                                {statusMap[team.competition.status] || team.competition.status}
                                            </Badge>
                                        </div>

                                        {/* Description */}
                                        {team.competition.description && (
                                            <p className="text-sm leading-6 text-muted-foreground">
                                                {team.competition.description}
                                            </p>
                                        )}

                                        {/* Important dates */}
                                        <div className="grid grid-cols-1 gap-4 border-y py-5 sm:grid-cols-3">
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    {t('participant.teams.show.starts')}</p>
                                                <p className="mt-1 text-sm font-semibold">
                                                    {new Date(
                                                        team.competition.start_date
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    {t('participant.teams.show.submissionDeadline')}</p>
                                                <p className="mt-1 text-sm font-semibold">
                                                    {new Date(
                                                        team.competition.submission_deadline
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    {t('participant.teams.show.ends')}</p>
                                                <p className="mt-1 text-sm font-semibold">
                                                    {new Date(
                                                        team.competition.end_date
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Competition details */}
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                            {team.competition.category?.name && (
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        {t('common.category')}</p>
                                                    <p className="mt-1 text-sm font-semibold">
                                                        {team.competition.category.name}
                                                    </p>
                                                </div>
                                            )}

                                            {team.competition.prize_description && (
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        {t('participant.teams.show.prize')}</p>
                                                    <p className="mt-1 text-sm font-semibold">
                                                        {team.competition.prize_description}
                                                    </p>
                                                </div>
                                            )}

                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    {t('nav.winners')}</p>
                                                <p className="mt-1 text-sm font-semibold">
                                                    {team.competition.number_of_winners}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Trophy className="h-4 w-4" />
                                        {t('participant.teams.show.notAssignedToACompetition')}</div>
                                )}
                            </CardContent>
                        </Card>

                        <div>
                            <h2 className="text-sm font-medium text-muted-foreground mb-3">
                                {t('participant.teams.show.teamMembers')}{team.members.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {team.members.map((member) => (
                                    <Card key={member.id}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-4">
                                                <Avatar className="h-14 w-14">
                                                    {member.image && (
                                                        <AvatarImage
                                                            src={`/competition_management/public/storage/${member.image}`}
                                                            alt={member.username}
                                                        />
                                                    )}
                                                    <AvatarFallback>
                                                        {member.username.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold truncate">{member.full_name}</p>
                                                        {member.id === user.id && (
                                                            <Badge variant="default">{t('participant.teams.show.you')}</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">@{member.username}</p>

                                                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1.5">
                                                            <Mail className="h-3.5 w-3.5 shrink-0" />
                                                            <span className="truncate">{member.email}</span>
                                                        </div>
                                                        {member.age !== null && (
                                                            <div className="flex items-center gap-1.5">
                                                                <Cake className="h-3.5 w-3.5 shrink-0" />
                                                                {member.age} {t('participant.teams.show.yearsOld')}
                                                            </div>
                                                        )}
                                                        {member.country && (
                                                            <div className="flex items-center gap-1.5">
                                                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                                {member.country}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {member.bio && (
                                                        <p className="mt-3 text-sm text-muted-foreground border-t pt-2">
                                                            {member.bio}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <Card>
                            <CardContent className="pt-6">
                                <Link
                                    href={team.competition ? route('participant.submit', { competitionId: team.competition.id, teamId: team.id }) : '#'}
                                >
                                    <Button
                                        className="cursor-pointer"
                                        disabled={!team.competition || hasSubmitted}
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        {hasSubmitted
                                            ? t('participant.teams.show.entryAlreadySubmitted')
                                            : t('participant.teams.show.submitEntry')}
                                    </Button>
                                </Link>
                                <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                                    <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                    {t('participant.teams.show.onceAnyMemberOfThis')}</p>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}

export default TeamShowPage;