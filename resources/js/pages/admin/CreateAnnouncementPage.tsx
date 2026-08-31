import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Send,
    Users,
    AlertCircle,
    Megaphone,
    Image as ImageIcon,
    Upload,
    X,
    ArrowLeft,
} from 'lucide-react';
import { PageHeader, Navbar, Footer, DashboardSidebar } from '@/components/layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
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

function CreateAnnouncementPage() {
  const { t } = useTranslation();

    const [isDragging, setIsDragging] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        target_group: '',
        priority: '',
        title: '',
        message: '',
        image: null as File | null,
    });

    const handleImage = (file: File | undefined) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            return;
        }

        setData('image', file);

        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        handleImage(file);
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('admin.announcements.store'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                reset();
                setImagePreview(null);
            },
        });
    };

    const selectedPriority = PRIORITIES.find(
        (p) => p.value === data.priority
    );

    return (
        <div className="flex min-h-screen flex-col">
            <Head title={t('admin.createAnnouncement.createAnnouncementPlatformUpdates')} />

            <Navbar />

            <div className="flex flex-col lg:flex-row flex-1 min-w-0">
                <DashboardSidebar />

                <main className="flex-1 overflow-auto min-w-0">
                    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
                        <Link
                            href={route('admin.announcements')}
                            className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            {t('admin.createAnnouncement.backToAnnouncements')}</Link>

                        <PageHeader
                            title={t('admin.createAnnouncement.createAnnouncement')}
                            description={t('admin.createAnnouncement.broadcastAMessageToPlatform')}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                            {/* Form */}
                            <Card className="lg:col-span-3">
                                <CardContent className="pt-6">
                                    <form onSubmit={submit} className="space-y-5">

                                        {/* Target Group + Priority */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                            {/* Target Group */}
                                            <div>
                                                <Label className="flex items-center gap-1.5">
                                                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {t('admin.createAnnouncement.targetGroup')}</Label>

                                                <Select
                                                    value={data.target_group}
                                                    onValueChange={(value) =>
                                                        setData('target_group', value)
                                                    }
                                                >
                                                    <SelectTrigger className="mt-1.5">
                                                        <SelectValue placeholder={t('admin.createAnnouncement.selectAudience')} />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        {AUDIENCES.map((a) => (
                                                            <SelectItem
                                                                key={a.value}
                                                                value={a.value}
                                                            >
                                                                {a.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                {errors.target_group && (
                                                    <p className="mt-1 text-sm text-red-500">
                                                        {errors.target_group}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Priority */}
                                            <div>
                                                <Label className="flex items-center gap-1.5">
                                                    <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {t('admin.createAnnouncement.priority')}</Label>

                                                <div className="mt-1.5 grid grid-cols-3 gap-2">
                                                    {PRIORITIES.map((p) => (
                                                        <button
                                                            key={p.value}
                                                            type="button"
                                                            onClick={() =>
                                                                setData('priority', p.value)
                                                            }
                                                            className={cn(
                                                                'flex items-center justify-center gap-1.5 rounded-md border px-2 py-3 text-xs font-medium transition-colors cursor-pointer',
                                                                data.priority === p.value
                                                                    ? 'border-primary bg-primary/5 text-foreground'
                                                                    : 'border-input text-muted-foreground hover:bg-muted'
                                                            )}
                                                        >
                                                            <span
                                                                className={cn(
                                                                    'h-1.5 w-1.5 rounded-full',
                                                                    p.dot
                                                                )}
                                                            />

                                                            {p.label}
                                                        </button>
                                                    ))}
                                                </div>

                                                {errors.priority && (
                                                    <p className="mt-1 text-sm text-red-500">
                                                        {errors.priority}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <div>
                                            <Label htmlFor="title">{t('admin.createAnnouncement.title')}</Label>

                                            <Input
                                                id="title"
                                                placeholder={t('admin.createAnnouncement.announcementTitle')}
                                                className="mt-1.5"
                                                value={data.title}
                                                onChange={(e) =>
                                                    setData('title', e.target.value)
                                                }
                                            />

                                            {errors.title && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.title}
                                                </p>
                                            )}
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="message">{t('contact.message')}</Label>

                                                <span className="text-xs text-muted-foreground">
                                                    {data.message.length} {t('admin.createAnnouncement.characters')}</span>
                                            </div>

                                            <Textarea
                                                id="message"
                                                placeholder={t('admin.createAnnouncement.writeYourAnnouncementMessage')}
                                                className="mt-1.5 min-h-[160px] resize-none"
                                                value={data.message}
                                                onChange={(e) =>
                                                    setData('message', e.target.value)
                                                }
                                            />

                                            {errors.message && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Drag & Drop Image */}
                                        <div>
                                            <Label className="flex items-center gap-1.5">
                                                <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                                {t('admin.createAnnouncement.photo')}<span className="text-xs font-normal text-muted-foreground">
                                                    {t('admin.createAnnouncement.optional')}</span>
                                            </Label>

                                            <div
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    setIsDragging(true);
                                                }}
                                                onDragLeave={() => setIsDragging(false)}
                                                onDrop={handleDrop}
                                                className={cn(
                                                    'relative mt-1.5 rounded-lg border-2 border-dashed transition-colors',
                                                    isDragging
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-input hover:border-primary/50'
                                                )}
                                            >
                                                {imagePreview ? (
                                                    <div className="relative overflow-hidden rounded-lg">
                                                        <img
                                                            src={imagePreview}
                                                            alt={t('admin.createAnnouncement.announcementPreview')}
                                                            className="h-48 w-full object-cover"
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={removeImage}
                                                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/90 cursor-pointer"
                                                            aria-label="Remove image"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>

                                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2 text-xs text-white">
                                                            {data.image?.name}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <label
                                                        htmlFor="announcement-image"
                                                        className="flex min-h-40 cursor-pointer flex-col items-center justify-center px-6 py-8 text-center"
                                                    >
                                                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                                                            {isDragging ? (
                                                                <Upload className="h-5 w-5 text-primary" />
                                                            ) : (
                                                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                                            )}
                                                        </div>

                                                        <p className="text-sm font-medium">
                                                            {isDragging
                                                                ? 'Drop your image here'
                                                                : 'Drag & drop your image here'}
                                                        </p>

                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            or click to browse from your device
                                                        </p>

                                                        <p className="mt-2 text-xs text-muted-foreground">
                                                            {t('admin.createAnnouncement.pngJpgJpegWebpUp')}</p>

                                                        <Input
                                                            id="announcement-image"
                                                            type="file"
                                                            accept="image/png,image/jpeg,image/jpg,image/webp"
                                                            className="hidden"
                                                            onChange={(e) =>
                                                                handleImage(e.target.files?.[0])
                                                            }
                                                        />
                                                    </label>
                                                )}
                                            </div>

                                            {errors.image && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.image}
                                                </p>
                                            )}
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex items-center gap-3 pt-1">
                                            <Button
                                                type="submit"
                                                className="cursor-pointer"
                                                disabled={processing}
                                            >
                                                <Send className="h-4 w-4 mr-2" />

                                                {processing ? 'Sending...' : 'Broadcast'}
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    reset();
                                                    setImagePreview(null);
                                                }}
                                            >
                                                {t('admin.createAnnouncement.clear')}</Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Live Preview */}
                            <Card className="lg:col-span-2 bg-muted/30">
                                <CardContent className="pt-6">

                                    <div className="flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground">
                                        <Megaphone className="h-4 w-4" />
                                        {t('admin.createAnnouncement.preview')}</div>

                                    <div className="rounded-lg border bg-background overflow-hidden">

                                        {/* Preview Image */}
                                        {imagePreview && (
                                            <img
                                                src={imagePreview}
                                                alt={t('admin.createAnnouncement.announcementPreview')}
                                                className="h-44 w-full object-cover"
                                            />
                                        )}

                                        <div className="p-4 space-y-2">

                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="font-semibold leading-snug">
                                                    {data.title || 'Announcement title'}
                                                </h3>

                                                {selectedPriority && (
                                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                                                        <span
                                                            className={cn(
                                                                'h-1.5 w-1.5 rounded-full',
                                                                selectedPriority.dot
                                                            )}
                                                        />

                                                        {selectedPriority.label}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                {data.message ||
                                                    'Your message will appear here as you type.'}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="mt-4 text-xs text-muted-foreground">
                                        {t('admin.createAnnouncement.visibleTo')}{' '}
                                        <span className="font-medium text-foreground">
                                            {AUDIENCES.find(
                                                (a) => a.value === data.target_group
                                            )?.label ?? 'no one yet'}
                                        </span>{' '}
                                        {t('admin.createAnnouncement.onceBroadcast')}</p>

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

export default CreateAnnouncementPage;