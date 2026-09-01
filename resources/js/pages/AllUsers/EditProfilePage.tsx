import { useTranslation } from '@/lib/i18n';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Footer, Navbar, PageHeader } from '@/components/layout';
import { route } from "ziggy-js";
import { Eye, EyeOff } from 'lucide-react';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { COUNTRIES } from '@/lib/countries';

function EditProfilePage() {
    const { t } = useTranslation();

    type PageProps = {
        user: {
            id: number;
            full_name: string;
            email: string;
            role: string;
            country: string;
            bio: string;
            username: string;
            age: number;
            image: null;
        };
        errors: Record<string, string>;
    };
    const { user, errors } = usePage<PageProps>().props;
    const [countryOpen, setCountryOpen] = useState(false);

    const [data, setData] = useState<{
        first_name: string;
        last_name: string;
        email: string;
        username: string;
        country: string;
        age: number | string;
        bio: string;
        password: string;
        oldPassword: string;
        password_confirmation: string;
        image: File | null;
    }>({
        first_name: user.full_name.split(' ')[0] || "",
        last_name: user.full_name.split(' ').slice(1).join(' ') || "",
        email: user.email || "",
        username: user.username || "",
        country: user.country || "",
        age: user.age || "",
        bio: user.bio || "",
        oldPassword: "",
        password: "",
        password_confirmation: "",
        image: null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post(route("profile.update"), data, {
            onSuccess: () => {
                console.log("Profile updated successfully!");
            },
            onError: (errors) => {
                console.error(errors);
            },
        });
    };

    const [preview, setPreview] = useState<string | null>(null);
    const [ableSubmit, setAbleSubmit] = useState<boolean>(false);

    useEffect(() => {
        if ((data.password === data.password_confirmation) && data.password.length >= 8 || data.password === "") {
            setAbleSubmit(true);
        } else {
            setAbleSubmit(false);
        }
    }, [data.password, data.password_confirmation]);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);

    return (
        <div className="flex min-h-screen flex-col">
            <Head title={t('allUsers.editProfile.editProfileAccountSettings')} />
            <Navbar />
            <main className="flex-1">
                <div className="w-full p-6">
                    <PageHeader title={t('allUsers.editProfile.editProfile')} description={t('allUsers.editProfile.updateYourProfileInformation')} />

                    <Card className="w-full">
                        <CardContent className="pt-6 space-y-4">
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="first_name">{t('auth.firstName')}</Label>
                                        <Input
                                            id="first_name"
                                            value={data.first_name}
                                            onChange={(e) => setData({ ...data, first_name: e.target.value })}
                                            className="mt-1.5"
                                        />
                                        {errors.first_name && <p className="text-sm text-red-500 mt-1 font-semibold font-semibold">{errors.first_name}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="last_name">{t('auth.lastName')}</Label>
                                        <Input
                                            id="last_name"
                                            value={data.last_name}
                                            onChange={(e) => setData({ ...data, last_name: e.target.value })}
                                            className="mt-1.5"
                                        />
                                        {errors.last_name && <p className="text-sm text-red-500 mt-1 font-semibold">{errors.last_name}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="email">{t('auth.emailAddress')}</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData({ ...data, email: e.target.value })}
                                            className="mt-1.5"
                                        />
                                        {errors.email && <p className="text-sm text-red-500 mt-1 font-semibold">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="username">{t('auth.usernameWithAt')}</Label>
                                        <Input
                                            id="username"
                                            value={data.username}
                                            onChange={(e) => setData({ ...data, username: e.target.value })}
                                            className="mt-1.5"
                                        />
                                        {errors.username && <p className="text-sm text-red-500 mt-1 font-semibold">{errors.username}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="country">{t('auth.country')}</Label>
                                        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id="country"
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={countryOpen}
                                                    className="w-full mt-1.5 justify-between font-normal"
                                                >
                                                    {data.country || t('auth.selectCountry')}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                                <Command>
                                                    <CommandInput placeholder={t('auth.searchCountry')} />
                                                    <CommandList>
                                                        <CommandEmpty>{t('allUsers.editProfile.noCountryFound')}</CommandEmpty>
                                                        <CommandGroup>
                                                            {COUNTRIES.map((country) => (
                                                                <CommandItem
                                                                    key={country}
                                                                    value={country}
                                                                    onSelect={(currentValue) => {
                                                                        setData({
                                                                            ...data,
                                                                            country: currentValue === data.country ? "" : currentValue,
                                                                        });
                                                                        setCountryOpen(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            data.country === country ? "opacity-100" : "opacity-0",
                                                                        )}
                                                                    />
                                                                    {country}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {errors.country && <p className="text-sm text-red-500 mt-1 font-semibold">{errors.country}</p>}
                                    </div>


                                    <div>
                                        <Label htmlFor="age">{t('auth.age')}</Label>
                                        <Input
                                            id="age"
                                            type="number"
                                            value={data.age}
                                            onChange={(e) => setData({ ...data, age: e.target.value })}
                                            min={1}
                                            max={120}
                                            className="mt-1.5"
                                        />
                                        {errors.age && <p className="text-sm text-red-500 mt-1 font-semibold">{errors.age}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="bio">{t('auth.bio')}</Label>
                                    <Textarea
                                        id="bio"
                                        value={data.bio}
                                        onChange={(e) => setData({ ...data, bio: e.target.value })}
                                        className="mt-1.5"
                                    />
                                    {errors.bio && <p className="text-sm text-red-500 mt-1 font-semibold">{errors.bio}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="image">{t('allUsers.editProfile.profileImageOptional')}</Label>
                                    <div className="flex items-center gap-4 mt-1.5">
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            className="w-full"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                setData({ ...data, image: file });
                                                setPreview(file ? URL.createObjectURL(file) : null);
                                            }}
                                        />
                                        {preview && (
                                            <img
                                                src={preview}
                                                alt={t('allUsers.editProfile.preview')}
                                                className="h-20 w-20 rounded-md object-cover border"
                                            />
                                        )}
                                    </div>
                                    {errors.image && <p className="text-sm text-red-500 mt-1 font-semibold">{errors.image}</p>}
                                </div>

                                <hr className="my-6" />

                                <div>
                                    <Label htmlFor="oldPassword">{t('allUsers.editProfile.oldPassword')}</Label>
                                    <div className="relative mt-1.5">
                                        <Input
                                            id="oldPassword"
                                            type={showOldPassword ? "text" : "password"}
                                            value={data.oldPassword}
                                            onChange={(e) => setData({ ...data, oldPassword: e.target.value })}
                                            placeholder={t('allUsers.editProfile.pleaseEnterYourOldPassword')}
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                        >
                                            {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.oldPassword && <p className="text-sm text-red-500 mt-1 font-semibold">{errors.oldPassword}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="newPassword">{t('allUsers.editProfile.newPassword')}</Label>
                                        <div className="relative mt-1.5">
                                            <Input
                                                id="newPassword"
                                                type={showPassword ? "text" : "password"}
                                                value={data.password}
                                                onChange={(e) => setData({ ...data, password: e.target.value })}
                                                placeholder={t('allUsers.editProfile.minimum8Characters')}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-sm text-red-500 mt-1 font-semibold">{errors.password}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="password_confirmation">{t('auth.confirmPassword')}</Label>
                                        <div className="relative mt-1.5">
                                            <Input
                                                id="password_confirmation"
                                                type={showConfirm ? "text" : "password"}
                                                value={data.password_confirmation}
                                                onChange={(e) =>
                                                    setData({ ...data, password_confirmation: e.target.value })
                                                }
                                                placeholder={t('allUsers.editProfile.repeatYourPassword')}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm(!showConfirm)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                            >
                                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {errors.password_confirmation && (
                                            <p className="text-sm text-red-500 mt-1 font-semibold">{errors.password_confirmation}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4">
                                    <Button type="submit" className="cursor-pointer" disabled={!ableSubmit}>
                                        {t('allUsers.editProfile.saveChanges')}</Button>
                                    <Button
                                        variant="outline"
                                        className="cursor-pointer"
                                        type="button"
                                        onClick={() => router.visit(route("profile", { id: user.id }))}
                                    >
                                        {t('allUsers.editProfile.cancel')}</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default EditProfilePage;