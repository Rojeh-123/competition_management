import { route } from "ziggy-js";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Trophy, Users } from 'lucide-react';
import { PageHeader, Navbar, Footer, DashboardSidebar } from '@/components/layout';
import { Head, useForm } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface Competition {
    id: number;
    title: string;
}

interface Member {
    id: number;
    username: string;
    full_name: string;
}

interface Participant {
    id: number;
    username: string;
    full_name: string;
}

interface TeamData {
    id: number;
    name: string;
    competition_id: number | null;
    members: Member[];
}

interface EditProps {
    team: TeamData;
    competitions: Competition[];
    participants: Participant[];
}

interface TeamForm {
    name: string;
    competition_id: string;
    member_ids: number[];
    [key: string]: string | number[];
}

function TeamsEditPage({ team, competitions, participants }: EditProps) {
    const { data, setData, put, processing, errors } = useForm<TeamForm>({
        name: team.name,
        competition_id: team.competition_id ? String(team.competition_id) : '',
        member_ids: team.members.map((m) => m.id),
    });

    const toggleMember = (id: number) => {
        setData('member_ids',
            data.member_ids.includes(id)
                ? data.member_ids.filter((m) => m !== id)
                : [...data.member_ids, id]
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.teams.update', { team: team.id }));
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Head title="Teams – Edit Team" />
            <Navbar />
            <div className="flex flex-col lg:flex-row flex-1 min-w-0">
                <DashboardSidebar />
                <main className="flex-1 overflow-auto min-w-0">
                    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
                        <PageHeader title="Edit Team" description={`Update details for "${team.name}"`} />

                        <Card>
                            <CardContent className="pt-6">
                                <form onSubmit={submit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name" className="flex items-center gap-1.5">Team name</Label>
                                            <Input
                                                id="name"
                                                placeholder="Team name..."
                                                className="mt-1.5"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label className="flex items-center gap-1.5">
                                                <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
                                                Competition
                                            </Label>
                                            <Select
                                                value={data.competition_id}
                                                onValueChange={(value) => setData('competition_id', value)}
                                            >
                                                <SelectTrigger className="mt-1.5">
                                                    <SelectValue placeholder="Select competition" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {competitions.map((c) => (
                                                        <SelectItem key={c.id} value={String(c.id)}>
                                                            {c.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.competition_id && (
                                                <p className="mt-1 text-sm text-red-500">{errors.competition_id}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="flex items-center gap-1.5">
                                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                            Members (participants)
                                        </Label>
                                        <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 border rounded-md p-3 max-h-56 overflow-y-auto">
                                            {participants.map((p) => (
                                                <label
                                                    key={p.id}
                                                    className={cn(
                                                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer",
                                                        data.member_ids.includes(p.id) ? "bg-primary/5" : "hover:bg-muted"
                                                    )}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={data.member_ids.includes(p.id)}
                                                        onChange={() => toggleMember(p.id)}
                                                    />
                                                    {p.full_name} <span className="text-muted-foreground">({p.username})</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-1">
                                        <Button type="submit" className="cursor-pointer" disabled={processing}>
                                            <Save className="h-4 w-4 mr-2" />
                                            {processing ? 'Saving...' : 'Update Team'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}

export default TeamsEditPage;