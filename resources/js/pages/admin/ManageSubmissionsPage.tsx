import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader, Navbar, Footer, DashboardSidebar } from '@/components/layout';

type Submission = {
  id: number;
  title: string;
  description: string;
  competitionId: number | null;
  status: string;
  createdAt: string | null;
  competitionTitle: string;
  participantName: string;
  participantEmail: string | null;
  versionNumber: number;
  isPublic: boolean;
};

type PageProps = {
  user: {
    id: number;
    full_name: string;
    username: string;
    email: string;
    role: string;
  };
  submissions: Submission[];
};

function ManageSubmissionsPage() {
  const { user, submissions } = usePage<PageProps>().props;
  const [tab, setTab] = useState('pending');

  const filteredSubmissions = submissions.filter((sub) => {
    if (tab === 'all') return true;
    if (tab === 'pending') return sub.status === 'pending';
    if (tab === 'approved') return sub.status === 'approved';
    if (tab === 'rejected') return sub.status === 'rejected';
    return true;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Head title="Submissions – Entry Moderation" />
      <Navbar />

      <div className="flex flex-col lg:flex-row flex-1 min-w-0">
        <DashboardSidebar />

        <main className="flex-1 overflow-auto min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 min-w-0">
            <PageHeader
              title="Manage Submissions"
              description="Review and moderate submitted entries"
            />

            <Tabs value={tab} onValueChange={setTab} className="mb-6">
              <div className="overflow-x-auto pb-1 max-w-full">
                <TabsList className="inline-flex w-auto min-w-full justify-start">
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </div>
            </Tabs>

            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">ID</th>
                    <th className="text-left px-4 py-3 font-medium">Title</th>
                    <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                      Competition
                    </th>
                    <th className="text-left px-4 py-3 font-medium hidden xl:table-cell">
                      Participant
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSubmissions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-t hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.visit(route('admin.submissions.show', sub.id))}
                    >
                      <td className="px-4 py-3 font-mono text-muted-foreground whitespace-nowrap">
                        #SUB-{String(sub.id).padStart(3, '0')}
                      </td>

                      <td className="px-4 py-3 font-medium min-w-[160px]">
                        <div>{sub.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{sub.description}</div>
                      </td>

                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                        {sub.competitionTitle}
                      </td>

                      <td className="px-4 py-3 hidden xl:table-cell text-muted-foreground whitespace-nowrap">
                        <div>{sub.participantName}</div>
                        {sub.participantEmail && <div className="text-xs">{sub.participantEmail}</div>}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge
                          className={`text-xs capitalize ${
                            sub.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : sub.status === 'rejected'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              : sub.status === 'judging'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}
                        >
                          {sub.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.visit(route('admin.submissions.show', sub.id));
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredSubmissions.length === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                No submissions match the selected filter for {user.full_name || user.username}.
              </p>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default ManageSubmissionsPage;