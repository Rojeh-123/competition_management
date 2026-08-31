import { useTranslation } from '@/lib/i18n';
import { Head, Link, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, Navbar, Footer, DashboardSidebar } from "@/components/layout";
import { ArrowLeft, Trash2, Mail } from "lucide-react";

interface ContactMessage {
    id: number;
    contact: string;
    subject: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

interface MessageShowProps {
    message: ContactMessage;
}

function MessageShow({ message }: MessageShowProps) {
  const { t } = useTranslation();

    const handleDelete = () => {
        router.delete(route("admin.messages.destroy", message.id));
    };

    // Decide whether "contact" looks like an email or not
    const isEmail = /\S+@\S+\.\S+/.test(message.contact);
    const replyHref = isEmail
        ? `mailto:${message.contact}?subject=Re: ${message.subject}`
        : `https://wa.me/${message.contact.replace(/\D/g, "")}`;

    return (
        <>
            <Head title={message.subject} />
            <div className="min-h-screen flex flex-col">
                <Navbar />

                <div className="flex flex-col lg:flex-row flex-1 min-w-0">
                    <DashboardSidebar />

                    <main className="flex-1 overflow-auto min-w-0">
                        {/* Full width container */}
                        <div className="p-4 sm:p-6 lg:p-8 min-w-0 w-full">
                            <Link
                                href={route("admin.messages.index")}
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                            >
                                <ArrowLeft className="h-4 w-4" /> {t('admin.messages.show.backToMessages')}</Link>

                            <PageHeader title={message.subject} />

                            <Card className="mt-6 w-full">
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                {isEmail ? "Email" : "WhatsApp Number"}
                                            </p>
                                            <a href={replyHref} className="text-sm text-muted-foreground">
                                                {message.contact}
                                            </a>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium mb-1.5">{t('contact.message')}</p>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {message.message}
                                        </p>
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        {t('admin.messages.show.received')}{new Date(message.created_at).toLocaleString()}
                                    </p>

                                    <div className="flex gap-2 pt-2">
                                        <Button variant="outline" asChild>
                                            <a href={replyHref}>
                                                {isEmail ? "Reply by Email" : "Reply via WhatsApp"}
                                            </a>
                                        </Button>
                                        <Button variant="destructive" onClick={handleDelete}>
                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>

                <Footer />
            </div>
        </>
    );
}

export default MessageShow;
