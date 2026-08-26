import { Head, usePage } from "@inertiajs/react";
import { Badge } from "@/components/ui/badge";
import { PageHeader, Navbar, Footer, DashboardSidebar } from "@/components/layout";

interface Score {
    id: number;
    submissionId: number;
    competitionTitle: string | null;
    totalScore: number;
    maxScore: number;
    status: string;
    createdAt: string | null;
}

function JudgeHistoryPage() {
  const { scores } = usePage().props as unknown as {
      scores: Score[];
  };
    return (
        <div className="flex min-h-screen flex-col">
            <Head title="Evaluation History – Completed Reviews" />
            <Navbar />

            <div className="flex flex-col lg:flex-row flex-1 min-w-0">
                <DashboardSidebar />

                <main className="flex-1 overflow-auto min-w-0">
                    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
                        <PageHeader
                            title="Evaluation History"
                            description="Your completed evaluation records"
                        />

                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-medium">
                                            Entry ID
                                        </th>

                                        <th className="text-left px-4 py-3 font-medium">
                                            Competition
                                        </th>

                                        <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">
                                            Score Given
                                        </th>

                                        <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                                            Date
                                        </th>

                                        <th className="text-left px-4 py-3 font-medium">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {scores.map((score) => (
                                        <tr
                                            key={score.id}
                                            className="border-t hover:bg-muted/50"
                                        >
                                            <td className="px-4 py-3 font-mono text-muted-foreground whitespace-nowrap">
                                                #SUB-
                                                {String(
                                                    score.submissionId
                                                ).padStart(3, "0")}
                                            </td>

                                            <td className="px-4 py-3 font-medium">
                                                {score.competitionTitle ??
                                                    "Unknown"}
                                            </td>

                                            <td className="px-4 py-3 hidden sm:table-cell font-semibold whitespace-nowrap">
                                                {Math.floor(score.totalScore)}/{score.maxScore}
                                            </td>

                                            <td className="px-4 py-3 hidden md:table-cell text-muted-foreground whitespace-nowrap">
                                                {score.createdAt}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {score.status === 'Locked' ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                                                        Locked
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                                                        In Draft
                                                    </Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
}

export default JudgeHistoryPage;