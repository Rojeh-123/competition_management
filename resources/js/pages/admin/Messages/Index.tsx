import { useTranslation } from '@/lib/i18n';
import { Head, Link, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader, Navbar, Footer, DashboardSidebar } from "@/components/layout";
import { Mail, MailOpen, Trash2 } from "lucide-react";

interface ContactMessage {
    id: number;
    contact: string;
    subject: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedMessages {
    data: ContactMessage[];
    links: PaginationLink[];
}

interface MessagesIndexProps {
    messages: PaginatedMessages;
}

function MessagesIndex({ messages }: MessagesIndexProps) {
  const { t } = useTranslation();

    const handleDelete = (id: number) => {
        router.delete(route("admin.messages.destroy", id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={t('sidebar.messages')} />
            <div className="min-h-screen flex flex-col">
                <Navbar />

                <div className="flex flex-col lg:flex-row flex-1 min-w-0">
                    <DashboardSidebar />

                    <main className="flex-1 overflow-auto min-w-0">
                        <div className="p-4 sm:p-6 lg:p-8 min-w-0">
                            <PageHeader
                                title={t('sidebar.messages')}
                                description={t('admin.messages.index.messagesSubmittedThroughYourContact')}
                            />

                            {/* Two-column grid with spacing */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                {messages.data.length === 0 && (
                                    <p className="text-sm text-muted-foreground col-span-2">
                                        {t('admin.messages.index.noMessagesYet')}</p>
                                )}

                                {messages.data.map((msg) => (
                                    <Link key={msg.id} href={route("admin.messages.show", msg.id)}>
                                        <Card className={!msg.is_read ? "border-primary" : ""}>
                                            <CardContent className="pt-4 pb-4 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {msg.is_read ? (
                                                        <MailOpen className="h-5 w-5 text-muted-foreground shrink-0" />
                                                    ) : (
                                                        <Mail className="h-5 w-5 text-primary shrink-0" />
                                                    )}

                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-medium truncate">
                                                                {msg.subject}
                                                            </p>
                                                            {!msg.is_read && (
                                                                <Badge variant="default" className="shrink-0">
                                                                    {t('admin.messages.index.new')}</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {msg.contact} — {msg.message}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 shrink-0">
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(msg.created_at).toLocaleDateString()}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleDelete(msg.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {messages.links.length > 3 && (
                                <div className="flex flex-wrap gap-2 mt-6">
                                    {messages.links.map((link, i) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() =>
                                                link.url && router.visit(link.url, { preserveScroll: true })
                                            }
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </main>
                </div>

                <Footer />
            </div>
        </>
    );
}

export default MessagesIndex;
