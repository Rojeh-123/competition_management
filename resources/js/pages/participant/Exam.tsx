import { useTranslation } from '@/lib/i18n';
import axios from "axios";
import { Head, router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import { useEffect, useRef, useState } from "react";

import { Navbar, DashboardSidebar } from '@/components/layout';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
    Clock,
    CheckCircle2,
    Save,
} from "lucide-react";

type Question = {
    id: number;
    attempt_question_id: number;
    question_text: string;

    choices: {
        A: string;
        B: string;
        C: string;
        D: string;
    };

    points: number;
    selected_answer?: string | null;
};

type Props = {
    competition: {
        id: number;
        title: string;
    };

    questionBank: {
        id: number;
        number_of_questions: number;
        duration_minutes: number;
    };

    attempt: {
        id: number;
        started_at: string;
        expires_at: string;
        status: "in_progress" | "submitted" | "expired";
    };

    questions: Question[];
};

export default function Exam() {
  const { t } = useTranslation();


    const {
        competition,
        questionBank,
        attempt,
        questions,
    } = usePage<Props>().props;

    const [currentQuestion, setCurrentQuestion] =
        useState(0);

    const [answers, setAnswers] = useState<Record<number, string>>(() => {

        const initial: Record<number, string> = {};

        questions.forEach((question) => {
            if (question.selected_answer) {
                initial[question.attempt_question_id] = question.selected_answer;
            }
        });

        return initial;
    });

    const answersRef =
        useRef(answers);

    useEffect(() => {
        answersRef.current =
            answers;
    }, [answers]);

    const getRemainingSeconds = () => {

        const expires =
            new Date(
                attempt.expires_at
            ).getTime();

        return Math.max(
            0,
            Math.floor(
                (expires - Date.now()) /
                1000
            )
        );
    };

    const [timeLeft, setTimeLeft] =
        useState(
            getRemainingSeconds()
        );

    const [submitted, setSubmitted] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    useEffect(() => {

        if (submitted) {
            return;
        }

        const interval =
            setInterval(() => {

                const remaining =
                    getRemainingSeconds();

                setTimeLeft(
                    remaining
                );

                if (
                    remaining <= 0
                ) {

                    clearInterval(
                        interval
                    );

                    submitExam("time");
                }

            }, 1000);

        return () =>
            clearInterval(interval);

    }, [submitted]);

    useEffect(() => {

        if (submitted) {
            return;
        }

        const handleVisibilityChange = () => {

            if (document.visibilityState === "hidden") {
                submitExam("tab_switch");
            }
        };

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        return () =>
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );

    }, [submitted]);

    useEffect(() => {

        if (submitted) {
            return;
        }

        const interval =
            setInterval(() => {
                saveAnswers();
            }, 10000);

        return () =>
            clearInterval(interval);

    }, [submitted]);

    const selectAnswer = (
        answer: string
    ) => {

        const question =
            questions[
            currentQuestion
            ];

        setAnswers(
            (previous) => ({
                ...previous,

                [
                    question
                        .attempt_question_id
                ]: answer,
            })
        );
    };

    const saveAnswers = () => {

        if (submitted) {
            return;
        }

        setSaving(true);

        axios
            .post(
                route(
                    "participant.competitions.exam.save",
                    competition.id
                ),
                {
                    attempt_id:
                        attempt.id,

                    answers:
                        answersRef.current,
                }
            )
            .then((response) => {

                if (
                    response.data
                        ?.expired
                ) {
                    setSubmitted(
                        true
                    );

                    router.visit(
                        route(
                            "participant.competitions.question-bank",
                            competition.id
                        )
                    );
                }

            })
            .catch((error) => {

                if (
                    error.response
                        ?.data
                        ?.expired
                ) {
                    setSubmitted(
                        true
                    );

                    router.visit(
                        route(
                            "participant.competitions.question-bank",
                            competition.id
                        )
                    );
                }

            })
            .finally(() => {
                setSaving(false);
            });
    };

    const submitExam = (reason: "time" | "tab_switch" | "manual" = "manual") => {

        if (submittedRef.current) {
            return;
        }

        submittedRef.current = true;
        setSubmitted(true);

        if (reason !== "manual") {
            setAutoSubmitReason(reason);
        }

        router.post(
            route(
                "participant.competitions.exam.submit",
                competition.id
            ),
            {
                attempt_id: attempt.id,
                answers: answersRef.current,
                auto_submitted: reason !== "manual",
                auto_submit_reason: reason,
            },
            {
                onFinish: () => {
                    // Best effort — only works if this tab was opened via window.open().
                    // Most exam tabs are navigated to directly, so this is usually a no-op.
                    window.close();

                    // Real fallback: leave the exam route entirely so a stale
                    // tab can't be flipped back into and still show questions.
                    router.visit(
                        route(
                            "participant.competitions.question-bank",
                            competition.id
                        )
                    );
                },
            }
        );
    };

    const formatTime = (
        seconds: number
    ) => {

        const minutes =
            Math.floor(
                seconds / 60
            );

        const remainingSeconds =
            seconds % 60;

        return `${String(
            minutes
        ).padStart(
            2,
            "0"
        )}:${String(
            remainingSeconds
        ).padStart(
            2,
            "0"
        )}`;
    };

    const answeredCount =
        questions.filter(
            (question) =>
                answers[
                question
                    .attempt_question_id
                ]
        ).length;

    const question =
        questions[currentQuestion];

    const selectedAnswer =
        answers[
        question.attempt_question_id
        ];

    const isLastQuestion =
        currentQuestion ===
        questions.length - 1;

    // 1. Add a ref so the visibility handler always sees the latest `submitted`
    //    value without needing to re-bind the listener on every state change.
    const submittedRef = useRef(false);

    useEffect(() => {
        submittedRef.current = submitted;
    }, [submitted]);

    // 2. Track *why* the exam ended, so the UI can tell the user what happened
    //    if the redirect is delayed or they land back on a results page.
    const [autoSubmitReason, setAutoSubmitReason] =
        useState<"time" | "tab_switch" | null>(null);

    return (
        <>
            <Head
                title={`Exam - ${competition.title}`}
            />
            <Navbar />

            <div className="flex flex-col lg:flex-row flex-1 min-w-0">
                <DashboardSidebar />

                <div className="flex-1 min-w-0 bg-background">

                    {/* HEADER */}

                    <div className="top-0 z-50 border-b bg-background/95 backdrop-blur">

                        <div className="container mx-auto px-4 py-4">

                            <div className="flex items-center justify-between">

                                <div>
                                    <h1 className="font-bold">
                                        {competition.title}
                                    </h1>

                                    <p className="text-sm text-muted-foreground">
                                        {t('participant.exam.exam')}</p>
                                </div>

                                <div
                                    className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-mono font-bold ${timeLeft <= 60
                                        ? "text-red-500"
                                        : ""
                                        }`}
                                >
                                    <Clock className="h-5 w-5" />

                                    {formatTime(
                                        timeLeft
                                    )}
                                </div>

                            </div>

                        </div>

                    </div>

                    <main className="container mx-auto px-4 py-8">

                        <div className="mx-auto max-w-4xl space-y-6">

                            {/* PROGRESS */}

                            <Card>

                                <CardContent className="pt-6">

                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                        <div>

                                            <p className="font-semibold">
                                                {t('participant.exam.answeredQuestions')}</p>

                                            <p className="text-2xl font-bold">
                                                {answeredCount}
                                                {" / "}
                                                {questions.length}
                                            </p>

                                        </div>

                                        <div className="text-sm text-muted-foreground">
                                            {t('participant.exam.question')}{" "}
                                            {currentQuestion + 1}
                                            {" / "}
                                            {questions.length}
                                        </div>

                                    </div>

                                </CardContent>

                            </Card>

                            {/* QUESTION NAVIGATION */}

                            <Card>

                                <CardHeader>
                                    <CardTitle>
                                        {t('participant.exam.questions')}</CardTitle>
                                </CardHeader>

                                <CardContent>

                                    <div className="flex flex-wrap gap-2">

                                        {questions.map(
                                            (
                                                item,
                                                index
                                            ) => {

                                                const answered =
                                                    !!answers[
                                                    item
                                                        .attempt_question_id
                                                    ];

                                                const active =
                                                    index ===
                                                    currentQuestion;

                                                return (
                                                    <button
                                                        key={
                                                            item
                                                                .attempt_question_id
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            setCurrentQuestion(
                                                                index
                                                            )
                                                        }
                                                        className={`
                                                            flex
                                                            h-10
                                                            w-10
                                                            items-center
                                                            justify-center
                                                            rounded-lg
                                                            border
                                                            text-sm
                                                            font-semibold
                                                            transition
                                                            ${active
                                                                ? "border-primary bg-primary text-primary-foreground"
                                                                : answered
                                                                    ? "border-green-500 bg-green-500/10"
                                                                    : "hover:bg-muted"
                                                            }
                                                        `}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                );
                                            }
                                        )}

                                    </div>

                                    <div className="mt-4 flex gap-4 text-xs text-muted-foreground">

                                        <div>
                                            <span className="mr-1 inline-block h-3 w-3 rounded border" />
                                            {t('participant.exam.notAnswered')}</div>

                                        <div>
                                            <span className="mr-1 inline-block h-3 w-3 rounded bg-green-500/20" />
                                            {t('participant.exam.answered')}</div>

                                    </div>

                                </CardContent>

                            </Card>

                            {/* CURRENT QUESTION */}

                            <Card>

                                <CardHeader>

                                    <div className="flex items-center justify-between">

                                        <CardTitle>
                                            {t('participant.exam.question')}{" "}
                                            {currentQuestion +
                                                1}
                                            {" / "}
                                            {
                                                questions.length
                                            }
                                        </CardTitle>

                                        <span className="text-sm text-muted-foreground">
                                            {
                                                question.points
                                            }{" "}
                                            {t('participant.exam.point')}{question.points !==
                                                1
                                                ? "s"
                                                : ""}
                                        </span>

                                    </div>

                                </CardHeader>

                                <CardContent>

                                    <h2 className="mb-6 text-lg font-medium leading-relaxed">
                                        {
                                            question.question_text
                                        }
                                    </h2>

                                    <div className="space-y-3">

                                        {(
                                            [
                                                "A",
                                                "B",
                                                "C",
                                                "D",
                                            ] as const
                                        ).map(
                                            (
                                                choice
                                            ) => {

                                                const selected =
                                                    selectedAnswer ===
                                                    choice;

                                                return (
                                                    <button
                                                        key={
                                                            choice
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            selectAnswer(
                                                                choice
                                                            )
                                                        }
                                                        className={`
                                                            flex
                                                            w-full
                                                            items-center
                                                            gap-3
                                                            rounded-lg
                                                            border
                                                            p-4
                                                            text-left
                                                            transition
                                                            ${selected
                                                                ? "border-primary bg-primary/5"
                                                                : "hover:bg-muted"
                                                            }
                                                        `}
                                                    >

                                                        <div
                                                            className={`
                                                                flex
                                                                h-9
                                                                w-9
                                                                shrink-0
                                                                items-center
                                                                justify-center
                                                                rounded-full
                                                                border
                                                                font-semibold
                                                                ${selected
                                                                    ? "border-primary bg-primary text-primary-foreground"
                                                                    : ""
                                                                }
                                                            `}
                                                        >
                                                            {
                                                                choice
                                                            }
                                                        </div>

                                                        <span>
                                                            {
                                                                question
                                                                    .choices[
                                                                choice
                                                                ]
                                                            }
                                                        </span>

                                                    </button>
                                                );
                                            }
                                        )}

                                    </div>

                                </CardContent>

                            </Card>

                            {/* CONTROLS */}

                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">

                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={
                                        currentQuestion ===
                                        0
                                    }
                                    onClick={() =>
                                        setCurrentQuestion(
                                            (
                                                previous
                                            ) =>
                                                previous -
                                                1
                                        )
                                    }
                                >
                                    {t('participant.exam.previous')}</Button>

                                {isLastQuestion ? (

                                    <Button
                                        type="button"
                                        disabled={
                                            submitted
                                        }
                                        onClick={() => {

                                            if (
                                                confirm(
                                                    t('participant.exam.areYouSureYouWant')
                                                )
                                            ) {
                                                submitExam("manual");
                                            }

                                        }}
                                    >
                                        <CheckCircle2 className="mr-2 h-4 w-4" />

                                        {t('participant.exam.submitExam')}</Button>

                                ) : (

                                    <Button
                                        type="button"
                                        onClick={() =>
                                            setCurrentQuestion(
                                                (
                                                    previous
                                                ) =>
                                                    previous +
                                                    1
                                            )
                                        }
                                    >
                                        {t('participant.exam.next')}</Button>

                                )}

                            </div>

                        </div>

                    </main>

                </div>
            </div>
        </>
    );
}