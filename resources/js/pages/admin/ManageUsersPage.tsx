import { useTranslation } from '@/lib/i18n';
import { useEffect, useRef, useState } from 'react';
import { Head, router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    PageHeader,
    Navbar,
    Footer,
    DashboardSidebar,
    SearchBar,
} from '@/components/layout';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { COUNTRIES } from '@/lib/countries';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type User = {
    id: number;
    image: string;
    full_name: string;
    username: string;
    email: string;
    role: string;
    country: string;
    account_status: string;
    age: number;
    bio: string;
};

type PageProps = {
    usersList: User[];
};

function CountryCombobox({
    id,
    value,
    onChange,
}: {
    id?: string;
    value: string;
    onChange: (value: string) => void;
}) {
    const { t } = useTranslation();

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (open) {
            setQuery("");
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [open]);

    const filtered = COUNTRIES.filter((country) =>
        country.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="relative" ref={containerRef}>
            <Button
                id={id}
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between font-normal"
                onClick={() => setOpen((o) => !o)}
            >
                {value || t('admin.manageUsers.selectCountryPlaceholder')}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>

            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
                    <div className="border-b p-1.5">
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('auth.searchCountry')}
                            className="w-full bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                        {filtered.length === 0 && (
                            <p className="px-2 py-1.5 text-sm text-muted-foreground">
                                {t('admin.manageUsers.noCountryFound')}</p>
                        )}
                        {filtered.map((country) => (
                            <button
                                key={country}
                                type="button"
                                className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                onClick={() => {
                                    onChange(country === value ? "" : country);
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4 shrink-0",
                                        value === country ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {country}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function ManageUsersPage() {
    const { t } = useTranslation();

    const [search, setSearch] = useState('');

    const { usersList, errors } = usePage<PageProps>().props;

    const filtered = usersList.filter(
        (u) =>
            u.full_name.toLowerCase().includes(search.toLowerCase()) ||
            u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.role.toLowerCase().includes(search.toLowerCase())
    );

    const [showModifyDialog, setShowModifyDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [form, setForm] = useState<User | null>(null);

    const [showAddDialog, setShowAddDialog] = useState(false);

    const emptyUser = {
        id: 0,
        image: "",
        full_name: "",
        username: "",
        email: "",
        role: "participant",
        country: "",
        account_status: "active",
        age: 0,
        bio: "",
    };

    const [newUser, setNewUser] = useState<User>(emptyUser);
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");

    const saveUser = () => {
        if (!form) return;

        router.put(
            route("admin.users.update", form.id),
            {
                full_name: form.full_name,
                username: form.username,
                email: form.email,
                country: form.country,
                age: form.age,
                bio: form.bio,
                role: form.role,
                account_status: form.account_status,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowModifyDialog(false);
                },
            }
        );
    };

    const deleteUser = () => {
        if (!selectedUser) return;

        if (!confirm(t('admin.manageUsers.deleteConfirmation'))) {
            return;
        }

        router.delete(
            route("admin.users.destroy", selectedUser.id),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowModifyDialog(false);
                },
            }
        );
    };

    const createUser = () => {
        router.post(
            route("admin.users.store"),
            {
                full_name: newUser.full_name,
                username: newUser.username,
                email: newUser.email,
                password,
                password_confirmation: passwordConfirmation,
                country: newUser.country,
                age: newUser.age,
                bio: newUser.bio,
                role: newUser.role,
                account_status: newUser.account_status,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowAddDialog(false);
                    setNewUser(emptyUser);
                    setPassword("");
                    setPasswordConfirmation("");
                },
            }
        );
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Head title={t('admin.manageUsers.usersUserManagement')} />
            <Navbar />

            <div className="flex flex-col lg:flex-row flex-1 min-w-0">
                <DashboardSidebar />

                <main className="flex-1 overflow-auto min-w-0">
                    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
                        <PageHeader
                            title={t('sidebar.manageUsers')}
                            description={t('admin.manageUsers.userDirectoryAndRoleManagement')}
                        />

                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="max-w-md w-full">
                                <SearchBar
                                    value={search}
                                    onChange={setSearch}
                                    placeholder={t('admin.manageUsers.searchUsersByNameUsername')}
                                />
                            </div>

                            <Button
                                onClick={() => setShowAddDialog(true)}
                                className="w-full sm:w-auto"
                            >
                                {t('admin.manageUsers.addUser')}</Button>
                        </div>

                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">
                                            {t('admin.manageUsers.user')}</th>
                                        <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">
                                            {t('admin.manageUsers.roleLabel')}</th>
                                        <th className="px-4 py-3 text-left font-medium hidden md:table-cell">
                                            {t('admin.manageUsers.countryLabel')}</th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            {t('common.status')}</th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            {t('admin.manageUsers.actions')}</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filtered.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-t hover:bg-muted/50"
                                            onClick={() => router.visit(route("admin.users.show", user.id))}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-xs font-medium shrink-0">
                                                        {user.image ? (
                                                            <img
                                                                src={`/competition_management/public/storage/${user.image}`}
                                                                alt={user.full_name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            user.full_name.charAt(0).toUpperCase()
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="font-medium truncate">
                                                            {user.full_name}
                                                        </p>
                                                        <p className="text-muted-foreground text-xs truncate">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 hidden sm:table-cell">
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs capitalize"
                                                >
                                                    {user.role}
                                                </Badge>
                                            </td>

                                            <td className="text-muted-foreground px-4 py-3 hidden md:table-cell whitespace-nowrap">
                                                {user.country}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Badge
                                                    className={
                                                        user.account_status === 'active'
                                                            ? 'border-0 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50 text-xs transition-colors'
                                                            : 'border-0 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 text-xs transition-colors'
                                                    }
                                                >
                                                    {user.account_status === 'active' ? t('admin.manageUsers.active') : t('admin.manageUsers.disabled')}
                                                </Badge>
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedUser(user);
                                                        setForm({ ...user });
                                                        setShowModifyDialog(true);
                                                    }}
                                                >
                                                    {t('admin.manageUsers.modify')}</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            <Dialog open={showModifyDialog} onOpenChange={setShowModifyDialog}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    {selectedUser && (
                        <>
                            <DialogHeader className="pb-4 border-b">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-lg font-semibold">
                                        {selectedUser.image ? (
                                            <img
                                                src={`/competition_management/public/storage/${selectedUser.image}`}
                                                alt={selectedUser.full_name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            selectedUser.full_name.charAt(0).toUpperCase()
                                        )}
                                    </div>

                                    <div>
                                        <DialogTitle className="text-xl">
                                            {t('admin.manageUsers.modifyUser')}</DialogTitle>

                                        <p className="text-sm text-muted-foreground">
                                            {t('admin.manageUsers.editAccountInformationAndPermissions')}</p>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-8 py-6">

                                {/* Personal Information */}
                                <section className="space-y-4">
                                    <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                        {t('admin.manageUsers.personalInformation')}</h3>

                                    <div className="grid gap-4 md:grid-cols-2">

                                        <div className="space-y-2">
                                            <Label htmlFor="full_name">{t('admin.manageUsers.fullName')}</Label>
                                            <Input
                                                id="full_name"
                                                value={form?.full_name ?? ""}
                                                onChange={(e) =>
                                                    setForm(prev => prev && {
                                                        ...prev,
                                                        full_name: e.target.value
                                                    })
                                                }
                                            />
                                            {errors.full_name && (
                                                <p className="text-sm font-semibold text-destructive">
                                                    {errors.full_name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="username">{t('admin.manageUsers.usernameLabel')}</Label>
                                            <Input
                                                id="username"
                                                value={form?.username ?? ""}
                                                onChange={(e) =>
                                                    setForm(prev => prev && {
                                                        ...prev,
                                                        username: e.target.value
                                                    })
                                                }
                                            />
                                            {errors.username && (
                                                <p className="text-sm font-semibold text-destructive">
                                                    {errors.username}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">{t('admin.manageUsers.emailLabel')}</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={form?.email ?? ""}
                                                onChange={(e) =>
                                                    setForm(prev => prev && {
                                                        ...prev,
                                                        email: e.target.value
                                                    })
                                                }
                                            />
                                            {errors.email && (
                                                <p className="text-sm font-semibold text-destructive">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="country">{t('admin.manageUsers.countryLabel')}</Label>
                                            <CountryCombobox
                                                id="country"
                                                value={form?.country ?? ""}
                                                onChange={(value) =>
                                                    setForm(prev => prev && {
                                                        ...prev,
                                                        country: value,
                                                    })
                                                }
                                            />
                                            {errors.country && (
                                                <p className="text-sm font-semibold text-destructive">
                                                    {errors.country}
                                                </p>
                                            )}
                                        </div>

                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="age">{t('admin.manageUsers.ageLabel')}</Label>
                                        <Input
                                            id="age"
                                            type="number"
                                            value={form?.age ?? ""}
                                            onChange={(e) =>
                                                setForm(prev => prev && {
                                                    ...prev,
                                                    age: Number(e.target.value)
                                                })
                                            }
                                        />
                                        {errors.age && (
                                            <p className="text-sm font-semibold text-destructive">
                                                {errors.age}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio">{t('admin.manageUsers.bioLabel')}</Label>
                                        <textarea
                                            id="bio"
                                            placeholder={t('auth.bioPlaceholder')}
                                            className="mt-1 flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={form?.bio ?? ""}
                                            onChange={(e) =>
                                                setForm(prev => prev && {
                                                    ...prev,
                                                    bio: e.target.value
                                                })
                                            }
                                        />
                                        {errors.bio && (
                                            <p className="text-sm font-semibold text-destructive">
                                                {errors.bio}
                                            </p>
                                        )}
                                    </div>
                                </section>

                                <div className="border-t" />

                                {/* Account */}
                                <section className="space-y-4">
                                    <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                        {t('admin.manageUsers.account')}</h3>

                                    <div className="grid gap-4 md:grid-cols-2">

                                        <div className="space-y-2">
                                            <Label>{t('admin.manageUsers.roleLabel')}</Label>

                                            <Select
                                                value={form?.role}
                                                onValueChange={(value) =>
                                                    setForm(prev => prev && {
                                                        ...prev,
                                                        role: value
                                                    })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    <SelectItem value="participant">
                                                        {t('admin.manageUsers.participant')}
                                                    </SelectItem>

                                                    <SelectItem value="judge">
                                                        {t('admin.manageUsers.judge')}
                                                    </SelectItem>

                                                    <SelectItem value="admin">
                                                        {t('admin.manageUsers.admin')}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.role && (
                                                <p className="text-sm font-semibold text-destructive">
                                                    {errors.role}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>{t('common.status')}</Label>

                                            <Select
                                                value={form?.account_status ?? ""}
                                                onValueChange={(value) =>
                                                    setForm(prev =>
                                                        prev
                                                            ? {
                                                                ...prev,
                                                                account_status: value,
                                                            }
                                                            : null
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    <SelectItem value="active">
                                                        {t('admin.manageUsers.active')}
                                                    </SelectItem>

                                                    <SelectItem value="disabled">
                                                        {t('admin.manageUsers.disabled')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.account_status && (
                                                <p className="text-sm font-semibold text-destructive">
                                                    {errors.account_status}
                                                </p>
                                            )}
                                        </div>

                                    </div>
                                </section>

                                <div className="border-t" />

                                {/* Danger Zone */}
                                <section className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                                    <h3 className="font-semibold text-destructive">
                                        {t('admin.manageUsers.dangerZone')}</h3>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {t('admin.manageUsers.permanentlyRemoveThisUserAnd')}</p>

                                    <Button
                                        variant="destructive"
                                        className="mt-4"
                                        type="button"
                                        onClick={deleteUser}
                                    >
                                        {t('admin.manageUsers.deleteUser')}</Button>
                                </section>

                            </div>

                            <DialogFooter className="border-t pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowModifyDialog(false)}
                                >
                                    {t('admin.manageUsers.cancel')}</Button>

                                <Button onClick={saveUser}>
                                    {t('admin.manageUsers.saveChanges')}</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader className="pb-4 border-b">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold">
                                {newUser.full_name
                                    ? newUser.full_name.charAt(0).toUpperCase()
                                    : "+"}
                            </div>

                            <div>
                                <DialogTitle className="text-xl">
                                    {t('admin.manageUsers.addUser')}</DialogTitle>

                                <p className="text-sm text-muted-foreground">
                                    {t('admin.manageUsers.createANewUserAccount')}</p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-8 py-6">

                        {/* Personal Information */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                                {t('admin.manageUsers.personalInformation')}</h3>

                            <div className="grid gap-4 md:grid-cols-2">

                                <div className="space-y-2">
                                    <Label>{t('admin.manageUsers.fullName')}</Label>
                                    <Input
                                        value={newUser.full_name}
                                        onChange={(e) =>
                                            setNewUser({
                                                ...newUser,
                                                full_name: e.target.value,
                                            })
                                        }
                                    />
                                    {errors.full_name && (
                                        <p className="text-sm font-semibold text-destructive">
                                            {errors.full_name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('admin.manageUsers.usernameLabel')}</Label>
                                    <Input
                                        value={newUser.username}
                                        onChange={(e) =>
                                            setNewUser({
                                                ...newUser,
                                                username: e.target.value,
                                            })
                                        }
                                    />
                                    {errors.username && (
                                        <p className="text-sm font-semibold text-destructive">
                                            {errors.username}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('admin.manageUsers.ageLabel')}</Label>
                                    <Input
                                        type="number"
                                        value={newUser.age}
                                        onChange={(e) =>
                                            setNewUser({
                                                ...newUser,
                                                age: Number(e.target.value),
                                            })
                                        }
                                    />
                                    {errors.age && (
                                        <p className="text-sm font-semibold text-destructive">
                                            {errors.age}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('admin.manageUsers.countryLabel')}</Label>
                                    <CountryCombobox
                                        value={newUser.country}
                                        onChange={(value) =>
                                            setNewUser({
                                                ...newUser,
                                                country: value,
                                            })
                                        }
                                    />
                                    {errors.country && (
                                        <p className="text-sm font-semibold text-destructive">
                                            {errors.country}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>{t('admin.manageUsers.emailLabel')}</Label>
                                <Input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            email: e.target.value,
                                        })
                                    }
                                />
                                {errors.email && (
                                    <p className="text-sm font-semibold text-destructive">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>{t('admin.manageUsers.bioLabel')}</Label>

                                <textarea
                                    className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder={t('admin.manageUsers.tellUsSomethingAboutThis')}
                                    value={newUser.bio}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            bio: e.target.value,
                                        })
                                    }
                                />
                                {errors.bio && (
                                    <p className="text-sm font-semibold text-destructive">
                                        {errors.bio}
                                    </p>
                                )}
                            </div>
                        </section>

                        <div className="border-t" />

                        {/* Account Settings */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                                {t('admin.manageUsers.accountSettings')}</h3>

                            <div className="grid gap-4 md:grid-cols-2">

                                <div className="space-y-2">
                                    <Label>{t('admin.manageUsers.password')}</Label>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    {errors.password && (
                                        <p className="text-sm font-semibold text-destructive">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('auth.confirmPassword')}</Label>
                                    <Input
                                        type="password"
                                        value={passwordConfirmation}
                                        onChange={(e) =>
                                            setPasswordConfirmation(e.target.value)
                                        }
                                    />
                                    {errors.password_confirmation && (
                                        <p className="text-sm font-semibold text-destructive">
                                            {errors.password_confirmation}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('admin.manageUsers.roleLabel')}</Label>

                                    <Select
                                        value={newUser.role}
                                        onValueChange={(value) =>
                                            setNewUser({
                                                ...newUser,
                                                role: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="participant">
                                                {t('admin.manageUsers.participant')}
                                            </SelectItem>

                                            <SelectItem value="judge">
                                                {t('admin.manageUsers.judge')}
                                            </SelectItem>

                                            <SelectItem value="admin">
                                                {t('admin.manageUsers.admin')}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.role && (
                                        <p className="text-sm font-semibold text-destructive">
                                            {errors.role}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('common.status')}</Label>

                                    <Select
                                        value={newUser.account_status}
                                        onValueChange={(value) =>
                                            setNewUser({
                                                ...newUser,
                                                account_status: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="active">
                                                {t('admin.manageUsers.active')}
                                            </SelectItem>

                                            <SelectItem value="disabled">
                                                {t('admin.manageUsers.disabled')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.account_status && (
                                        <p className="text-sm font-semibold text-destructive">
                                            {errors.account_status}
                                        </p>
                                    )}
                                </div>

                            </div>
                        </section>

                    </div>

                    <DialogFooter className="border-t pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowAddDialog(false)}
                        >
                            {t('admin.manageUsers.cancel')}</Button>

                        <Button onClick={createUser}>
                            {t('admin.manageUsers.createUser')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
}

export default ManageUsersPage;