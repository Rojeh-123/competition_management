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
                                    {competition.title} Exam
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-6">

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                    {/* Questions */}
                                    <div className="rounded-lg border p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <FileQuestion className="h-5 w-5" />

                                            <span className="font-medium">
                                                Questions
                                            </span>
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
                                                Duration
                                            </span>
                                        </div>

                                        <p className="text-2xl font-bold">
                                            {questionBank.duration_minutes}
                                            <span className="ml-1 text-sm font-normal">
                                                minutes
                                            </span>
                                        </p>
                                    </div>

                                </div>

                                {/* Instructions */}

                                <div className="rounded-lg border bg-muted/50 p-5">
                                    <h3 className="mb-3 font-semibold">
                                        Before you start
                                    </h3>

                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li>
                                            • You will receive{" "}
                                            <strong>
                                                {questionBank.number_of_questions}
                                            </strong>{" "}
                                            random questions.
                                        </li>

                                        <li>
                                            • You have{" "}
                                            <strong>
                                                {questionBank.duration_minutes}
                                            </strong>{" "}
                                            minutes to complete the exam.
                                        </li>

                                        <li>
                                            • Your answers are automatically
                                            saved while you are taking the exam.
                                        </li>

                                        <li>
                                            • After starting the exam, do not switch to another browser tab or
                                            application. Doing so will automatically submit your exam.
                                        </li>

                                        <li>
                                            • When the time expires, your exam
                                            will be automatically submitted.
                                        </li>

                                        <li>
                                            • You can only attempt this exam
                                            once.
                                        </li>
                                    </ul>
                                </div>

                                {/* Already attempted */}

                                {attempt ? (
                                    <div className="rounded-lg border p-5">

                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5" />

                                            <h3 className="font-semibold">
                                                Exam Already Attempted
                                            </h3>
                                        </div>

                                        <p className="mt-2 text-sm text-muted-foreground">
                                            You have already attempted this
                                            exam and cannot attempt it again.
                                        </p>

                                        {attempt.score !== null && (
                                            <div className="mt-4">
                                                <p className="text-sm text-muted-foreground">
                                                    Your Score
                                                </p>

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
                                        Start Exam
                                    </Button>
                                )}

                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </>
    );
}