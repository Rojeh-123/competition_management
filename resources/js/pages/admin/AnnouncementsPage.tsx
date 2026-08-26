import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Users, AlertCircle, Megaphone } from 'lucide-react';
import { PageHeader, Navbar, Footer, DashboardSidebar } from '@/components/layout';
import { Head, useForm } from "@inertiajs/react";
import { route } from "ziggy-js";
import { cn } from '@/lib/utils';

const PRIORITIES = [
  { value: 'low', label: 'Low', dot: 'bg-slate-400' },
  { value: 'medium', label: 'Medium', dot: 'bg-amber-500' },
  { value: 'high', label: 'High Priority', dot: 'bg-red-500' },
] as const;

const AUDIENCES = [
  { value: 'all', label: 'All Users' },
  { value: 'participants', label: 'Participants Only' },
  { value: 'judges', label: 'Judges Only' },
];

function AnnouncementsPage() {
  const { data, setData, post, processing, errors, reset } = useForm({
    target_group: '',
    priority: '',
    title: '',
    message: '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    post(route('admin.announcements.store'), {
      preserveScroll: true,
      onSuccess: () => reset(),
    });
  };

  const selectedPriority = PRIORITIES.find((p) => p.value === data.priority);

  return (
    <div className="flex min-h-screen flex-col">
      <Head title="Announcements – Platform Updates" />
      <Navbar />
      <div className="flex flex-col lg:flex-row flex-1 min-w-0">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 min-w-0">
            <PageHeader title="Announcements" description="Broadcast messages to platform users" />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Form */}
              <Card className="lg:col-span-3">
                <CardContent className="pt-6">
                  <form onSubmit={submit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          Target Group
                        </Label>
                        <Select
                          value={data.target_group}
                          onValueChange={(value) => setData('target_group', value)}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select audience" />
                          </SelectTrigger>
                          <SelectContent>
                            {AUDIENCES.map((a) => (
                              <SelectItem key={a.value} value={a.value}>
                                {a.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.target_group && (
                          <p className="mt-1 text-sm text-red-500">{errors.target_group}</p>
                        )}
                      </div>

                      <div>
                        <Label className="flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          Priority
                        </Label>
                        <div className="mt-1.5 grid grid-cols-3 gap-2">
                          {PRIORITIES.map((p) => (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => setData('priority', p.value)}
                              className={cn(
                                "flex items-center justify-center gap-1.5 rounded-md border px-2 py-3 text-xs font-medium transition-colors cursor-pointer",
                                data.priority === p.value
                                  ? "border-primary bg-primary/5 text-foreground"
                                  : "border-input text-muted-foreground hover:bg-muted"
                              )}
                            >
                              <span className={cn("h-1.5 w-1.5 rounded-full", p.dot)} />
                              {p.label}
                            </button>
                          ))}
                        </div>
                        {errors.priority && (
                          <p className="mt-1 text-sm text-red-500">{errors.priority}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Announcement title..."
                        className="mt-1.5"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="message">Message</Label>
                        <span className="text-xs text-muted-foreground">
                          {data.message.length} characters
                        </span>
                      </div>
                      <Textarea
                        id="message"
                        placeholder="Write your announcement message..."
                        className="mt-1.5 min-h-[160px] resize-none"
                        value={data.message}
                        onChange={(e) => setData('message', e.target.value)}
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <Button type="submit" className="cursor-pointer" disabled={processing}>
                        <Send className="h-4 w-4 mr-2" />
                        {processing ? 'Sending...' : 'Broadcast'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => reset()}
                      >
                        Clear
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Live preview */}
              <Card className="lg:col-span-2 bg-muted/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground">
                    <Megaphone className="h-4 w-4" />
                    Preview
                  </div>

                  <div className="rounded-lg border bg-background p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold leading-snug">
                        {data.title || 'Announcement title'}
                      </h3>
                      {selectedPriority && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                          <span className={cn("h-1.5 w-1.5 rounded-full", selectedPriority.dot)} />
                          {selectedPriority.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {data.message || 'Your message will appear here as you type.'}
                    </p>
                  </div>

                  <p className="mt-4 text-xs text-muted-foreground">
                    Visible to{' '}
                    <span className="font-medium text-foreground">
                      {AUDIENCES.find((a) => a.value === data.target_group)?.label ?? 'no one yet'}
                    </span>{' '}
                    once broadcast.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default AnnouncementsPage;