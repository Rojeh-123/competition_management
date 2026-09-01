import { useTranslation } from '@/lib/i18n';
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";

import { Navbar, DashboardSidebar } from '@/components/layout';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";

type Question = {
    id?: number;

    question_text: string;

    choices: {
        A: string;
        B: string;
        C: string;
        D: string;
    };

    correct_answer: "A" | "B" | "C" | "D";

    points: number;

    sort_order: number;
};

type QuestionBank = {
    id: number;
    competition_id: number;

    number_of_questions: number;
    duration_minutes: number;

    questions: Question[];
};

type Competition = {
    id: number;
    title: string;
    has_question_bank: boolean;
};

type PageProps = {
    competition: Competition;
    questionBank: QuestionBank;
};

export default function QuestionBankPage() {
    const { t } = useTranslation();

    const { competition, questionBank } =
        usePage<PageProps>().props;

    const { data, setData, put, processing, errors } = useForm({
        number_of_questions:
            questionBank.number_of_questions,

        duration_minutes:
            questionBank.duration_minutes,

        questions:
            questionBank.questions.map((question, index) => ({
                ...question,
                sort_order: index,
            })),
    });

    const addQuestion = () => {
        setData("questions", [
            ...data.questions,
            {
                question_text: "",

                choices: {
                    A: "",
                    B: "",
                    C: "",
                    D: "",
                },

                correct_answer: "A",

                points: 1,

                sort_order: data.questions.length,
            },
        ]);
    };

    const removeQuestion = (index: number) => {
        const questions = data.questions.filter(
            (_, i) => i !== index
        );

        setData(
            "questions",
            questions.map((question, i) => ({
                ...question,
                sort_order: i,
            }))
        );
    };

    const updateQuestion = (
        index: number,
        field: keyof Question,
        value: any
    ) => {
        const questions = [...data.questions];

        questions[index] = {
            ...questions[index],
            [field]: value,
        };

        setData("questions", questions);
    };

    const updateChoice = (
        questionIndex: number,
        choice: "A" | "B" | "C" | "D",
        value: string
    ) => {
        const questions = [...data.questions];

        questions[questionIndex] = {
            ...questions[questionIndex],

            choices: {
                ...questions[questionIndex].choices,
                [choice]: value,
            },
        };

        setData("questions", questions);
    };

    const handleSubmit = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        put(
            route(
                "admin.competitions.question-bank.sync",
                competition.id
            ),
            {
                preserveScroll: true,
            }
        );
    };

    return (
        <>
            <Head title={`${t('admin.questionBank.questionBank')} - ${competition.title}`} />
            <Navbar />

            <div className="flex flex-col lg:flex-row flex-1 min-w-0">
                <DashboardSidebar />

                <div className="container mx-auto px-4 py-8">

                    <Button
                        variant="ghost"
                        className="mb-6 cursor-pointer"
                        onClick={() =>
                            router.visit(
                                route(
                                    "competitions.show",
                                    competition.id
                                )
                            )
                        }
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />

                        {t('admin.questionBank.backToCompetition')}</Button>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">
                            {t('admin.questionBank.questionBank')}</h1>

                        <p className="text-muted-foreground mt-2">
                            {competition.title}
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-8"
                    >

                        {/* EXAM SETTINGS */}

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t('admin.questionBank.examSettings')}</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <div className="space-y-2">
                                        <Label>
                                            {t('admin.questionBank.numberOfQuestionsToBe')}</Label>

                                        <Input
                                            type="number"
                                            min={1}
                                            value={
                                                data.number_of_questions
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    "number_of_questions",
                                                    Number(
                                                        e.target.value
                                                    )
                                                )
                                            }
                                        />

                                        {errors.number_of_questions && (
                                            <p className="text-sm text-red-500">
                                                {
                                                    errors.number_of_questions
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>
                                            {t('admin.questionBank.examDurationMinutes')}</Label>

                                        <Input
                                            type="number"
                                            min={1}
                                            value={
                                                data.duration_minutes
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    "duration_minutes",
                                                    Number(
                                                        e.target.value
                                                    )
                                                )
                                            }
                                        />

                                        {errors.duration_minutes && (
                                            <p className="text-sm text-red-500">
                                                {
                                                    errors.duration_minutes
                                                }
                                            </p>
                                        )}
                                    </div>

                                </div>
                            </CardContent>
                        </Card>

                        {/* QUESTIONS */}

                        <div className="flex items-center justify-between">

                            <div>
                                <h2 className="text-xl font-semibold">
                                    {t('admin.questionBank.questions')}</h2>

                                <p className="text-sm text-muted-foreground">
                                    {data.questions.length} {t('admin.questionBank.questionsInTheQuestionBank')}</p>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="cursor-pointer"
                                onClick={addQuestion}
                            >
                                <Plus className="mr-2 h-4 w-4" />

                                {t('admin.questionBank.addQuestion')}</Button>

                        </div>

                        <div className="space-y-6">

                            {data.questions.map(
                                (question, questionIndex) => (

                                    <Card key={question.id ?? questionIndex}>

                                        <CardHeader>
                                            <div className="flex items-center justify-between">

                                                <CardTitle>
                                                    {t('admin.questionBank.question')}{" "}
                                                    {questionIndex + 1}
                                                </CardTitle>

                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        removeQuestion(
                                                            questionIndex
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>

                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-6">

                                            {/* QUESTION */}

                                            <div className="space-y-2">
                                                <Label>
                                                    {t('admin.questionBank.question')}</Label>

                                                <Textarea
                                                    value={
                                                        question.question_text
                                                    }
                                                    onChange={(e) =>
                                                        updateQuestion(
                                                            questionIndex,
                                                            "question_text",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder={t('admin.questionBank.enterTheQuestion')}
                                                    rows={4}
                                                />
                                            </div>

                                            {/* CHOICES */}

                                            <div className="space-y-4">

                                                <Label>
                                                    {t('admin.questionBank.choices')}</Label>

                                                {(
                                                    [
                                                        "A",
                                                        "B",
                                                        "C",
                                                        "D",
                                                    ] as const
                                                ).map((choice) => (

                                                    <div
                                                        key={choice}
                                                        className="flex items-center gap-3"
                                                    >

                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border font-semibold">
                                                            {choice}
                                                        </div>

                                                        <Input
                                                            value={
                                                                question
                                                                    .choices[
                                                                choice
                                                                ]
                                                            }
                                                            onChange={(e) =>
                                                                updateChoice(
                                                                    questionIndex,
                                                                    choice,
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder={t('admin.questionBank.choicePlaceholder').replace('{choice}', choice)}
                                                        />

                                                    </div>

                                                ))}

                                            </div>

                                            {/* CORRECT ANSWER */}

                                            <div className="space-y-2">
                                                <Label>
                                                    {t('admin.questionBank.correctAnswer')}</Label>

                                                <select
                                                    value={
                                                        question.correct_answer
                                                    }
                                                    onChange={(e) =>
                                                        updateQuestion(
                                                            questionIndex,
                                                            "correct_answer",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-md border bg-background px-3 py-2"
                                                >
                                                    <option value="A">
                                                        A
                                                    </option>

                                                    <option value="B">
                                                        B
                                                    </option>

                                                    <option value="C">
                                                        C
                                                    </option>

                                                    <option value="D">
                                                        D
                                                    </option>
                                                </select>
                                            </div>

                                            {/* POINTS */}

                                            <div className="space-y-2">
                                                <Label>
                                                    {t('admin.questionBank.points')}</Label>

                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step="0.5"
                                                    value={
                                                        question.points
                                                    }
                                                    onChange={(e) =>
                                                        updateQuestion(
                                                            questionIndex,
                                                            "points",
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                />
                                            </div>

                                        </CardContent>

                                    </Card>
                                )
                            )}

                        </div>

                        {/* SAVE */}

                        <div className="flex justify-end">

                            <Button
                                type="submit"
                                size="lg"
                                disabled={processing}
                                className="cursor-pointer"
                            >
                                <Save className="mr-2 h-4 w-4" />

                                {processing
                                    ? t('admin.questionBank.saving')
                                    : t('admin.questionBank.saveQuestionBank')}
                            </Button>

                        </div>

                    </form>

                </div>
            </div>
        </>
    );
}