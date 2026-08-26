import { route } from "ziggy-js";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users } from 'lucide-react';
import { PageHeader, Navbar, Footer, DashboardSidebar } from '@/components/layout';
import { Head, router, usePage } from '@inertiajs/react';

interface Competition {
    id: number;
    title: string;
}

interface Member {
    id: number;
    username: string;
    full_name: string;
}

interface Team {
    id: number;
    name: string;
    competition: Competition | null;
    members: Member[];
}

interface IndexProps {
    teams: Team[];
}

interface PageProps {
    user: {
        id: number;
    };
    [key: string]: unknown;
}

function MyTeamsPage({ teams }: IndexProps) {
    const { user } = usePage<PageProps>().props;

    return (
        <div className="flex min-h-screen flex-col">
            <Head title="My Teams" />
            <Navbar />
            <div className="flex flex-1">
                <DashboardSidebar />
                <main className="flex-1 overflow-auto">
                    <div className="p-6">
                        <PageHeader title="My Teams" description="Teams you've been assigned to by an admin" />

                        {teams.length === 0 ? (
                            <Card>
                                <CardContent className="pt-6">
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        You haven't been added to a team yet.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {teams.map((team) => (
                                    <Card key={team.id} onClick={() => router.visit(route('participant.teams.show', { team: team.id }))} className="cursor-pointer">
                                        <CardContent className="pt-6 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-lg">{team.name}</h3>
                                            </div>

                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <Trophy className="h-3.5 w-3.5" />
                                                {team.competition?.title ?? 'Not assigned to a competition yet'}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
                                                    <Users className="h-3.5 w-3.5" />
                                                    Members
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {team.members.map((m) => (
                                                        <Badge
                                                            key={m.id}
                                                            variant={m.id === user.id ? 'default' : 'secondary'}
                                                        >
                                                            {m.full_name}{m.id === user.id ? ' (You)' : ''}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}

export default MyTeamsPage;