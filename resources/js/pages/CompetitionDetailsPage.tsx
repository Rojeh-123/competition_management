import { Head, router, useForm, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Trophy,
    Users,
    Calendar,
    FileText,
    Award,
    Clock,
    ArrowLeft,
    Star,
    Plus,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountdownTimer } from '@/components/layout';
import { Navbar, Footer } from '@/components/layout';
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

type Winner = {
    id: number;
    competition_id?: number;
    submission_id?: number;
    participant_id?: number | null;
    rank?: number | null;
    rank_position?: number | null;
    final_score?: number | string | null;
    score?: number | string | null;
    notes?: string | null;
    participant?: {
        id: number;
        username?: string;
        full_name?: string;
        email?: string;
    } | null;
    submission?: {
        id: number;
        title?: string;
        participant?: {
            id: number;
            username?: string;
            full_name?: string;
            email?: string;
        } | null;
    } | null;
};

type Competition = {
    id: number;
    title: string;
    description: string;
    rules: string;
    status: string;
    visibility: string;
    number_of_winners: number;
    prize_description: string;
    max_file_size_mb: number;
    allowed_file_types: string;
    start_date: string;
    submission_deadline: string;
    end_date: string;
    winner_announced_at?: string | null;

    participants_count: number;
    submissions_count: number;

    category?: {
        id: number;
        name: string;
    };

    score_criteria?: {
        id: number;
        name: string;
        max_score: number;
    }[];

    winners?: Winner[];
};

type User = {
    id: number;
    full_name: string;
    username: string;
    email: string;
    role: string;
};

type PageProps = {
    user: User;
    competition: Competition;
    isJoined: boolean;
};

function ManageCompetitionDetailsPage() {
    const { user, competition, isJoined } =
        usePage<PageProps>().props;

    const [now, setNow] = useState(Date.now());

    const isWinnersAnnounced =
        Boolean(competition) &&
        (competition.status === "results_published" ||
            (competition.winners && competition.winners.length > 0) ||
            (Boolean(competition.winner_announced_at) &&
                new Date(competition.winner_announced_at!).getTime() <= now));

    if (!competition) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <p>Competition not found.</p>

                <Button
                    variant="ghost"
                    className="mt-4 cursor-pointer"
                    onClick={() =>
                        router.visit(route("competitions.index"))
                    }
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Competitions
                </Button>
            </div>
        );
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const getCountdown = (date: string) => {
        const target = new Date(date).getTime();
        const diff = target - now;

        if (diff <= 0) return "Expired";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
            (diff / (1000 * 60 * 60)) % 24
        );
        const minutes = Math.floor(
            (diff / (1000 * 60)) % 60
        );
        const seconds = Math.floor(
            (diff / 1000) % 60
        );

        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    const prizes =
        competition.prize_description
            ?.split(",")
            .map((item) => {
                const [place, ...prize] = item.split(":");

                return {
                    place: place.trim(),
                    prize: prize.join(":").trim(),
                };
            }) || [];

    const medalMap: Record<
        string,
        {
            icon: string;
            className: string;
        }
    > = {
        "1st": {
            icon: "🥇",
            className:
                "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800",
        },
        "2nd": {
            icon: "🥈",
            className:
                "bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-700",
        },
        "3rd": {
            icon: "🥉",
            className:
                "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800",
        },
    };

    const defaultMedal = {
        icon: "🏅",
        className: "bg-muted border",
    };

    const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);

    const {
        data,
        setData,
        post,
        processing,
        reset,
        errors,
    } = useForm({
        name: "",
        max_score: "",
    });

    const handleAddCriterion = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        post(
            route(
                "admin.competitions.criteria.store",
                competition.id
            ),
            {
                preserveScroll: true,

                onSuccess: () => {
                    reset();
                    setIsCriteriaModalOpen(false);
                },
            }
        );
    };

    return (
        <>
            <Head title={`${competition.title} – Competition Details`} />
            <div className="min-h-screen flex flex-col">
                <Navbar />

                <main className="flex-1">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

                        <Button
                            variant="ghost"
                            onClick={() =>
                                router.visit(route('competitions.index'))
                            }
                            className="mb-4 cursor-pointer"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Competitions
                        </Button>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            <div className="lg:col-span-2">

                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge variant="secondary">
                                            {competition.category?.name}
                                        </Badge>

                                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0">
                                            {competition.status.replace('_', ' ')}
                                        </Badge>
                                    </div>

                                    <h1 className="text-3xl font-bold mb-3">
                                        {competition.title}
                                    </h1>

                                    <p className="text-muted-foreground">
                                        {competition.description}
                                    </p>
                                </div>

                                <Tabs
                                    defaultValue="overview"
                                    className="w-full"
                                >
                                    <div className="overflow-x-auto pb-1 max-w-full">
                                        <TabsList className="inline-flex w-auto min-w-full justify-start">

                                        <TabsTrigger value="overview">
                                            Overview
                                        </TabsTrigger>

                                        <TabsTrigger value="rules">
                                            Rules & Guidelines
                                        </TabsTrigger>

                                        <TabsTrigger value="judging">
                                            Judging Criteria
                                        </TabsTrigger>

                                        <TabsTrigger value="prizes">
                                            Prizes
                                        </TabsTrigger>

                                        <TabsTrigger value="timeline">
                                            Timeline
                                        </TabsTrigger>

                                        {isWinnersAnnounced && (
                                            <TabsTrigger value="winners">
                                                Winners
                                            </TabsTrigger>
                                        )}

                                        </TabsList>
                                    </div>
                                    
                                    {/* OVERVIEW TAB */}

                                    <TabsContent
                                        value="overview"
                                        className="mt-6"
                                    >
                                        <Card>
                                            <CardContent className="pt-6">

                                                <p className="whitespace-pre-line">
                                                    {competition.description}
                                                </p>

                                                <div className="grid grid-cols-2 gap-4 mt-6">

                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            {competition.participants_count} participants
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            {competition.submissions_count} submissions
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Award className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            {competition.number_of_winners} winners
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Trophy className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            Certificates & Prizes
                                                        </span>
                                                    </div>

                                                </div>

                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    {/* RULES TAB */}

                                    <TabsContent
                                        value="rules"
                                        className="mt-6"
                                    >
                                        <Card>
                                            <CardContent className="pt-6">

                                                <pre className="whitespace-pre-line text-sm">
                                                    {competition.rules}
                                                </pre>

                                                <div className="mt-6 p-4 bg-muted rounded-lg">

                                                    <p className="text-sm font-medium mb-2">
                                                        Submission Requirements
                                                    </p>

                                                    <p className="text-sm text-muted-foreground">
                                                        Max file size: {competition.max_file_size_mb}MB
                                                    </p>

                                                    <p className="text-sm text-muted-foreground">
                                                        Allowed types: {competition.allowed_file_types}
                                                    </p>

                                                </div>

                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    {/* JUDGING CRITERIA TAB */}

                                    <TabsContent
                                        value="judging"
                                        className="mt-6"
                                    >
                                        <Card>
                                            <CardContent className="pt-6">

                                                {competition.score_criteria?.length ? (

                                                    <div className="space-y-4">

                                                        {competition.score_criteria.map((criterion) => (

                                                            <div
                                                                key={criterion.id}
                                                                className="rounded-lg border p-4"
                                                            >

                                                                <div className="flex justify-between items-center">

                                                                    <div className="flex items-center gap-2">
                                                                        <Star className="h-5 w-5 text-yellow-500" />

                                                                        <h3 className="font-semibold">
                                                                            {criterion.name}
                                                                        </h3>
                                                                    </div>

                                                                    <Badge>
                                                                        {criterion.max_score} pts
                                                                    </Badge>

                                                                </div>

                                                            </div>

                                                        ))}

                                                    </div>

                                                ) : (

                                                    <p className="text-muted-foreground">
                                                        No judging criteria have been added for this competition.
                                                    </p>

                                                )}

                                                {user?.role === "admin" && (
                                                    <div className="flex justify-end mt-4">
                                                        <Button
                                                            className="cursor-pointer"
                                                            onClick={() => setIsCriteriaModalOpen(true)}
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Add Judging Criteria
                                                        </Button>
                                                    </div>
                                                )}

                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    {/* PRIZES TAB */}

                                    <TabsContent
                                        value="prizes"
                                        className="mt-6"
                                    >
                                        <Card>
                                            <CardContent className="pt-6">

                                                <div className="space-y-4">

                                                    {prizes.map((item, index) => {
                                                        const medal =
                                                            medalMap[item.place] ||
                                                            defaultMedal;

                                                        return (
                                                            <div
                                                                key={index}
                                                                className={`flex items-center gap-4 p-4 rounded-lg border ${medal.className}`}
                                                            >
                                                                <div className="text-3xl">
                                                                    {medal.icon}
                                                                </div>

                                                                <div>
                                                                    <p className="font-semibold">
                                                                        {item.place} Place
                                                                    </p>

                                                                    <p className="text-sm text-muted-foreground">
                                                                        {item.prize}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}

                                                </div>

                                            </CardContent>
                                        </Card>
                                    </TabsContent>


                                    {/* TIMELINE TAB */}

                                    <TabsContent
                                        value="timeline"
                                        className="mt-6"
                                    >
                                        <Card>
                                            <CardContent className="pt-6">

                                                <div className="space-y-6">

                                                    {[
                                                        {
                                                            label: "Competition Starts",
                                                            date: competition.start_date,
                                                            icon: Calendar,
                                                        },
                                                        {
                                                            label: "Submission Deadline",
                                                            date: competition.submission_deadline,
                                                            icon: Clock,
                                                        },
                                                        {
                                                            label: "Competition Ends",
                                                            date: competition.end_date,
                                                            icon: Trophy,
                                                        },
                                                    ].map((item, i) => (

                                                        <div
                                                            key={i}
                                                            className="flex items-center gap-4"
                                                        >
                                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                                <item.icon className="h-6 w-6 text-primary" />
                                                            </div>

                                                            <div className="flex-1">

                                                                <p className="font-medium">
                                                                    {item.label}
                                                                </p>

                                                                <p className="text-sm font-bold tracking-tight text-primary">
                                                                    {getCountdown(item.date)}
                                                                </p>

                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {new Date(
                                                                        item.date
                                                                    ).toLocaleDateString(
                                                                        "en-US",
                                                                        {
                                                                            weekday: "long",
                                                                            year: "numeric",
                                                                            month: "long",
                                                                            day: "numeric",
                                                                        }
                                                                    )}
                                                                </p>

                                                            </div>
                                                        </div>

                                                    ))}

                                                </div>

                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    {/* WINNERS TAB */}
                                    {isWinnersAnnounced && (
                                        <TabsContent
                                            value="winners"
                                            className="mt-6"
                                        >
                                            <Card className="w-full overflow-hidden">
                                                <CardContent className="p-8">
                                                    <div className="mb-8 flex items-center justify-center gap-3">
                                                        <Trophy className="h-7 w-7 text-amber-500" />
                                                        <h3 className="text-center text-3xl font-bold">
                                                            {competition.title}
                                                        </h3>
                                                    </div>

                                                    {competition.winners && competition.winners.length > 0 ? (
                                                        <>
                                                            {/* Top Winners */}
                                                            <div className="mb-10">
                                                                <h4 className="mb-5 text-xl font-semibold">
                                                                    Top Winners
                                                                </h4>

                                                                <div className="space-y-3">
                                                                    {[...competition.winners]
                                                                        .sort((a, b) => {
                                                                            const rankA = a.rank_position ?? a.rank ?? 999;
                                                                            const rankB = b.rank_position ?? b.rank ?? 999;
                                                                            return rankA - rankB;
                                                                        })
                                                                        .slice(0, competition.number_of_winners || competition.winners.length)
                                                                        .map((winner, index) => {
                                                                            const rank = winner.rank_position ?? winner.rank ?? (index + 1);
                                                                            const participantName =
                                                                                winner.participant?.username ||
                                                                                winner.participant?.full_name ||
                                                                                winner.submission?.participant?.username ||
                                                                                winner.submission?.participant?.full_name ||
                                                                                `Participant #${winner.participant_id || winner.id}`;

                                                                            const rawScore = winner.final_score ?? winner.score;
                                                                            const scoreDisplay = rawScore !== null && rawScore !== undefined
                                                                                ? (typeof rawScore === 'number' ? rawScore.toFixed(2) : String(rawScore))
                                                                                : null;

                                                                            return (
                                                                                <div
                                                                                    key={winner.id || rank}
                                                                                    className="flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between"
                                                                                >
                                                                                    <div className="flex items-center gap-4">
                                                                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-600 dark:bg-amber-900/30">
                                                                                            #
                                                                                            {rank}
                                                                                        </div>

                                                                                        <div>
                                                                                            <span className="font-medium text-lg">
                                                                                                {participantName}
                                                                                            </span>

                                                                                            {winner.notes ? (
                                                                                                <p className="mt-1 text-sm text-muted-foreground">
                                                                                                    {winner.notes}
                                                                                                </p>
                                                                                            ) : null}
                                                                                        </div>
                                                                                    </div>

                                                                                    <span className="font-semibold text-amber-600 text-lg">
                                                                                        {scoreDisplay ?? "—"}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                </div>
                                                            </div>

                                                            {/* Full Leaderboard */}
                                                            <div>
                                                                <h4 className="mb-5 text-xl font-semibold">
                                                                    Full Leaderboard
                                                                </h4>

                                                                <div className="space-y-2">
                                                                    {[...competition.winners]
                                                                        .sort((a, b) => {
                                                                            const rankA = a.rank_position ?? a.rank ?? 999;
                                                                            const rankB = b.rank_position ?? b.rank ?? 999;
                                                                            return rankA - rankB;
                                                                        })
                                                                        .map((winner, index) => {
                                                                            const rank = winner.rank_position ?? winner.rank ?? (index + 1);
                                                                            const participantName =
                                                                                winner.participant?.username ||
                                                                                winner.participant?.full_name ||
                                                                                winner.submission?.participant?.username ||
                                                                                winner.submission?.participant?.full_name ||
                                                                                `Participant #${winner.participant_id || winner.id}`;

                                                                            const rawScore = winner.final_score ?? winner.score;
                                                                            const scoreDisplay = rawScore !== null && rawScore !== undefined
                                                                                ? (typeof rawScore === 'number' ? rawScore.toFixed(2) : String(rawScore))
                                                                                : null;

                                                                            return (
                                                                                <div
                                                                                    key={winner.id || rank}
                                                                                    className="flex flex-col gap-2 rounded-lg border px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                                                                >
                                                                                    <span className="font-semibold">
                                                                                        #
                                                                                        {rank}
                                                                                    </span>

                                                                                    <span className="font-medium">
                                                                                        {participantName}
                                                                                    </span>

                                                                                    <span className="font-semibold text-amber-600">
                                                                                        {scoreDisplay ?? "—"}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="p-8 text-center text-muted-foreground rounded-lg border border-dashed">
                                                            <Trophy className="h-10 w-10 mx-auto text-amber-500/50 mb-2" />
                                                            <p className="font-medium text-foreground">Results Published</p>
                                                            <p className="text-sm mt-1">Winners have been officially announced for this competition.</p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                    )}

                                </Tabs>

                            </div>

                            {/* SIDEBAR */}

                            <div className="space-y-6">

                                <Card>
                                    <CardContent className="pt-6 text-center">

                                        <p className="text-sm text-muted-foreground mb-2">
                                            Submission Closes In
                                        </p>

                                        <CountdownTimer
                                            deadline={
                                                competition.submission_deadline
                                            }
                                        />

                                        <div className="mt-4 space-y-2">

                                            {user?.role === "admin" && (
                                                <>
                                                    {competition.status ===
                                                        "upcoming" && (
                                                        <Button
                                                            className="w-full cursor-pointer"
                                                            variant="outline"
                                                            onClick={() =>
                                                                router.visit(
                                                                    route(
                                                                        "admin.competitions.edit",
                                                                        competition.id
                                                                    )
                                                                )
                                                            }
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Update Competition
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="destructive"
                                                        className="w-full cursor-pointer"
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    "Are you sure you want to delete this competition? This action cannot be undone."
                                                                )
                                                            ) {
                                                                router.delete(
                                                                    route(
                                                                        "admin.competitions.destroy",
                                                                        competition.id
                                                                    )
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Competition
                                                    </Button>
                                                </>
                                            )}

                                            {(
                                                user &&
                                                (
                                                    competition.status ===
                                                        "upcoming" ||
                                                    competition.status ===
                                                        "open"
                                                ) &&
                                                !isJoined &&
                                                user.role === "participant"
                                            ) && (
                                                <Button
                                                    className="w-full mt-4 cursor-pointer"
                                                    size="lg"
                                                    onClick={() =>
                                                        router.visit(
                                                            route(
                                                                "participant.competitions.join",
                                                                {
                                                                    id: competition.id,
                                                                }
                                                            ),
                                                            {
                                                                method: "post",
                                                            }
                                                        )
                                                    }
                                                >
                                                    Join Competition
                                                </Button>
                                            )}

                                        </div>

                                        <p className="text-xs text-muted-foreground mt-2">
                                            Free to participate
                                        </p>

                                    </CardContent>
                                </Card>


                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">
                                            Quick Info
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-3 text-sm">

                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Max File Size
                                            </span>

                                            <span className="font-medium">
                                                {competition.max_file_size_mb} MB
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                File Types
                                            </span>

                                            <span className="font-medium">
                                                {competition.allowed_file_types}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Winners
                                            </span>

                                            <span className="font-medium">
                                                {competition.number_of_winners}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Visibility
                                            </span>

                                            <span className="font-medium capitalize">
                                                {competition.visibility}
                                            </span>
                                        </div>

                                    </CardContent>
                                </Card>

                            </div>

                        </div>
                    </div>
                </main>

                <Dialog
                    open={isCriteriaModalOpen}
                    onOpenChange={setIsCriteriaModalOpen}
                >
                    <DialogContent>

                        <DialogHeader>
                            <DialogTitle>
                                Add Judging Criterion
                            </DialogTitle>
                        </DialogHeader>

                        <form
                            onSubmit={handleAddCriterion}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label>Name</Label>

                                <Input
                                    value={data.name}
                                    onChange={(e) =>
                                        setData(
                                            "name",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Problem Solving"
                                />

                                {errors.name && (
                                    <p className="text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Maximum Score</Label>

                                <Input
                                    type="number"
                                    min={1}
                                    value={data.max_score}
                                    onChange={(e) =>
                                        setData(
                                            "max_score",
                                            e.target.value
                                        )
                                    }
                                    placeholder="40"
                                />

                                {errors.max_score && (
                                    <p className="text-sm text-red-500">
                                        {errors.max_score}
                                    </p>
                                )}
                            </div>

                            <DialogFooter>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setIsCriteriaModalOpen(false)
                                    }
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing
                                        ? "Adding..."
                                        : "Add Criterion"}
                                </Button>

                            </DialogFooter>
                        </form>

                    </DialogContent>
                </Dialog>

                <Footer />
            </div>
        </>
    );
}

export default ManageCompetitionDetailsPage;