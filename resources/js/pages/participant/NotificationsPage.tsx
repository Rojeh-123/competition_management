import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Trophy, FileText, Award, Bell, Info, CheckCircle2, AlertTriangle, Megaphone, MailOpen, Mail, Trash2, X } from 'lucide-react';
import { PageHeader, DashboardSidebar, Navbar, Footer } from '@/components/layout';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { cn } from '@/lib/utils';

type Notification = {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  priority: string | number;
  link: string | null;
  is_read: boolean;
  image: string | null;
  created_at: string;
};

const typeIcons: Record<string, React.ElementType> = {
  system: Bell,
  competition: Trophy,
  submission: FileText,
  result: Award,
  announcement: Megaphone,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
};

const priorityMap: Record<string, { label: string; dot: string; text: string }> = {
  '1': { label: 'Low', dot: 'bg-slate-400', text: 'text-muted-foreground' },
  '2': { label: 'Medium', dot: 'bg-amber-500', text: 'text-amber-600' },
  '3': { label: 'High', dot: 'bg-red-500', text: 'text-red-600' },
};

function getPriority(priority: string | number) {
  return priorityMap[String(priority)] ?? priorityMap['1'];
}

function NotificationsPage() {
  const { notifications } = usePage<{ notifications: Notification[] }>().props;
  const [items, setItems] = useState(notifications);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const unreadCount = items.filter((n) => !n.is_read).length;
  const selectedCount = selectedIds.size;
  const isSelecting = selectedCount > 0;

  // Unread first, read at the bottom. Order within each group is preserved
  // as sent from the backend (priority, then recency).
  const sortedItems = [...items].sort((a, b) => Number(a.is_read) - Number(b.is_read));

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedItems.map((n) => n.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const toggleRead = (notif: Notification) => {
    const nextRead = !notif.is_read;

    setItems((prev) => prev.map((n) => (n.id === notif.id ? { ...n, is_read: nextRead } : n)));

    router.patch(
      route(nextRead ? 'notifications.read' : 'notifications.unread', notif.id),
      {},
      { preserveScroll: true, preserveState: true }
    );
  };

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));

    router.patch(route('notifications.readAll'), {}, {
      preserveScroll: true,
      preserveState: true,
    });
  };

  const deleteNotification = (id: number) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    router.delete(route('notifications.destroy', id), {
      preserveScroll: true,
      preserveState: true,
    });
  };

  const bulkMarkRead = (read: boolean) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setItems((prev) => prev.map((n) => (selectedIds.has(n.id) ? { ...n, is_read: read } : n)));

    router.patch(
      route(read ? 'notifications.readMany' : 'notifications.unreadMany'),
      { ids },
      {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => clearSelection(),
      }
    );
  };

  const bulkDelete = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setItems((prev) => prev.filter((n) => !selectedIds.has(n.id)));

    router.delete(route('notifications.destroyMany'), {
      data: { ids },
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => clearSelection(),
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head title="Notifications – See Latest Updates" />
      <Navbar />
      <div className="flex flex-col lg:flex-row flex-1 min-w-0">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 min-w-0">
            <PageHeader
              title="Notifications"
              description="Stay updated on your competition activity"
              actions={
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  disabled={unreadCount === 0}
                  onClick={markAllRead}
                >
                  Mark All Read
                </Button>
              }
            />

            {sortedItems.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  You don't have any notifications yet.
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3 px-1">
                  <Checkbox
                    checked={selectedIds.size === sortedItems.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all notifications"
                  />
                  <span className="text-sm text-muted-foreground">
                    {isSelecting ? `${selectedCount} selected` : 'Select all'}
                  </span>
                </div>

                <div className="space-y-2">
                  {sortedItems.map((notif) => {
                    const Icon = typeIcons[notif.type] || Bell;
                    const priority = getPriority(notif.priority);
                    const checked = selectedIds.has(notif.id);
                    return (
                      <Card
                        key={notif.id}
                        className={cn(
                          "transition-colors",
                          !notif.is_read && "border-primary/30 bg-primary/5",
                          checked && "ring-2 ring-primary/40"
                        )}
                      >
                        <CardContent className="py-4 flex items-start gap-4">
                          <div className="pt-1.5">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggleSelected(notif.id)}
                              aria-label={`Select notification: ${notif.title}`}
                            />
                          </div>
                          <div className={cn(
                            "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                            !notif.is_read ? "bg-primary/10" : "bg-muted"
                          )}>
                            <div className={cn(
                              "h-9 w-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden",
                              !notif.is_read ? "bg-primary/10" : "bg-muted"
                            )}>
                              {notif.image ? (
                                <img
                                  src={`/competition_management/public/storage/${notif.image}`}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Icon className={cn("h-4 w-4", !notif.is_read ? "text-primary" : "text-muted-foreground")} />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={cn("text-sm", !notif.is_read ? "font-semibold" : "font-medium")}>
                                {notif.title}
                              </p>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={cn("flex items-center gap-1 text-xs", priority.text)}>
                                  <span className={cn("h-1.5 w-1.5 rounded-full", priority.dot)} />
                                  {priority.label}
                                </span>
                                {!notif.is_read && <div className="h-2 w-2 rounded-full bg-primary" />}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-muted-foreground">
                                {new Date(notif.created_at).toLocaleString()}
                              </p>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs cursor-pointer text-muted-foreground hover:text-foreground"
                                  onClick={() => toggleRead(notif)}
                                >
                                  {notif.is_read ? (
                                    <>
                                      <Mail className="h-3.5 w-3.5 mr-1" />
                                      Mark unread
                                    </>
                                  ) : (
                                    <>
                                      <MailOpen className="h-3.5 w-3.5 mr-1" />
                                      Mark read
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs cursor-pointer text-muted-foreground hover:text-red-600"
                                  onClick={() => deleteNotification(notif.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {isSelecting && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-3 rounded-full border bg-background shadow-lg px-4 py-2">
            <span className="text-sm font-medium px-1">{selectedCount} selected</span>
            <div className="h-5 w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs cursor-pointer"
              onClick={() => bulkMarkRead(true)}
            >
              <MailOpen className="h-3.5 w-3.5 mr-1" />
              Mark As read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs cursor-pointer"
              onClick={() => bulkMarkRead(false)}
            >
              <Mail className="h-3.5 w-3.5 mr-1" />
              Mark As unread
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs cursor-pointer text-red-600 hover:text-red-700"
              onClick={bulkDelete}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
            <div className="h-5 w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 cursor-pointer"
              onClick={clearSelection}
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default NotificationsPage;