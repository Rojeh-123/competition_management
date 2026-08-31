import { useTranslation } from '@/lib/i18n';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Pencil } from "lucide-react";
import { PageHeader, Navbar, Footer, DashboardSidebar } from "@/components/layout";
import { Head, usePage, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type Category = {
    id: number;
    name: string;
    description: string;
    competitionCount: number;
};

type PageProps = {
    categories: Category[];
};

export default function ManageCategoriesPage() {
  const { t } = useTranslation();

    const { categories } = usePage<PageProps>().props;

    const [newCategory, setNewCategory] = useState({
        name: "",
        description: "",
    });

    const [showEditDialog, setShowEditDialog] = useState(false);

    const [editingCategory, setEditingCategory] = useState({
        id: 0,
        name: "",
        description: "",
    });

    const addCategory = () => {
        router.post(
            route("admin.categories.store"),
            newCategory,
            {
                preserveScroll: true,
                onSuccess: () =>
                    setNewCategory({
                        name: "",
                        description: "",
                    }),
            }
        );
    };

    const deleteCategory = (id: number) => {
        router.delete(route("admin.categories.destroy", id), {
            preserveScroll: true,
        });
    };

    const openEditDialog = (category: Category) => {
        setEditingCategory({
            id: category.id,
            name: category.name,
            description: category.description,
        });

        setShowEditDialog(true);
    };

    const updateCategory = () => {
        router.put(
            route("admin.categories.update", editingCategory.id),
            {
                name: editingCategory.name,
                description: editingCategory.description,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowEditDialog(false);
                },
            }
        );
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Head title={t('admin.manageCategories.manageCategoriesCompetitionCategories')} />
            <Navbar />

            <div className="flex flex-col lg:flex-row flex-1 min-w-0">
                <DashboardSidebar />

                <main className="flex-1 overflow-auto min-w-0">
                    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
                        <PageHeader
                            title={t('admin.manageCategories.manageCategories')}
                            description={t('admin.manageCategories.addEditOrRemoveCompetition')}
                        />

                        <Card className="max-w-2xl mb-6">
                            <CardContent className="pt-6 space-y-3">
                                <Input
                                    placeholder={t('admin.manageCategories.categoryName')}
                                    value={newCategory.name}
                                    onChange={(e) =>
                                        setNewCategory({
                                            ...newCategory,
                                            name: e.target.value,
                                        })
                                    }
                                />

                                <Input
                                    placeholder={t('admin.manageCategories.description')}
                                    value={newCategory.description}
                                    onChange={(e) =>
                                        setNewCategory({
                                            ...newCategory,
                                            description: e.target.value,
                                        })
                                    }
                                />

                                <Button
                                    onClick={addCategory}
                                    className="cursor-pointer"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('admin.manageCategories.addCategory')}</Button>
                            </CardContent>
                        </Card>

                        <div className="border rounded-lg overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-4 py-3 text-left">{t('common.category')}</th>
                                        <th className="px-4 py-3 text-left">{t('admin.manageCategories.description')}</th>
                                        <th className="px-4 py-3 text-left">
                                            {t('nav.competitions')}</th>
                                        <th className="px-4 py-3 text-left">
                                            {t('admin.manageCategories.actions')}</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {categories.map((cat) => (
                                        <tr
                                            key={cat.id}
                                            className="border-t hover:bg-muted/50"
                                        >
                                            <td className="px-6 py-3 font-medium">
                                                {cat.name}
                                            </td>

                                            <td className="px-6 py-3 text-muted-foreground">
                                                {cat.description}
                                            </td>

                                            <td className="px-6 py-3 text-muted-foreground">
                                                {cat.competitionCount}
                                            </td>

                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="cursor-pointer"
                                                        onClick={() => openEditDialog(cat)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="cursor-pointer text-destructive hover:text-destructive"
                                                        onClick={() => deleteCategory(cat.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{t('admin.manageCategories.editCategory')}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <Input
                            placeholder={t('admin.manageCategories.categoryName')}
                            value={editingCategory.name}
                            onChange={(e) =>
                                setEditingCategory({
                                    ...editingCategory,
                                    name: e.target.value,
                                })
                            }
                        />

                        <Input
                            placeholder={t('admin.manageCategories.description')}
                            value={editingCategory.description}
                            onChange={(e) =>
                                setEditingCategory({
                                    ...editingCategory,
                                    description: e.target.value,
                                })
                            }
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowEditDialog(false)}
                        >
                            {t('admin.manageCategories.cancel')}</Button>

                        <Button onClick={updateCategory}>
                            {t('admin.manageCategories.saveChanges')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
}