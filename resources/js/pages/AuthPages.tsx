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
                            <span className="text-2xl font-bold">CompeteHub</span>
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
                                                placeholder="participant@domain.com"
                                                className="mt-1.5"
                                                value={loginData.email}
                                                onChange={(e) => setLoginData('email', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="login_password">{t('auth.password')}</Label>
                                                <button
                                                    type="button"
                                                    className="text-xs text-primary hover:underline cursor-pointer"
                                                >
                                                    {t('auth.forgotPassword')}
                                                </button>
                                            </div>

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

                                        <div className="relative my-4">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t" />
                                            </div>
                                            <div className="relative flex justify-center text-xs">
                                                <span className="bg-card px-2 text-muted-foreground">
                                                    {t('auth.or')}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            className="w-full cursor-pointer"
                                            type="button"
                                        >
                                            <svg
                                                className="h-4 w-4 mr-2"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                    fill="#4285F4"
                                                />
                                                <path
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                    fill="#34A853"
                                                />
                                                <path
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                    fill="#FBBC05"
                                                />
                                                <path
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                    fill="#EA4335"
                                                />
                                            </svg>
                                            {t('auth.continueGoogle')}
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
                                                    placeholder="Rojeh"
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
                                                    placeholder="Samy"
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
                                                placeholder="rojeh_samy"
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
                                                        <CommandInput placeholder={t('auth.searchCountry')} />
                                                        <CommandList>
                                                            <CommandEmpty>{t('auth.noCountry')}</CommandEmpty>
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
                                                placeholder="18"
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
                                                placeholder={t('auth.min8Chars')}
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
                                                placeholder={t('auth.repeatPassword')}
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