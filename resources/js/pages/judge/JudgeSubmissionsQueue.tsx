import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader, Navbar, Footer, DashboardSidebar } from '@/components/layout';
import { route } from 'ziggy-js';

type Submission = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  createdAt: string | null;
  participantName: string;
};

type PageProps = {
  competitionTitle: string;
  submissions: Submission[];
};

function JudgeSubmissionsQueue() {
  const { t } = useTranslation();

  const { competitionTitle, submissions } = usePage<PageProps>().props;
  const [filter, setFilter] = useState('all');

  const queueSubmissions = [...submissions].sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));
  const visibleSubmissions = filter === 'newest'
    ? queueSubmissions.reverse()
    : queueSubmissions;

  return (
    <div className="flex min-h-screen flex-col">
      <Head title={t('judge.judgeSubmissionsQueue.submissionsQueueEvaluationEntries')} />
      <Navbar />
      <div className="flex flex-col lg:flex-row flex-1 min-w-0">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 min-w-0">
            <PageHeader
              title={t('judge.judgeSubmissionsQueue.submissionsQueue')}
              description={`Approved entries for ${competitionTitle}`}
              actions={
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="oldest">{t('judge.judgeSubmissionsQueue.oldestFirst')}</SelectItem>
                    <SelectItem value="newest">{t('judge.judgeSubmissionsQueue.newestFirst')}</SelectItem>
                  </SelectContent>
                </Select>
              }
            />

            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">{t('judge.judgeSubmissionsQueue.entryId')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('judge.judgeSubmissionsQueue.title')}</th>
                    <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Participant</th>
                    <th className="text-left px-4 py-3 font-medium">{t('judge.judgeSubmissionsQueue.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSubmissions.map((sub) => (
                    <tr key={sub.id} className="border-t hover:bg-muted/50">
                      <td className="px-4 py-3 font-mono text-muted-foreground whitespace-nowrap">{t('judge.judgeSubmissionsQueue.sub')}{String(sub.id).padStart(3, '0')}</td>
                      <td className="px-4 py-3 font-medium">{sub.title}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{sub.participantName}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><Button size="sm" className="cursor-pointer" onClick={() => router.visit(route('judge.review', { id: sub.id }))}>{t('judge.judgeSubmissionsQueue.evaluate')}</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default JudgeSubmissionsQueue;