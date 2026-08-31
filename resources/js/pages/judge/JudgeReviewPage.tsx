import { useTranslation } from '@/lib/i18n';
import { useState } from "react";
import { Head, router, usePage, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import {
  Navbar,
  Footer,
  DashboardSidebar,
} from "@/components/layout";
import { route } from "ziggy-js";
import type { PageProps as InertiaPageProps } from '@inertiajs/core';

interface Criterion {
  id: number;
  name: string;
  maxScore: number;
}

interface SubmissionFile {
  id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
}

interface Submission {
  id: number;
  title: string;
  description: string | null;
  competitionTitle: string;
  participantName: string;
  files: SubmissionFile[];
  criteria: Criterion[];
}

interface DraftScore {
    criterion_id: number;
    score: number;
}

interface PageProps extends InertiaPageProps {
    submission: Submission;
    draftScores: DraftScore[];
    draftComment: string | null;
}

function JudgeReviewPage() {
  const { t } = useTranslation();

  const {
      submission,
      draftScores,
      draftComment,
  } = usePage<PageProps>().props;

  const [criteria, setCriteria] = useState(
      submission.criteria.map((criterion) => {

          const draftScore = draftScores.find(
              (score) =>
                  score.criterion_id === criterion.id
          );

          return {
              ...criterion,
              score: draftScore?.score ?? 0,
          };
      })
  );

  const { data, setData, processing } = useForm({
      submission_id: submission.id,
      comment: draftComment ?? "",
  });

  const totalScore = criteria.reduce(
    (sum, c) => sum + c.score,
    0
  );

  const maxTotal = criteria.reduce(
    (sum, c) => sum + c.maxScore,
    0
  );

  const handleSubmit = () => {
    router.post(
      route("judge.submit-score"),
      {
        submission_id: submission.id,
        comment: data.comment,
        max_total: maxTotal,
        total_score: totalScore,
        scores: criteria.map((criterion) => ({
          criterion_id: criterion.id,
          score: criterion.score,
        })),
      },
      {
        preserveScroll: true,
      }
    );
  };

  const handleSaveDraft = () => {
    router.post(
      route("judge.save-draft"),
      {
        submission_id: submission.id,
        comment: data.comment,
        max_total: maxTotal,
        total_score: totalScore,
        scores: criteria.map((criterion) => ({
          criterion_id: criterion.id,
          score: criterion.score,
        })),
      },
      {
        preserveScroll: true,
      }
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Head title={t('judge.judgeReview.evaluateSubmissionReviewEntry')} />
      <Navbar />

      <div className="flex flex-col lg:flex-row flex-1 min-w-0">
        <DashboardSidebar />

        <main className="flex-1 overflow-auto min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 min-w-0">
            <Button
              variant="ghost"
              className="mb-4 cursor-pointer"
              onClick={() =>
                router.visit(
                  route("judge.competitions")
                )
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('judge.judgeReview.backToCompetitions')}</Button>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              {/* Submission Details */}

              <Card>
                <CardHeader>
                  <CardTitle>
                    {t('judge.judgeReview.submissionDetails')}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('judge.judgeReview.competition')}</p>

                    <p className="font-medium">
                      {submission.competitionTitle}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('judge.judgeReview.submissionTitle')}</p>

                    <p className="font-medium">
                      {submission.title}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Participant
                    </p>

                    <p className="font-medium">
                      {submission.participantName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('judge.judgeReview.description')}</p>

                    <p>
                      {submission.description ??
                        "No description provided."}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {t('judge.judgeReview.submittedFiles')}</p>

                    {submission.files?.length > 0 ? (
                      <div className="space-y-2">
                        {submission.files.map((file: SubmissionFile) => (
                          <div
                            key={file.id}
                            className="rounded-md border p-3"
                          >
                            <a
                              href={route("submissions.download", file.id)}
                              className="font-medium text-primary hover:underline"
                            >
                              {file.file_name}
                            </a>

                            <p className="text-sm text-muted-foreground">
                              {t('judge.judgeReview.size')}{(file.file_size / 1024).toFixed(2)} {t('judge.judgeReview.kb')}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>{t('judge.judgeReview.noFilesSubmitted')}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Scoring Panel */}

              <Card>
                <CardHeader>
                  <CardTitle>
                    {t('judge.judgeReview.scoreSubmission')}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  {criteria.map(
                    (criterion: any, index: number) => (
                      <div key={criterion.id}>
                        <div className="mb-2 flex items-center justify-between">
                          <Label>
                            {criterion.name}
                          </Label>

                          <span className="font-semibold text-primary">
                            {criterion.score} /{" "}
                            {criterion.maxScore}
                          </span>
                        </div>

                        <Slider
                          value={[
                            criterion.score,
                          ]}
                          max={
                            criterion.maxScore
                          }
                          step={1}
                          onValueChange={(
                            value: number[]
                          ) => {
                            const updated = [
                              ...criteria,
                            ];

                            updated[
                              index
                            ].score =
                              value[0];

                            setCriteria(
                              updated
                            );
                          }}
                          className="cursor-pointer"
                        />
                      </div>
                    )
                  )}

                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {t('judge.judgeReview.totalScore')}</span>

                      <span className="text-xl font-bold text-primary">
                        {totalScore} / {maxTotal}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label>
                      {t('judge.judgeReview.evaluationComments')}</Label>

                    <Textarea
                      value={data.comment}
                      onChange={(e) => setData("comment", e.target.value)}
                      placeholder={t('judge.judgeReview.provideConstructiveFeedback')}
                      className="mt-2 min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={handleSaveDraft}
                        disabled={processing}
                    >
                        {processing ? "Saving..." : "Save Draft"}
                    </Button>

                    <Button
                        className="cursor-pointer"
                        onClick={handleSubmit}
                        disabled={processing}
                    >
                        {processing
                            ? "Submitting..."
                            : "Lock & Submit Score"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default JudgeReviewPage;