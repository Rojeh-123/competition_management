import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { CountdownTimer, PageHeader, DashboardSidebar, Navbar, Footer } from '@/components/layout';
import { route } from "ziggy-js";

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
    is_submitted: boolean;

    participants_count: number;
    submissions_count: number;

    category?: {
        id: number;
        name: string;
    };
};

type PageProps = {
    competitions: Competition[];
};

function MyCompetitionsPage() {
  const { t } = useTranslation();

  const { competitions } = usePage<PageProps>().props;
  const [tab, setTab] = useState('active');
  const activeCompetitions = competitions.filter(c => c.status === 'open');
  const evaluationCompetitions = competitions.filter(c => c.status === 'judging');

  const filtered =
      tab === 'active'
          ? activeCompetitions
          : tab === 'evaluation'
          ? evaluationCompetitions
          : competitions;

  const calculateProgress = (start: string, deadline: string) => {
      const startTime = new Date(start).getTime();
      const endTime = new Date(deadline).getTime();
      const now = Date.now();

      if (now <= startTime) return 0;
      if (now >= endTime) return 100;

      return Math.round(((now - startTime) / (endTime - startTime)) * 100);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head title={t('participant.myCompetitions.myCompetitionsDiscoverYourCompetitions')} />
      <Navbar />
      <div className="flex flex-col lg:flex-row flex-1 min-w-0">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 min-w-0">
            <PageHeader title={t('sidebar.myCompetitions')} description={t('participant.myCompetitions.trackYourEnrolledCompetitionsAnd')} />

            <Tabs value={tab} onValueChange={setTab} className="mb-6">
                <div className="overflow-x-auto pb-1 max-w-full">
                  <TabsList className="inline-flex w-auto min-w-full justify-start">
                    <TabsTrigger value="active">
                        {t('participant.myCompetitions.active')}{activeCompetitions.length})
                    </TabsTrigger>

                    <TabsTrigger value="evaluation">
                        {t('participant.myCompetitions.underEvaluation')}{evaluationCompetitions.length})
                    </TabsTrigger>

                    <TabsTrigger value="all">
                        {t('participant.myCompetitions.all')}{competitions.length})
                    </TabsTrigger>
                  </TabsList>
                </div>
            </Tabs>

            <div className="space-y-4">
              {filtered.map((comp) => {
                  const progress = calculateProgress(
                      comp.start_date,
                      comp.submission_deadline
                  );

                  return (
                      <Card key={comp.id} onClick={() => router.visit(route("competitions.show", { id: comp.id }))} className="cursor-pointer hover:shadow-lg transition-shadow">
                          <CardContent className="py-5">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div>
                                      <h3 className="font-semibold">{comp.title}</h3>
                                      <p className="text-sm text-muted-foreground mt-1">
                                          {t('participant.myCompetitions.deadline')}{" "}
                                          <CountdownTimer deadline={comp.submission_deadline} />
                                      </p>
                                  </div>

                                  <div className="flex items-center gap-2">
                                      {(comp.status === "open" && !comp.is_submitted) && (
                                          <Button
                                              size="sm"
                                              className="cursor-pointer"
                                              onClick={(e) => {
                                                  e.stopPropagation();
                                                  router.visit(route("participant.submit", { competitionId: comp.id }));
                                              }}
                                          >
                                              {t('participant.myCompetitions.uploadEntry')}</Button>
                                      )}

                                      <Button
                                          size="sm"
                                          variant="outline"
                                          className="cursor-pointer text-destructive hover:text-destructive"
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              router.post(
                                                  route("participant.competitions.leave", {
                                                      id: comp.id,
                                                  })
                                              );
                                          }}
                                      >
                                          {t('participant.myCompetitions.leaveContest')}</Button>
                                  </div>
                              </div>

                              <div className="mt-4">
                                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                      <span>{t('participant.myCompetitions.timeProgress')}</span>
                                      <span>{progress}%</span>
                                  </div>

                                  <Progress value={progress} className="h-2" />
                              </div>
                          </CardContent>
                      </Card>
                  );
              })}
            </div>
          </div>
        </main>
      </div>
      <Footer/>
    </div>
  );
}

export default MyCompetitionsPage;