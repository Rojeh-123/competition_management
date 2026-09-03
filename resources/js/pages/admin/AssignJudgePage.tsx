import { useTranslation } from '@/lib/i18n';
import { useState, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { router } from "@inertiajs/react";
import {
  PageHeader,
  Navbar,
  Footer,
  DashboardSidebar,
} from '@/components/layout';

import {
  Search,
  Trophy,
  Users,
  CheckCircle2,
} from "lucide-react";

type User = {
  id: number;
  image: string;
  full_name: string;
  username: string;
  email: string;
  role: string;
  country: string;
  account_status: string;
  age: number;
  bio: string;
};

type Competition = {
  id: number;
  title: string;
  category: string;
  visibility: "public" | "private";
  status: string;
  submissions: number;
  assignedJudges: number;
};

function AssignJudgePage() {
  const { t } = useTranslation();

  const { judge, competitions } = usePage<{
    judge: User;
    competitions: Competition[];
  }>().props;
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const filteredCompetitions = useMemo(() => {
    return competitions.filter(
      (competition) =>
        competition.title.toLowerCase().includes(search.toLowerCase()) ||
        competition.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [competitions, search]);

  const toggleCompetition = (id: number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const handleAssign = () => {
    router.post(
      route("admin.judges.assign.store", { user: judge.id }),
      {
        competitions: selected,
      }
    );
  };

  const { totalAssignedSubmissions, totalAssignedJudges } = useMemo(() => {
    return selected.reduce(
      (acc, id) => {
        const comp = competitions.find((c) => c.id === id);
        if (!comp) return acc;

        acc.totalAssignedSubmissions += comp.submissions;
        acc.totalAssignedJudges += comp.assignedJudges;

        return acc;
      },
      { totalAssignedSubmissions: 0, totalAssignedJudges: 0 }
    );
  }, [selected, competitions]);

  const estimatedWorkload =
    totalAssignedSubmissions / Math.max(totalAssignedJudges + 1, 1);

  return (
    <div className="flex min-h-screen flex-col">
      <Head title={t('admin.assignJudge.assignJudgeCompetitionAssignments')} />
      <Navbar />

      <div className="flex flex-col lg:flex-row flex-1 min-w-0">
        <DashboardSidebar />

        <main className="flex-1 overflow-auto min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 min-w-0">
            <PageHeader
              title={t('admin.assignJudge.assignJudge')}
              description={t('admin.assignJudge.assignThisJudgeToOne')}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* LEFT */}
              <div className="lg:col-span-2 space-y-4">
                {/* Judge */}
                <Card>
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-xl font-bold">
                      {judge.image ? (
                        <img
                          src={`/competition_management/public/storage/${judge.image}`}
                          alt={judge.full_name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        judge.full_name.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {judge.full_name}
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        {judge.email}
                      </p>

                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">
                          {judge.bio || t('admin.assignJudge.judgeFallbackLabel')}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                  <Input
                    className="pl-10"
                    placeholder={t('common.searchCompetitions')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Competition List */}
                <ScrollArea className="h-[500px] rounded-md border">
                  <div className="space-y-3 p-4">
                    {filteredCompetitions.map((competition) => (
                      <Card
                        key={competition.id}
                        className="cursor-pointer hover:border-primary transition"
                        onClick={() => toggleCompetition(competition.id)}
                      >
                        <CardContent className="flex items-center justify-between p-5">
                          <div className="flex items-center gap-4">
                            <Checkbox
                              checked={selected.includes(competition.id)}
                              onCheckedChange={() =>
                                toggleCompetition(competition.id)
                              }
                            />

                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Trophy className="h-6 w-6 text-primary" />
                            </div>

                            <div>
                              <h4 className="font-medium">
                                {competition.title}
                              </h4>

                              <div className="flex gap-2 mt-2">
                                <Badge variant="secondary">
                                  {competition.category}
                                </Badge>

                                <Badge
                                  variant={
                                    competition.visibility === "public"
                                      ? "default"
                                      : "outline"
                                  }
                                >
                                  {competition.visibility}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="text-right text-sm text-muted-foreground">
                            <div>{competition.submissions} {t('sidebar.submissions')}</div>
                            <div>{competition.assignedJudges} {t('admin.assignJudge.judges')}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* RIGHT */}
              <div>
                <Card className="sticky top-6">
                  <CardContent className="space-y-5 p-5">
                    <h3 className="font-semibold">
                      {t('admin.assignJudge.assignmentSummary')}</h3>

                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />

                      <div>
                        <div className="text-2xl font-bold">
                          {selected.length}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          {t('admin.assignJudge.selectedCompetitions')}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {selected.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          {t('admin.assignJudge.noCompetitionsSelected')}</p>
                      ) : (
                        selected.map((id) => {
                          const competition = competitions.find(
                            (c) => c.id === id
                          );

                          return (
                            <div
                              key={id}
                              className="rounded-md border p-2 text-sm"
                            >
                              {competition?.title}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="rounded-lg bg-muted p-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />

                        <span className="text-sm font-medium">
                          {t('admin.assignJudge.estimatedWorkload')}</span>
                      </div>

                      <p className="text-2xl font-bold mt-2">
                        {estimatedWorkload.toFixed(1)}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {t('admin.assignJudge.approximateSubmissionsToReview')}</p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => router.visit(route("admin.judges"))}
                      >
                        {t('admin.assignJudge.cancel')}</Button>

                      <Button
                        className="flex-1"
                        disabled={selected.length === 0}
                        onClick={handleAssign}
                      >
                        {t('admin.assignJudge.assignJudge')}</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default AssignJudgePage;