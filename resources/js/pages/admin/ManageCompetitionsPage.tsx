import { useTranslation } from '@/lib/i18n';
import { useState } from "react";
import { Head, usePage, useForm, router } from "@inertiajs/react";
import { route } from "ziggy-js";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PageHeader,
  Navbar,
  Footer,
  DashboardSidebar,
} from "@/components/layout";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Plus } from "lucide-react";

type Competition = {
  id: number;
  title: string;
  description: string | null;
  image: string | null;

  status:
  | "upcoming"
  | "open"
  | "submission_closed"
  | "judging"
  | "results_published"
  | "archived";

  participants_count: number;

  start_date: string;
  end_date: string;
  submission_deadline: string;

  visibility: "public" | "private";

  created_at: string;
  updated_at: string;
};

type PageProps = {
  competitions: Competition[];
};

function ManageCompetitionsPage() {
  const { t } = useTranslation();

  const { competitions = [] } = usePage<PageProps>().props;

  type CompetitionTab =
    | "all"
    | "upcoming"
    | "open"
    | "submission_closed"
    | "judging"
    | "results_published"
    | "archived";

  const [tab, setTab] = useState<CompetitionTab>("all");

  const filtered =
    tab === "all"
      ? competitions
      : competitions.filter((competition) => competition.status === tab);

  const formatStatus = (status: Competition["status"]) =>
    status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false);
  const [selectedPrivateCompetition, setSelectedPrivateCompetition] = useState(0);

  const {
    data,
    setData,
    post,
    processing,
    reset,
  } = useForm({
    username: "",
    email: "",
  });

  const handleAddParticipant = (e: React.FormEvent, competitionId: number) => {
    e.preventDefault();

    post(
      route("admin.competitions.participant.private", competitionId),
      {
        preserveScroll: true,

        onSuccess: () => {
          reset();
          setIsAddParticipantModalOpen(false);
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Head title={t('admin.manageCompetitions.manageCompetitionsCompetitionLifecycle')} />
      <Navbar />

      <div className="flex flex-col lg:flex-row flex-1 min-w-0">
        <DashboardSidebar />

        <main className="flex-1 overflow-auto min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 min-w-0">
            <PageHeader
              title={t('sidebar.manageCompetitions')}
              description={t('admin.manageCompetitions.competitionLifecycleManagement')}
              actions={
                <Button
                  className="cursor-pointer"
                  onClick={() =>
                    router.visit(
                      route("admin.competitions.create")
                    )
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('admin.manageCompetitions.createCompetition')}</Button>
              }
            />

            <Tabs
              value={tab}
              onValueChange={(value) => setTab(value as CompetitionTab)}
              className="mb-6"
            >
              <div className="overflow-x-auto pb-1 max-w-full">
                <TabsList className="inline-flex w-auto min-w-full justify-start">
                  <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
                  <TabsTrigger value="upcoming">{t('status.upcoming')}</TabsTrigger>
                  <TabsTrigger value="open">{t('status.open')}</TabsTrigger>
                  <TabsTrigger value="submission_closed">
                    {t('status.submission_closed')}</TabsTrigger>
                  <TabsTrigger value="judging">{t('status.judging')}</TabsTrigger>
                  <TabsTrigger value="results_published">
                    {t('status.results_published')}</TabsTrigger>
                  <TabsTrigger value="archived">{t('status.archived')}</TabsTrigger>
                </TabsList>
              </div>
            </Tabs>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">
                      {t('admin.manageCompetitions.competition')}</th>

                    <th className="hidden px-6 py-3 text-left font-medium sm:table-cell">
                      {t('admin.manageCompetitions.enrolled')}</th>

                    <th className="hidden px-6 py-3 text-left font-medium md:table-cell">
                      {t('common.status')}</th>

                    <th className="px-6 py-3 text-center font-medium">
                      {t('admin.manageCompetitions.actions')}</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((comp) => (
                      <tr
                        key={comp.id}
                        className="border-t hover:bg-muted/50"
                      >
                        <td className="px-6 py-3 font-medium">
                          {comp.title}
                        </td>

                        <td className="hidden px-6 py-3 sm:table-cell">
                          {comp.participants_count === 0
                            ? t('admin.manageCompetitions.notApplicable')
                            : t('admin.manageCompetitions.participantsCount').replace(
                              '{count}',
                              String(comp.participants_count)
                            )}
                        </td>

                        <td className="hidden px-6 py-3 md:table-cell">
                          <Badge
                            variant="secondary"
                            className="capitalize"
                          >
                            {formatStatus(
                              comp.status
                            )}
                          </Badge>
                        </td>

                        <td className="px-6 py-3 flex gap-2 justify-center">
                          {(comp.visibility === "private" && (new Date(comp.submission_deadline) > new Date())) ? (
                            <Button
                              size="sm"
                              className="cursor-pointer btn btn-primary"
                              onClick={() => {
                                setIsAddParticipantModalOpen(true);
                                setSelectedPrivateCompetition(comp.id);
                              }}
                            >
                              {t('admin.manageCompetitions.addParticipants')}</Button>
                          ) : null}

                          <Button
                            size="sm"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() =>
                              router.visit(
                                route("admin.competitions.show", {
                                  competition: comp.id,
                                })
                              )
                            }
                          >
                            {t('admin.manageCompetitions.view')}</Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-10 text-center text-muted-foreground"
                      >
                        {t('admin.manageCompetitions.noCompetitionsFound')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <Dialog
          open={isAddParticipantModalOpen}
          onOpenChange={setIsAddParticipantModalOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t('admin.manageCompetitions.addParticipantTitle')}</DialogTitle>
            </DialogHeader>

            <form
              onSubmit={(e) => handleAddParticipant(e, selectedPrivateCompetition)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>{t('admin.manageCompetitions.usernameLabel')}</Label>
                <Input
                  value={data.username}
                  onChange={(e) =>
                    setData("username", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.manageCompetitions.emailLabel')}</Label>
                <Input
                  value={data.email}
                  onChange={(e) =>
                    setData("email", e.target.value)
                  }
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddParticipantModalOpen(false)}
                >
                  {t('admin.manageCompetitions.cancel')}</Button>
                <Button
                  type="submit"
                  disabled={processing}
                >
                  {processing
                    ? t('admin.manageCompetitions.addingParticipant')
                    : t('admin.manageCompetitions.addParticipantButton')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
}
export default ManageCompetitionsPage;