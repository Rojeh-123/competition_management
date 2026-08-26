import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Globe } from 'lucide-react';
import { Footer, Navbar, PageHeader } from '@/components/layout';
import { route } from "ziggy-js";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

function ProfilePage() {
  type PageProps = {
    numberOfJoinedCompetitions: number;
    numberOfMedals: number;
    rank: number;
    auth: {
      user: {
        id: number;
        name: string;
        email: string;
        role: string;
      } | null;
    };
    shownUser: {
      id: number;
      username: string;
      full_name: string;
      email: string;
      role: string;
      country: string;
      image: string | null;
      bio: string | null;

      submissions: {
        id: number;
        title: string;
        scores_avg_score: number | null;

        competition: {
          id: number;
          title: string;
        };
      }[];

      badges: {
        id: number;
        name: string;
        icon: string | null;
        points: number;
        pivot: {
          count: number;
          first_earned_at: string | null;
          last_earned_at: string | null;
        };
      }[];
    };
    errors: Record<string, string>;
  };

  const { shownUser, errors, auth, numberOfJoinedCompetitions, numberOfMedals, rank } = usePage<PageProps>().props;
  const [openDelete, setOpenDelete] = useState(false);
  const [password, setPassword] = useState("");

  console.log(shownUser.badges);

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
      onFinish: () => {
      },
    });
  };
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Head title="My Profile – Public Portfolio" />
      <Navbar />
      <main className="flex-1">
        <div className="p-6">
          <PageHeader
            title="My Profile"
            description="Your public portfolio and achievements"
            actions={
              auth.user?.id === shownUser?.id ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => router.visit(route("edit-profile"))}
                  >
                    Edit Profile
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => setOpenDelete(true)}
                  >
                    Delete Profile
                  </Button>
                </div>
              ) : null
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-20 w-20 rounded-full overflow-hidden bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mb-4">
                    {shownUser.image ? (
                      <img
                        src={`/competition_management/public/storage/${shownUser.image}`}
                        alt={shownUser.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      shownUser.full_name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <h3 className="text-lg font-semibold">
                    {shownUser.full_name}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {shownUser.bio || "No biography provided."}
                  </p>

                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    {shownUser.country || "Not specified"}
                  </div>
                </div>

                {/* Personal Information */}
                <div className="mt-6 border-t pt-6 grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="font-medium">{shownUser.full_name}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Username</p>
                    <p className="font-medium">@{shownUser.username}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium break-all">{shownUser.email}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p className="font-medium capitalize">{shownUser.role}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Country</p>
                    <p className="font-medium">
                      {shownUser.country || "Not specified"}
                    </p>
                  </div>

                  {auth.user?.role === "admin" && (
                    <div>
                      <p className="text-xs text-muted-foreground">User ID</p>
                      <p className="font-medium">#{shownUser.id}</p>
                    </div>
                  )}

                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Biography</p>
                    <p className="font-medium">
                      {shownUser.bio || "No biography provided."}
                    </p>
                  </div>

                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t text-center">
                  <div>
                    <p className="text-lg font-bold">
                      {numberOfJoinedCompetitions}
                    </p>
                    <p className="text-xs text-muted-foreground">Competitions</p>
                  </div>

                  <div>
                    <p className="text-lg font-bold">{numberOfMedals}</p>
                    <p className="text-xs text-muted-foreground">Medals</p>
                  </div>

                  <div>
                    <p className="text-lg font-bold">#{rank}</p>
                    <p className="text-xs text-muted-foreground">Rank</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Achievements & Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  {shownUser.badges.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-4 gap-y-6">
                      {shownUser.badges.map((badge) => (
                        <div
                          key={badge.id}
                          className="group flex flex-col items-center text-center gap-2"
                          title={`${badge.name} · ${badge.points} pts each`}
                        >
                          <div className="relative transition-transform duration-200 ease-out group-hover:-translate-y-1">
                            {badge.icon ? (
                              <div className="h-20 w-20 rounded-full overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                                <img
                                  src={`/competition_management/public/storage/${badge.icon}`}
                                  alt={badge.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
                                {badge.name.charAt(0)}
                              </div>
                            )}

                            {badge.pivot.count > 1 && (
                              <span className="absolute -bottom-1 -right-1 h-6 min-w-6 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center ring-2 ring-background shadow">
                                ×{badge.pivot.count}
                              </span>
                            )}
                          </div>

                          <div>
                            <p className="text-xs font-semibold leading-tight">
                              {badge.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {badge.points * badge.pivot.count} pts
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No badges earned yet.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Recent Submissions</CardTitle></CardHeader>
                <CardContent>
                  <ScrollArea className="h-120 pr-4">
                    <div className="space-y-3">
                      {shownUser.submissions.length > 0 ? (
                        shownUser.submissions.map((submission) => (
                          <div
                            key={submission.id}
                            className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />

                              <div>
                                <p className="text-sm font-medium">
                                  {submission.title}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {submission.competition.title}
                                </p>
                              </div>
                            </div>

                            {submission.scores_avg_score !== null && (
                              <Badge variant="secondary">
                                {Number(submission.scores_avg_score).toFixed(1)} pts
                              </Badge>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                          No submissions yet.
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
        <DialogContent className="sm:max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Delete Profile</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            Please enter your password to confirm. This action cannot be undone.
          </p>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive mt-2 font-semibold">
              {errors.password}
            </p>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={password.trim().length < 8}
            >
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProfilePage;
