import React from "react";
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { route } from "ziggy-js";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import {
    PageHeader,
    FileUpload,
    Navbar,
    Footer,
    DashboardSidebar,
} from "@/components/layout";

type SubmissionForm = {
    [key: string]: string | number | boolean | File[] | null;

    competition_id: number;
    category_id: number | null;
    title: string;
    description: string;
    files: File[];
    original: boolean;
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

    participants_count: number;
    submissions_count: number;

    category?: {
        id: number;
        name: string;
    };
};

type PageProps = {
    competition: Competition;
    teamId: number | null;
};

export default function SubmitEntryPage() {
    const { competition, errors, teamId } = usePage<PageProps>().props;
    const { data, setData, post, processing } =
        useForm<SubmissionForm>({
            competition_id: competition.id,
            category_id: competition.category?.id ?? null,
            title: "",
            description: "",
            files: [],
            original: false,
            teamId: teamId,
        });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        router.post(route("participant.submissions.store"), data, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) => console.log(errors),
        });
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Head title="Submit Entry – Upload Your Submission" />
            <Navbar />

            <div className="flex flex-1">
                <DashboardSidebar />

                <main className="flex-1 overflow-auto">
                    <div className="p-6">
                        <PageHeader
                            title="Submit Entry"
                            description="Upload your submission for the competition"
                        />

                        <Card className="w-full">
                            <CardContent className="pt-6">
                                <form onSubmit={submit} className="space-y-6">
                                    <div>
                                        <Label htmlFor="title">
                                            Entry Title
                                        </Label>

                                        <Input
                                            id="title"
                                            className="mt-1.5"
                                            placeholder="Optimized Graph Index Core Implementation"
                                            value={data.title}
                                            onChange={(e) =>
                                                setData(
                                                    "title",
                                                    e.target.value
                                                )
                                            }
                                        />

                                        {errors.title && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="description">
                                            Description
                                        </Label>

                                        <Textarea
                                            id="description"
                                            className="mt-1.5 min-h-[120px]"
                                            placeholder="Describe your submission..."
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    "description",
                                                    e.target.value
                                                )
                                            }
                                        />

                                        {errors.description && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label className="mb-3 block">
                                            Upload Files
                                        </Label>

                                        <FileUpload
                                            accept={(competition.allowed_file_types ?? "")
                                                .split(",")
                                                .map((type) => type.trim())
                                                .filter((type) => type.length > 0)
                                                .map((type) => type.startsWith(".") ? type : `.${type}`)
                                                .join(",")}
                                            maxSize={competition.max_file_size_mb}
                                            onUpload={(files: File[]) =>
                                                setData("files", files)
                                            }
                                        />

                                        {Object.entries(errors)
                                            .filter(([key]) => key.startsWith("files"))
                                            .map(([key, message]) => (
                                                <p key={key} className="mt-1 text-sm font-semibold text-red-500">
                                                    {message}
                                                </p>
                                            ))}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="original"
                                            checked={data.original}
                                            onCheckedChange={(checked) =>
                                                setData("original", checked === true)
                                            }
                                        />

                                        <Label htmlFor="original" className="cursor-pointer font-normal">
                                            I verify this work is original and created by me.
                                        </Label>
                                    </div>

                                    {errors.original && (
                                        <p className="text-sm text-red-500">
                                            {errors.original}
                                        </p>
                                    )}

                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                window.history.back()
                                            }
                                        >
                                            Cancel
                                        </Button>

                                        <Button
                                            type="submit"
                                            disabled={processing || !data.original}
                                        >
                                            {processing
                                                ? "Submitting..."
                                                : "Submit Entry"}
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