import { route } from "ziggy-js";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Trophy, Users } from 'lucide-react';
import { PageHeader, Navbar, Footer, DashboardSidebar } from '@/components/layout';
import { Head, Link, router } from '@inertiajs/react';

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

function TeamsIndexPage({ teams }: IndexProps) {
    const handleDelete = (id: number) => {
        if (confirm('Remove this team?')) {
            router.delete(route('admin.teams.destroy', { team: id }));
        }
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Head title="Teams – Manage Teams" />
            <Navbar />
            <div className="flex flex-col lg:flex-row flex-1 min-w-0">
                <DashboardSidebar />
                <main className="flex-1 overflow-auto min-w-0">
                    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <PageHeader title="Teams" description="Manage teams entered into competitions" />
                            <Link href={route('admin.teams.create')}>
                                <Button className="cursor-pointer w-full sm:w-auto">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Team
                                </Button>
                            </Link>
                        </div>

                        <Card>
                            <CardContent className="pt-6">
                                {teams.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-8 text-center">
                                        No teams yet. Add your first team to get started.
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="text-left border-b text-sm text-muted-foreground">
                                                    <th className="py-2 font-medium">Name</th>
                                                    <th className="font-medium">Competition</th>
                                                    <th className="font-medium">Members</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {teams.map((team) => (
                                                    <tr key={team.id} className="border-b last:border-0">
                                                        <td className="py-3 font-medium">{team.name}</td>
                                                        <td>
                                                            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                                <Trophy className="h-3.5 w-3.5" />
                                                                {team.competition?.title ?? '—'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                                <Users className="h-3.5 w-3.5" />
                                                                {team.members.length}
                                                            </span>
                                                        </td>
                                                        <td className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Link href={route('admin.teams.edit', { team: team.id })}>
                                                                    <Button variant="ghost" size="icon" className="cursor-pointer">
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="cursor-pointer text-destructive"
                                                                    onClick={() => handleDelete(team.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}

export default TeamsIndexPage;