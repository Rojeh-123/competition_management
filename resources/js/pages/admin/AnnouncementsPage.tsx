import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';
import { PageHeader, Navbar, Footer, DashboardSidebar } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Plus, Users, Calendar, Inbox, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Priority = 'low' | 'medium' | 'high';
type PriorityRaw = '1' | '2' | '3';

const PRIORITY_STYLES: Record<Priority, { dot: string; label: string }> = {
  low: { dot: 'bg-slate-400', label: 'Low' },
  medium: { dot: 'bg-amber-500', label: 'Medium' },
  high: { dot: 'bg-red-500', label: 'High Priority' },
};

interface Announcement {
  title: string;
  message: string;
  image: string | null;
  image_path: string | null;
  priority: Priority;
  priority_raw: PriorityRaw;
  recipient_count: number;
  created_at: string;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginatedAnnouncements {
  data: Announcement[];
  links: PaginationLink[];
}

interface Props {
  announcements: PaginatedAnnouncements;
}

function AnnouncementsPage({ announcements }: Props) {
  const { t } = useTranslation();

  const items = announcements.data;
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const keyFor = (a: Announcement) =>
    `${a.title}|${a.created_at}`;

  const handleDelete = (announcement: Announcement) => {
    const confirmed = window.confirm(
      `Delete "${announcement.title}"? This will remove it for all ${announcement.recipient_count} recipient(s) and can't be undone.`
    );

    if (!confirmed) return;

    setDeletingKey(keyFor(announcement));

    router.delete(route('admin.announcements.destroy'), {
      data: {
        title: announcement.title,
        message: announcement.message,
        priority_raw: announcement.priority_raw,
        image_path: announcement.image_path,
        created_at: announcement.created_at,
      },
      preserveScroll: true,
      onFinish: () => setDeletingKey(null),
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Head title={t('admin.announcements.announcementsPlatformUpdates')} />

      <Navbar />

      <div className="flex flex-col lg:flex-row flex-1 min-w-0">
        <DashboardSidebar />

        <main className="flex-1 overflow-auto min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 min-w-0">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <PageHeader
                title={t('sidebar.announcements')}
                description={t('admin.announcements.manageBroadcastMessagesSentTo')}
              />

              <Button asChild className="cursor-pointer">
                <Link href={route('admin.announcements.create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('admin.announcements.newAnnouncement')}</Link>
              </Button>
            </div>

            {items.length === 0 ? (
              <Card className="mt-6">
                <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Inbox className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div>
                    <p className="font-medium">{t('admin.announcements.noAnnouncementsYet')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('admin.announcements.broadcastYourFirstMessageTo')}</p>
                  </div>

                  <Button asChild className="cursor-pointer mt-2">
                    <Link href={route('admin.announcements.create')}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('admin.announcements.newAnnouncement')}</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="mt-6 space-y-4">
                {items.map((announcement, index) => {
                  const priority = PRIORITY_STYLES[announcement.priority];
                  const isDeleting = deletingKey === keyFor(announcement);

                  return (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          {announcement.image && (
                            <img
                              src={announcement.image}
                              alt={announcement.title}
                              className="h-40 w-full sm:h-auto sm:w-48 object-cover shrink-0"
                            />
                          )}

                          <div className="flex-1 min-w-0 p-4 space-y-2">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <h3 className="font-semibold leading-snug">
                                {announcement.title}
                              </h3>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <span
                                    className={cn(
                                      'h-1.5 w-1.5 rounded-full',
                                      priority.dot
                                    )}
                                  />
                                  {priority.label}
                                </span>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-red-500"
                                  disabled={isDeleting}
                                  onClick={() => handleDelete(announcement)}
                                  aria-label="Delete announcement"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {announcement.message}
                            </p>

                            <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                {announcement.recipient_count} {t('admin.announcements.recipient')}{announcement.recipient_count === 1 ? '' : 's'}
                              </span>

                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(
                                  announcement.created_at
                                ).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {announcements.links.length > 3 && (
              <div className="mt-6 flex flex-wrap items-center gap-1">
                {announcements.links.map((link, index) => (
                  <Button
                    key={index}
                    variant={link.active ? 'default' : 'outline'}
                    size="sm"
                    disabled={!link.url}
                    className="cursor-pointer"
                    onClick={() => link.url && router.visit(link.url)}
                  >
                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                  </Button>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default AnnouncementsPage;