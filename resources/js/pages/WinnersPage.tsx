
import { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import { Footer, Navbar, PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ChevronDown, Trophy } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface Winner {
    rank: number;
    participantName: string;
    score?: number | null;
    scoreDisplay?: string | null;
    notes?: string | null;
}

interface Competition {
    id: number;
    title: string;
    category: string;
    numberOfWinners: number;
    endDate: string;
    image?: string;
    winners: Winner[];
}

interface PageProps {
    [key: string]: any;
    competitions: Competition[];
}

const CARDS_PER_ROW = 3;

function WinnersPage() {
    const { competitions = [] } = usePage<PageProps>().props;
    const { t } = useTranslation();

    const [openedCompetition, setOpenedCompetition] = useState<number | null>(
        null
    );

    const toggleCompetition = (id: number) => {
        setOpenedCompetition((prev) => (prev === id ? null : id));
    };

    const competitionRows: Competition[][] = [];

    for (let i = 0; i < competitions.length; i += CARDS_PER_ROW) {
        competitionRows.push(
            competitions.slice(i, i + CARDS_PER_ROW)
        );
    }

    return (
        <>
            <Head title={`${t('winners.title')} – CompeteHub`} />
            <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">
                <div className="container mx-auto px-4 py-8">
                    <PageHeader
                        title={t('winners.title')}
                        description={t('winners.description')}
                    />

                    <div className="space-y-8">
                        {competitions.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="flex min-h-40 items-center justify-center p-10 text-center text-muted-foreground">
                                    {t('winners.noWinners')}
                                </CardContent>
                            </Card>
                        ) : null}

                        {competitionRows.map((row, rowIndex) => {
                            const openedCompetitionData = row.find(
                                (competition) =>
                                    competition.id === openedCompetition
                            );

                            return (
                                <div
                                    key={rowIndex}
                                    className="space-y-8"
                                >
                                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                                        {row.map((competition) => (
                                            <Card
                                                key={competition.id}
                                                onClick={() =>
                                                    toggleCompetition(
                                                        competition.id
                                                    )
                                                }
                                                className="group cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                            >
                                                <div className="h-64 overflow-hidden lg:h-80">
                                                    {competition.image ? (
                                                        <img
                                                            src={
                                                                competition.image
                                                            }
                                                            alt={
                                                                competition.title
                                                            }
                                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-muted">
                                                            <Trophy className="h-24 w-24 text-amber-500" />
                                                        </div>
                                                    )}
                                                </div>

                                                <CardContent className="p-6">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <h2 className="text-2xl font-bold">
                                                                {
                                                                    competition.title
                                                                }
                                                            </h2>

                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                <Badge>
                                                                    {
                                                                        competition.category
                                                                    }
                                                                </Badge>

                                                                <Badge variant="secondary">
                                                                    <Calendar className="mr-1 h-3 w-3" />
                                                                    {
                                                                        competition.endDate
                                                                    }
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        <ChevronDown
                                                            className={`h-6 w-6 shrink-0 transition-transform duration-300 ${openedCompetition ===
                                                                    competition.id
                                                                    ? "rotate-180"
                                                                    : ""
                                                                }`}
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    <div
                                        className={`overflow-hidden transition-all duration-500 ease-in-out ${openedCompetitionData
                                                ? "max-h-[3000px] opacity-100"
                                                : "max-h-0 opacity-0"
                                            }`}
                                    >
                                        <Card className="w-full overflow-hidden">
                                            {openedCompetitionData && (
                                                <CardContent className="p-8">
                                                    <div className="mb-8 flex items-center justify-center gap-3">
                                                        <Trophy className="h-7 w-7 text-amber-500" />

                                                        <h3 className="text-center text-3xl font-bold">
                                                            {
                                                                openedCompetitionData.title
                                                            }
                                                        </h3>
                                                    </div>

                                                    {/* Top Winners */}
                                                    <div className="mb-10">
                                                        <h4 className="mb-5 text-xl font-semibold">
                                                            {t('winners.topWinners')}
                                                        </h4>

                                                        <div className="space-y-3">
                                                            {openedCompetitionData.winners
                                                                .slice(0, openedCompetitionData.numberOfWinners)
                                                                .map(
                                                                    (
                                                                        winner
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                winner.rank
                                                                            }
                                                                            className="flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between"
                                                                        >
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-600 dark:bg-amber-900/30">
                                                                                    #
                                                                                    {
                                                                                        winner.rank
                                                                                    }
                                                                                </div>

                                                                                <div>
                                                                                    <span className="font-medium text-lg">
                                                                                        {
                                                                                            winner.participantName
                                                                                        }
                                                                                    </span>

                                                                                    {winner.notes ? (
                                                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                                                            {
                                                                                                winner.notes
                                                                                            }
                                                                                        </p>
                                                                                    ) : null}
                                                                                </div>
                                                                            </div>

                                                                            <span className="font-semibold text-amber-600 text-lg">
                                                                                {
                                                                                    winner.scoreDisplay ??
                                                                                    winner.score ??
                                                                                    "—"
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    )
                                                                )}
                                                        </div>
                                                    </div>

                                                    {/* Full Leaderboard */}
                                                    <div>
                                                        <h4 className="mb-5 text-xl font-semibold">
                                                            {t('winners.fullLeaderboard')}
                                                        </h4>

                                                        <div className="space-y-2">
                                                            {openedCompetitionData.winners.map(
                                                                (
                                                                    winner
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            winner.rank
                                                                        }
                                                                        className="flex flex-col gap-2 rounded-lg border px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                                                    >
                                                                        <span className="font-semibold">
                                                                            #
                                                                            {
                                                                                winner.rank
                                                                            }
                                                                        </span>

                                                                        <span className="font-medium">
                                                                            {
                                                                                winner.participantName
                                                                            }
                                                                        </span>

                                                                        <span className="font-semibold text-amber-600">
                                                                            {
                                                                                winner.scoreDisplay ??
                                                                                winner.score ??
                                                                                "—"
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            )}
                                        </Card>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
        </>
    );
}

export default WinnersPage;
