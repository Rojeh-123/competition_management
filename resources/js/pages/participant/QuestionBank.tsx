import { useTranslation } from '@/lib/i18n';
import { Head, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Clock, FileQuestion, CheckCircle } from "lucide-react";

import { Navbar, DashboardSidebar } from '@/components/layout';

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

type Competition = {
    id: number;
    title: string;
};

type QuestionBank = {
    id: number;
    number_of_questions: number;
    duration_minutes: number;
    questions_count: number;
};

type Attempt = {
    id: number;
    status: "in_progress" | "submitted" | "expired";
    score: number | null;
    max_score: number | null;
};

type Props = {
    competition: Competition;
    questionBank: QuestionBank;
    attempt: Attempt | null;
};

export default function QuestionBank({
    competition,
    questionBank,
    attempt,
}: Props) {
  const { t } = useTranslation();

    const startExam = () => {
        router.visit(
            route(
                "participant.competitions.exam",
                competition.id
            )
        );
    };

    return (
        <>
            <Head title={`Exam - ${competition.title}`} />
            <Navbar />

            <div className="flex flex-col lg:flex-row flex-1 min-w-0">
                <DashboardSidebar />

                <div className="container mx-auto px-4 py-8">
                    <div className="mx-auto max-w-3xl">

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">
                                    {competition.title} {t('participant.questionBank.exam')}</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-6">

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                    {/* Questions */}
                                    <div className="rounded-lg border p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <FileQuestion className="h-5 w-5" />

                                            <span className="font-medium">
                                                {t('participant.questionBank.questions')}</span>
                                        </div>

                                        <p className="text-2xl font-bold">
                                            {questionBank.number_of_questions}
                                        </p>
                                    </div>

                                    {/* Duration */}
                                    <div className="rounded-lg border p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Clock className="h-5 w-5" />

                                            <span className="font-medium">
                                                {t('participant.questionBank.duration')}</span>
                                        </div>

                                        <p className="text-2xl font-bold">
                                            {questionBank.duration_minutes}
                                            <span className="ml-1 text-sm font-normal">
                                                {t('participant.questionBank.minutes')}</span>
                                        </p>
                                    </div>

                                </div>

                                {/* Instructions */}

                                <div className="rounded-lg border bg-muted/50 p-5">
                                    <h3 className="mb-3 font-semibold">
                                        {t('participant.questionBank.beforeYouStart')}</h3>

                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li>
                                            {t('participant.questionBank.YouWillReceive')}{" "}
                                            <strong>
                                                {questionBank.number_of_questions}
                                            </strong>{" "}
                                            {t('participant.questionBank.randomQuestions')}</li>

                                        <li>
                                            {t('participant.questionBank.YouHave')}{" "}
                                            <strong>
                                                {questionBank.duration_minutes}
                                            </strong>{" "}
                                            {t('participant.questionBank.minutesToCompleteTheExam')}</li>

                                        <li>
                                            {t('participant.questionBank.YourAnswersAreAutomatically')}</li>

                                        <li>
                                            {t('participant.questionBank.AfterStartingTheExam')}</li>

                                        <li>
                                            {t('participant.questionBank.WhenTheTimeExpires')}</li>

                                        <li>
                                            {t('participant.questionBank.YouCanOnlyAttempt')}</li>
                                    </ul>
                                </div>

                                {/* Already attempted */}

                                {attempt ? (
                                    <div className="rounded-lg border p-5">

                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5" />

                                            <h3 className="font-semibold">
                                                {t('participant.questionBank.examAlreadyAttempted')}</h3>
                                        </div>

                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {t('participant.questionBank.youHaveAlreadyAttemptedThis')}</p>

                                        {attempt.score !== null && (
                                            <div className="mt-4">
                                                <p className="text-sm text-muted-foreground">
                                                    {t('participant.questionBank.yourScore')}</p>

                                                <p className="text-2xl font-bold">
                                                    {attempt.score}
                                                    {" / "}
                                                    {attempt.max_score}
                                                </p>
                                            </div>
                                        )}

                                    </div>
                                ) : (
                                    <Button
                                        type="button"
                                        size="lg"
                                        className="w-full cursor-pointer"
                                        onClick={startExam}
                                    >
                                        {t('participant.questionBank.startExam')}</Button>
                                )}

                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </>
    );
}