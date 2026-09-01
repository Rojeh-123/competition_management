import { useEffect, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { route } from "ziggy-js";
import { COUNTRIES } from '@/lib/countries';
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
import { useTranslation } from '@/lib/i18n';

function LoginPage() {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('login');
    const [PasswordsDontMatch, setPasswordsDontMatch] = useState(false);
    const [open, setOpen] = useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        country: '',
        age: '',
        bio: '',
        password: '',
        password_confirmation: '',
    });

    type LoginFormData = {
        email: string;
        password: string;
        remember: boolean;
    };

    const {
        data: loginData,
        setData: setLoginData,
        post: loginPost,
        processing: loginProcessing,
        errors: loginErrors,
        reset: resetLogin,
    } = useForm<LoginFormData>({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('register'), {
            onSuccess: () => window.location.reload(),
        });
    };

    const loginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        loginPost(route('login.store'), {
            preserveScroll: true,
            onSuccess: () => window.location.reload(),
        });
    };

    useEffect(() => {
        setPasswordsDontMatch(data.password !== data.password_confirmation);
    }, [data.password, data.password_confirmation]);

    return (
        <>
            <Head title={activeTab === 'login' ? `${t('auth.signIn')} – CompeteHub` : `${t('auth.register')} – CompeteHub`} />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <button
                            type="button"
                            onClick={() => router.visit(route("home"))}
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 cursor-pointer"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t('auth.returnHome')}
                        </button>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Trophy className="h-8 w-8 text-amber-500" />
                            <span className="text-2xl font-bold">{t('authPages.competehub')}</span>
                        </div>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="w-full mb-6">
                                    <TabsTrigger value="login" className="flex-1 cursor-pointer">{t('auth.signIn')}</TabsTrigger>
                                    <TabsTrigger value="register" className="flex-1 cursor-pointer">{t('auth.register')}</TabsTrigger>
                                </TabsList>

                                <TabsContent value="login">
                                    <form className="space-y-4" onSubmit={loginSubmit}>

                                        <div>
                                            <Label htmlFor="login_email">{t('auth.emailAddress')}</Label>
                                            <Input
                                                id="login_email"
                                                type="email"
                                                placeholder="you@example.com"
                                                className="mt-1.5"
                                                value={loginData.email}
                                                onChange={(e) => setLoginData('email', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <div className="relative mt-1.5">
                                                <Input
                                                    id="login_password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    value={loginData.password}
                                                    onChange={(e) => setLoginData('password', e.target.value)}
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>

                                            {loginErrors.email && (
                                                <p className="mt-2 text-sm font-semibold text-red-500">
                                                    {loginErrors.email}
                                                </p>
                                            )}

                                            {loginErrors.password && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {loginErrors.password}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="remember"
                                                checked={loginData.remember}
                                                onCheckedChange={(checked) =>
                                                    setLoginData('remember', checked === true)
                                                }
                                            />
                                            <label
                                                htmlFor="remember"
                                                className="text-sm text-muted-foreground cursor-pointer"
                                            >
                                                {t('auth.rememberMe')}
                                            </label>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full cursor-pointer"
                                            disabled={loginProcessing}
                                        >
                                            {loginProcessing ? t('auth.signingIn') : t('auth.signIn')}
                                        </Button>

                                    </form>
                                </TabsContent>

                                <TabsContent value="register">
                                    <form onSubmit={submit} className="space-y-4">

                                        <div className="grid grid-cols-2 gap-4">

                                            <div>
                                                <Label htmlFor="first_name">{t('auth.firstName')}</Label>
                                                <Input
                                                    id="first_name"
                                                    placeholder="John"
                                                    value={data.first_name}
                                                    onChange={(e) => setData('first_name', e.target.value)}
                                                />
                                                {errors.first_name && (
                                                    <p className="mt-1 text-sm text-red-500">
                                                        {errors.first_name}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="last_name">{t('auth.lastName')}</Label>
                                                <Input
                                                    id="last_name"
                                                    placeholder="Doe"
                                                    value={data.last_name}
                                                    onChange={(e) => setData('last_name', e.target.value)}
                                                />
                                                {errors.last_name && (
                                                    <p className="mt-1 text-sm text-red-500">
                                                        {errors.last_name}
                                                    </p>
                                                )}
                                            </div>

                                        </div>

                                        <div>
                                            <Label htmlFor="email">{t('auth.emailAddress')}</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="username">{t('auth.username')}</Label>
                                            <Input
                                                id="username"
                                                placeholder="johndoe"
                                                value={data.username}
                                                onChange={(e) => setData('username', e.target.value)}
                                            />
                                            {errors.username && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.username}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="country">{t('auth.country')}</Label>
                                            <Popover open={open} onOpenChange={setOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        id="country"
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={open}
                                                        className="w-full justify-between font-normal cursor-pointer"
                                                    >
                                                        {data.country
                                                            ? COUNTRIES.find((country) => country === data.country)
                                                            : t('auth.selectCountry')}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search country..." />
                                                        <CommandList>
                                                            <CommandEmpty>{t('admin.manageUsers.noCountryFound')}</CommandEmpty>
                                                            <CommandGroup>
                                                                {COUNTRIES.map((country) => (
                                                                    <CommandItem
                                                                        key={country}
                                                                        value={country}
                                                                        onSelect={(currentValue) => {
                                                                            setData('country', currentValue === data.country ? '' : currentValue);
                                                                            setOpen(false);
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                'mr-2 h-4 w-4',
                                                                                data.country === country ? 'opacity-100' : 'opacity-0',
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
                                            {errors.country && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.country}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="age">{t('auth.age')}</Label>
                                            <Input
                                                id="age"
                                                type="number"
                                                placeholder="25"
                                                min={1}
                                                max={120}
                                                value={data.age}
                                                onChange={(e) => setData('age', e.target.value)}
                                            />
                                            {errors.age && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.age}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="bio">{t('auth.bio')}</Label>
                                            <textarea
                                                id="bio"
                                                placeholder={t('auth.bioPlaceholder')}
                                                className="mt-1 flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={data.bio}
                                                onChange={(e) => setData('bio', e.target.value)}
                                            />
                                            {errors.bio && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.bio}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="password">{t('auth.password')}</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="Minimum 8 characters"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                            />
                                            {errors.password && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="password_confirmation">
                                                {t('auth.confirmPassword')}
                                            </Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                placeholder="Repeat your password"
                                                value={data.password_confirmation}
                                                onChange={(e) =>
                                                    setData('password_confirmation', e.target.value)
                                                }
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full cursor-pointer"
                                            disabled={processing || PasswordsDontMatch}
                                        >
                                            {processing ? t('auth.creatingAccount') : t('auth.createAccount')}
                                        </Button>

                                    </form>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

export default LoginPage;