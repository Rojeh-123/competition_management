import { Head, usePage, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, XCircle, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar, Footer, DashboardSidebar, PageHeader } from '@/components/layout';
import { route } from 'ziggy-js';
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type FileItem = {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string | null;
  fileSize: number | null;
};

type Criterion = {
  id: number;
  name: string;
  maxScore: number;
  weight: number;
};

type Score = {
  id: number;
  judgeName: string;
  score: number;
  feedback: string | null;
};

type Submission = {
  id: number;
  title: string;
  description: string;
  status: string;
  competitionId: number | null;
  competitionTitle: string;
  competitionRules: string;
  participantId: number | null;
  participantName: string;
  participantEmail: string | null;
  participantPastSubmissions: number;
  categoryId: number | null;
  categoryName: string;
  versionNumber: number;
  isPublic: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  files: FileItem[];
  criteria: Criterion[];
  scores: Score[];
};

type PageProps = {
  submission: Submission;
  flash?: {
    success?: string;
  };
};

export default function SubmissionReviewPage() {
  const { submission, flash } = usePage<PageProps>().props;

  const handleApprove = () => {
    router.post(route('admin.submissions.approve', submission.id));
  };

  const handleReject = (rejectReason: string) => {
    router.post(route('admin.submissions.reject', submission.id), {
      reason: rejectReason,
    });
  };

  const handleRemove = () => {
    router.delete(route('admin.submissions.destroy', submission.id));
  };

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const confirmReject = () => {
    handleReject(rejectReason);
    setRejectReason("");
    setRejectModalOpen(false);
  };

  const handleReturn = () => {
    router.post(route('admin.submissions.return', submission.id));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Head title="Submission Review – Moderation" />
      <Navbar />

      <div className="flex flex-col lg:flex-row flex-1 min-w-0">
        <DashboardSidebar />

        <main className="flex-1 overflow-auto min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <PageHeader
              title="Submission Review"
              description="Moderate the submission and review its context"
            />

            <Button variant="outline" onClick={() => router.visit(route('admin.submissions'))}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>

          {flash?.success && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {flash.success}
            </div>
          )}

          <Card>
            <CardContent className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold">{submission.title}</h2>
                <p className="text-sm text-muted-foreground">Submission #{submission.id}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge className="w-fit capitalize">
                  {submission.status}
                </Badge>

                {submission.status !== "approved" && submission.status !== "rejected" && (
                  <>
                    <Button size="sm" onClick={handleApprove}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRejectModalOpen(true)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </>
                )}

                {(submission.status === "approved" || submission.status === "rejected") && (
                  <Button size="sm" variant="outline" onClick={handleReturn}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Return to Pending
                  </Button>
                )}

                {submission.status !== "removed" && (
                  <Button size="sm" variant="destructive" onClick={handleRemove}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Submission content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p><span className="font-medium">Description:</span> {submission.description}</p>
                <div>
                  <p className="font-medium">Uploaded files</p>
                  {submission.files.length > 0 ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                      {submission.files.map((file) => (
                        <li key={file.id}>
                          <a href={route("submissions.download", file.id)}>
                              {file.fileName}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-muted-foreground">No files were attached.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competition context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p><span className="font-medium">Competition:</span> {submission.competitionTitle}</p>
                <p><span className="font-medium">Rules:</span> {submission.competitionRules}</p>
                <div>
                  <p className="font-medium">Scoring criteria</p>
                  {submission.criteria.length > 0 ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                      {submission.criteria.map((criterion) => (
                        <li key={criterion.id}>{criterion.name} — max {criterion.maxScore} (weight {criterion.weight})</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-muted-foreground">No scoring criteria have been defined.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Participant info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p><span className="font-medium">Name:</span> {submission.participantName}</p>
                {submission.participantEmail && <p><span className="font-medium">Email:</span> {submission.participantEmail}</p>}
                <p><span className="font-medium">Past submissions:</span> {submission.participantPastSubmissions}</p>
                <p><span className="font-medium">Category:</span> {submission.categoryName}</p>
                <p><span className="font-medium">Version:</span> {submission.versionNumber}</p>
                <p><span className="font-medium">Public:</span> {submission.isPublic ? 'Yes' : 'No'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Moderation timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p><span className="font-medium">Created:</span> {submission.createdAt ?? 'Unknown'}</p>
                <p><span className="font-medium">Updated:</span> {submission.updatedAt ?? 'Unknown'}</p>
                <p className="text-muted-foreground">Status changes and moderation actions are tracked here for future review.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this submission.
            </p>

            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              disabled={!rejectReason.trim()}
              onClick={confirmReject}
            >
              Reject Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}