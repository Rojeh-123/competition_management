import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Filter, Search } from "lucide-react";
import { CompetitionCard, SearchBar, PageHeader } from "@/components/layout";
import { Navbar, Footer } from "@/components/layout";
import { route } from "ziggy-js";
import { useTranslation } from "@/lib/i18n";

interface Category {
    id: number;
    name: string;
}

interface Participant {
    id: number;
}

interface Competition {
    id: number;
    title: string;
    image: string | null;
    status: string;
    submission_deadline: string;
    prizeDescription: string | null;
    category: Category;
    participants: Participant[];
}

interface Props {
    competitions: Competition[];
    categories: Category[];
}

function CompetitionsPage({
    competitions,
    categories,
}: Props) {
    const { t } = useTranslation();
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const filtered = competitions.filter((c) => {
        const matchSearch =
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.category.name.toLowerCase().includes(search.toLowerCase());

        const matchCategory =
            categoryFilter === "all" ||
            c.category.name === categoryFilter;

        const matchStatus =
            statusFilter === "all" ||
            c.status === statusFilter;

        return matchSearch && matchCategory && matchStatus;
    });

    return (
        <>
            <Head title={`${t('competitions.title')} – CompeteHub`} />
            <div className="min-h-screen flex flex-col">
                <Navbar />

                <main className="flex-1">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

                        <PageHeader
                            title={t('competitions.title')}
                            description={t('competitions.description')}
                        />

                        <div className="flex flex-col lg:flex-row gap-6">

                            <aside className="lg:w-64 shrink-0">
                                <Card>

                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Filter className="h-4 w-4" />
                                            {t('common.filters')}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-4">

                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                                                {t('common.category')}
                                            </Label>

                                            <Select
                                                value={categoryFilter}
                                                onValueChange={setCategoryFilter}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('common.allCategories')} />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        {t('common.allCategories')}
                                                    </SelectItem>

                                                    {categories.map((c) => (
                                                        <SelectItem
                                                            key={c.id}
                                                            value={c.name}
                                                        >
                                                            {c.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>

                                            <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                                                {t('common.status')}
                                            </Label>

                                            <Select
                                                value={statusFilter}
                                                onValueChange={setStatusFilter}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('common.allStatus')} />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        {t('common.allStatus')}
                                                    </SelectItem>
                                                    <SelectItem value="open">
                                                        {t('status.open')}
                                                    </SelectItem>
                                                    <SelectItem value="upcoming">
                                                        {t('status.upcoming')}
                                                    </SelectItem>
                                                    <SelectItem value="judging">
                                                        {t('status.judging')}
                                                    </SelectItem>
                                                    <SelectItem value="results_published">
                                                        {t('status.results_published')}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>

                                        </div>

                                    </CardContent>

                                </Card>
                            </aside>

                            <div className="flex-1">

                                <div className="mb-6">
                                    <SearchBar
                                        value={search}
                                        onChange={setSearch}
                                        placeholder={t('common.searchCompetitions')}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                                    {filtered.map((comp) => (
                                        <CompetitionCard
                                            key={comp.id}
                                            competition={comp}
                                            onClick={() =>
                                                router.visit(
                                                    route("competitions.show", {
                                                        id: comp.id,
                                                    })
                                                )
                                            }
                                        />
                                    ))}

                                </div>

                                {filtered.length === 0 && (
                                    <div className="text-center py-16 text-muted-foreground">
                                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p className="font-medium">
                                            {t('common.noCompetitions')}
                                        </p>
                                        <p className="text-sm">
                                            {t('common.tryAdjusting')}
                                        </p>
                                    </div>
                                )}

                            </div>

                        </div>

                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}

export default CompetitionsPage;