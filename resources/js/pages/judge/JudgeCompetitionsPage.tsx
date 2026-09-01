import { useTranslation } from '@/lib/i18n';
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
    const { t } = useTranslation();

    const { competitions } = usePage<PageProps>().props;

    // Status mapping using existing translation keys
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
            <Head title={t('judge.judgeCompetitions.assignedCompetitionsEvaluationTasks')} />
            <Navbar />

            <div className="flex flex-col lg:flex-row flex-1 min-w-0">
                <DashboardSidebar />

                <main className="flex-1 overflow-auto min-w-0">
                    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
                        <PageHeader
                            title={t('sidebar.assignedCompetitions')}
                            description={t('judge.judgeCompetitions.competitionsAssignedToYouFor')}
                        />

                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">
                                            {t('judge.judgeCompetitions.competition')}</th>

                                        <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">
                                            {t('common.category')}</th>

                                        <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
                                            {t('judge.judgeCompetitions.deadline')}</th>

                                        <th className="px-4 py-3 text-left font-medium">
                                            {t('common.status')}</th>

                                        <th className="px-4 py-3 text-left font-medium">
                                            {t('judge.judgeCompetitions.action')}</th>
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
                                                    {statusMap[comp.status] || comp.status.replace("_", " ")}
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
                                                        {t('judge.judgeCompetitions.viewQueue')}</Button>
                                                ) : (
                                                    <p className="text-muted-foreground text-xs sm:text-sm">
                                                        {t('judge.judgeCompetitions.notInJudgingStage')}</p>
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