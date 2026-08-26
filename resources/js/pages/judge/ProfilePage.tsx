import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { route } from "ziggy-js";

import { Navbar, Footer, PageHeader } from "@/components/layout";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import {
  Globe,
  Eye,
  EyeOff,
  Trophy,
  ClipboardCheck,
  Clock3,
  FileCheck,
} from "lucide-react";

function JudgeProfilePage() {
  type PageProps = {
    auth: {
      user: {
        id: number;
        name: string;
        email: string;
        role: string;
      } | null;
    };

    shownJudge: {
      id: number;
      username: string;
      full_name: string;
      email: string;
      role: string;
      country: string;
      image: string | null;
      bio: string | null;

      completed_evaluations: number;
      pending_evaluations: number;

      assignments: {
        id: number;

        submissions_count: number;
        completed_reviews: number;

        competition: {
          id: number;
          title: string;
          status: string;

          category: {
            id: number;
            name: string;
          };
        };
      }[];

      reviewed_submissions: {
        id: number;

        submission: {
          id: number;
          title: string;
        };

        competition: {
          id: number;
          title: string;
        };
      }[];
    };

    errors: Record<string, string>;
  };

  const { shownJudge, auth, errors } = usePage<PageProps>().props;

  const [openDelete, setOpenDelete] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleDelete = () => {
    router.delete(route("profile.delete"), {
      data: { password },

      onSuccess: () => {
        setPassword("");
        setOpenDelete(false);
      },

      onError: () => {
        setOpenDelete(true);
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Head title="Judge Profile – Evaluation Overview" />
      <Navbar />

      <main className="flex-1 min-w-0">
        <div className="p-4 sm:p-6 lg:p-8 min-w-0">
          <PageHeader
            title="Judge Profile"
            description="Judge information, current assignments and reviewed submissions."
            actions={
              auth.user?.id === shownJudge.id ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.visit(route("edit-profile"))}
                  >
                    Edit Profile
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setOpenDelete(true)}
                  >
                    Delete Profile
                  </Button>
                </div>
              ) : null
            }
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column */}

            <Card className="lg:col-span-1">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                    {shownJudge.image ? (
                      <img
                        src={`/competition_management/public/storage/${shownJudge.image}`}
                        alt={shownJudge.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      shownJudge.full_name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <h2 className="mt-4 text-xl font-semibold">
                    {shownJudge.full_name}
                  </h2>

                  <Badge className="mt-2 capitalize">
                    {shownJudge.role}
                  </Badge>

                  <p className="mt-3 text-sm text-muted-foreground">
                    {shownJudge.bio || "No biography provided."}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    {shownJudge.country || "Not specified"}
                  </div>
                </div>

                {/* Personal Information */}

                <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-6">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Full Name
                    </p>

                    <p className="font-medium">
                      {shownJudge.full_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Username
                    </p>

                    <p className="font-medium">
                      @{shownJudge.username}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Email
                    </p>

                    <p className="break-all font-medium">
                      {shownJudge.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Role
                    </p>

                    <p className="font-medium capitalize">
                      {shownJudge.role}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Country
                    </p>

                    <p className="font-medium">
                      {shownJudge.country || "Not specified"}
                    </p>
                  </div>

                  {auth.user?.role === "admin" && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Judge ID
                      </p>

                      <p className="font-medium">
                        #{shownJudge.id}
                      </p>
                    </div>
                  )}

                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">
                      Biography
                    </p>

                    <p className="font-medium">
                      {shownJudge.bio || "No biography provided."}
                    </p>
                  </div>
                </div>

                {/* Statistics */}

                <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-6">
                  <div className="rounded-lg border p-4 text-center">
                    <Trophy className="mx-auto mb-2 h-5 w-5 text-primary" />

                    <p className="text-2xl font-bold">
                      {shownJudge.assignments.length}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Judged Competitions
                    </p>
                  </div>

                  <div className="rounded-lg border p-4 text-center">
                    <ClipboardCheck className="mx-auto mb-2 h-5 w-5 text-primary" />

                    <p className="text-2xl font-bold">
                      {shownJudge.completed_evaluations}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Completed Reviews
                    </p>
                  </div>

                  <div className="rounded-lg border p-4 text-center">
                    <Clock3 className="mx-auto mb-2 h-5 w-5 text-primary" />

                    <p className="text-2xl font-bold">
                      {shownJudge.pending_evaluations}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Pending Reviews
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column */}

            <div className="space-y-6 lg:col-span-2">

              {/* Assigned Competitions */}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Assigned Competitions
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <ScrollArea className="h-[360px] pr-4">
                    <div className="space-y-3">
                      {shownJudge.assignments.length > 0 ? (
                        shownJudge.assignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="flex items-start justify-between rounded-lg border p-4"
                          >
                            <div>
                              <p className="font-semibold">
                                {assignment.competition.title}
                              </p>

                              <p className="text-sm text-muted-foreground">
                                {assignment.competition.category.name}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                                <span>
                                  {assignment.submissions_count} submissions
                                </span>

                                <span>
                                  {assignment.completed_reviews} reviewed
                                </span>
                              </div>
                            </div>

                            <Badge className="capitalize">
                              {assignment.competition.status.replace("_", " ")}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                          No assigned competitions.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Reviewed Submissions */}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    Reviewed Submissions
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <ScrollArea className="h-[320px] pr-4">
                    <div className="space-y-3">
                      {shownJudge.reviewed_submissions.length > 0 ? (
                        shownJudge.reviewed_submissions.map((review) => (
                          <div
                            key={review.id}
                            className="rounded-lg border p-4"
                          >
                            <p className="font-medium">
                              {review.submission.title}
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              Competition: {review.competition.title}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                          No submissions reviewed yet.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Delete Profile Dialog */}

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Profile</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Please enter your password to confirm deleting your profile. This
            action cannot be undone.
          </p>

          <div className="relative mt-2">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="Enter your password"
              className="pr-10"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="font-medium text-sm text-destructive">
              {errors.password}
            </p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDelete(false)}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              disabled={password.trim().length < 8}
              onClick={handleDelete}
            >
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default JudgeProfilePage;