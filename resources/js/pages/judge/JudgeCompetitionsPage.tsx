import { PageHeader, Navbar, Footer, DashboardSidebar } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Head, router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";

interface Competition {
    id: number;
    title: string;
    status: string;
    end_date: string;
    category: {
        id: number;
        name: string;
    };
}

interface PageProps {
    [key: string]: any;
    competitions: Competition[];
}

function JudgeCompetitionsPage() {
    const { competitions } = usePage<PageProps>().props;

    return (
        <div className="flex min-h-screen flex-col">
            <Head title="Assigned Competitions – Evaluation Tasks" />
            <Navbar />

            <div className="flex flex-col lg:flex-row flex-1 min-w-0">
                <DashboardSidebar />

                <main className="flex-1 overflow-auto min-w-0">
                    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
                        <PageHeader
                            title="Assigned Competitions"
                            description="Competitions assigned to you for evaluation"
                        />

                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Competition
                                        </th>

                                        <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">
                                            Category
                                        </th>

                                        <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
                                            Deadline
                                        </th>

                                        <th className="px-4 py-3 text-left font-medium">
                                            Status
                                        </th>

                                        <th className="px-4 py-3 text-left font-medium">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {competitions.map((comp) => (
                                        <tr
                                            key={comp.id}
                                            className="border-t hover:bg-muted/50"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {comp.title}
                                            </td>

                                            <td className="hidden px-4 py-3 sm:table-cell">
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {comp.category?.name}
                                                </Badge>
                                            </td>

                                            <td className="text-muted-foreground hidden px-4 py-3 md:table-cell whitespace-nowrap">
                                                {comp.end_date}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Badge className="border-0 bg-purple-100 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                    {comp.status.replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </Badge>
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {comp.status === "judging" ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="cursor-pointer"
                                                        onClick={() =>
                                                            router.visit(
                                                                route(
                                                                    "judge.submissions",
                                                                    {
                                                                        id: comp.id,
                                                                    }
                                                                )
                                                            )
                                                        }
                                                    >
                                                        View Queue
                                                    </Button>
                                                ) : (
                                                    <p className="text-muted-foreground text-xs sm:text-sm">
                                                        Not in judging stage
                                                    </p>
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

export default JudgeCompetitionsPage;