import { useState, useEffect, useSyncExternalStore } from 'react';
import { route } from "ziggy-js";
import { Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Swords, Trophy, Menu, Moon, Sun, Bell, User, Mail, LogOut, LayoutDashboard, ChevronRight, Home, Search, Image, Award, Info, Users, FileText, Shield, Gavel, FolderOpen, Tag, Megaphone, Clock, MessageSquare, Globe, Check, PanelLeft } from 'lucide-react';
import { useTranslation, LANGUAGES } from '@/lib/i18n';

// Language selector
export function LanguageSelector() {
  const { language, setLanguage, getLanguageName } = useTranslation();
  const currentOption = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1.5 px-2 cursor-pointer text-sm font-medium">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <img
            src={currentOption.flag}
            alt={getLanguageName(language)}
            className="w-5 h-3.5 object-cover rounded-xs border border-border/40 shadow-xs"
            loading="lazy"
          />
          <span className="hidden md:inline">{getLanguageName(language)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {LANGUAGES.map((item) => {
          const isSelected = item.code === language;
          return (
            <DropdownMenuItem
              key={item.code}
              onClick={() => setLanguage(item.code)}
              className={`flex items-center justify-between cursor-pointer ${
                isSelected ? 'bg-muted font-semibold' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={item.flag}
                  alt={getLanguageName(item.code)}
                  className="w-5 h-3.5 object-cover rounded-xs border border-border/40 shadow-xs"
                  loading="lazy"
                />
                <span>{getLanguageName(item.code)}</span>
              </div>
              {isSelected && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// The Cross
const OrthodoxCross = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 24}
    height={props.size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="6" y1="9" x2="18" y2="9" />
    <line x1="6" y1="8" x2="18" y2="8" />
    <line x1="13" y1="2" x2="13" y2="22" />
    <line x1="12" y1="2" x2="12" y2="22" />
  </svg>
);

// Theme toggle
type Theme = 'light' | 'dark' | 'church';
const THEME_ORDER: Theme[] = ['light', 'dark', 'church'];
const STORAGE_KEY = 'theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'church';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return (THEME_ORDER as string[]).includes(stored ?? '') ? (stored as Theme) : 'church';
}

let currentTheme: Theme = getInitialTheme();
const themeListeners = new Set<() => void>();

function applyThemeClass(t: Theme) {
  document.documentElement.classList.remove('dark', 'church');
  if (t !== 'light') document.documentElement.classList.add(t);
}

function setGlobalTheme(t: Theme) {
  currentTheme = t;
  window.localStorage.setItem(STORAGE_KEY, t);
  applyThemeClass(t);
  themeListeners.forEach((l) => l());
}

function subscribeTheme(listener: () => void) {
  themeListeners.add(listener);
  return () => themeListeners.delete(listener);
}

function getThemeSnapshot() {
  return currentTheme;
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot);
  return { theme, setTheme: setGlobalTheme };
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    applyThemeClass(currentTheme);
  }, []);

  const cycleTheme = () => {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];
    setTheme(next);
  };

  const icon = {
    light: <Sun className="h-5 w-5" />,
    dark: <Moon className="h-5 w-5" />,
    church: <OrthodoxCross size={22} />,
  }[theme];

  return (
    <Button variant="ghost" size="icon" onClick={cycleTheme} className="cursor-pointer" title={`Theme: ${theme}`}>
      {icon}
    </Button>
  );
}

// Public Navbar
export function Navbar() {
  const { url } = usePage();
  const { t } = useTranslation();

  type PageProps = {
    user: {
      id: number;
      full_name: string;
      username: string;
      email: string;
      image: string;
      role: string;
    } | null;
    unreadNotificationsCount: number;
  };
  const { user, unreadNotificationsCount } = usePage<PageProps>().props;

  const publicLinks = [
    { route: 'home', path: route('home'), label: t('nav.home'), icon: Home },
    { route: 'competitions.index', path: route('competitions.index'), label: t('nav.competitions'), icon: Trophy },
    { route: 'winners', path: route('winners'), label: t('nav.winners'), icon: Award },
    { route: 'gallery', path: route('gallery'), label: t('nav.gallery'), icon: Image },
    { route: 'about', path: route('about'), label: t('nav.about'), icon: Info },
    { route: 'contact', path: route('contact'), label: t('nav.contact'), icon: Mail },
  ];

  const unreadCount = user ? (unreadNotificationsCount ?? 0) : 0;

  const onLogin = () => {
    router.visit(route('login'));
  };

  const onLogout = () => {
    router.post(route('logout'));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden cursor-pointer" aria-label="Open public menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 sm:w-80 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-bold text-lg mb-6 pt-2">
                  <Trophy className="h-6 w-6 text-amber-500" />
                  <span>CompeteHub</span>
                </div>
                <nav className="flex flex-col gap-1.5">
                  {publicLinks.map(link => (
                    <Link
                      key={link.path}
                      href={link.path}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                        route().current(link.route) ? 'bg-primary text-primary-foreground font-semibold' : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <link.icon className="h-4 w-4 shrink-0" />
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {user && (
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-2">
                      {t('nav.dashboard')}
                    </p>
                    <Link
                      href={route(`${user.role}.dashboard`)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
                    >
                      <LayoutDashboard className="h-4 w-4 text-primary shrink-0" />
                      {t('nav.dashboard')}
                    </Link>
                    <Link
                      href={route('profile', { id: user.id })}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
                    >
                      <User className="h-4 w-4 text-primary shrink-0" />
                      {t('nav.profile')}
                    </Link>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 flex items-center justify-between">
                <LanguageSelector />
                <ThemeToggle />
              </div>
            </SheetContent>
          </Sheet>
          <Link href={route('home')} className="flex items-center gap-2 font-bold text-xl">
            <Trophy className="h-6 w-6 text-amber-500 shrink-0" />
            <span className="inline-block">CompeteHub</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {publicLinks.map((link) => (
            <Link
              key={link.route}
              href={link.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                route().current(link.route)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:flex items-center gap-1">
            <LanguageSelector />
            <ThemeToggle />
          </div>
          {user ? (
            <>
              {(user.role === "participant" || user.role === "judge") ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative cursor-pointer"
                  onClick={() => router.visit(route("notifications"))}
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-white border-0">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              ) : null}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 cursor-pointer px-2 sm:px-3">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium shrink-0">
                      {user.image ? (
                        <img
                          src={`/competition_management/public/storage/${user.image}`}
                          alt={user.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="cursor-pointer" onClick={() => router.visit(route(`${user.role}.dashboard`))}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />{t('nav.dashboard')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => router.visit(route('profile', { id: user.id }))}>
                    <User className="h-4 w-4 mr-2" />{t('nav.profile')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="sm:hidden px-2 py-1.5 flex items-center justify-between border-b mb-1">
                    <LanguageSelector />
                    <ThemeToggle />
                  </div>
                  <DropdownMenuItem className="cursor-pointer text-destructive" onClick={onLogout}>
                    <LogOut className="h-4 w-4 mr-2" />{t('nav.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={onLogin} size="sm" className="cursor-pointer sm:size-default">{t('nav.signIn')}</Button>
          )}
        </div>
      </div>
    </header>
  );
}


type PageProps = {
  user: {
    id: number;
    full_name: string;
    username: string;
    email: string;
    image: string;
    role: string;
  };
};

// Dashboard Sidebar
export function DashboardSidebar({ collapsed = false }: { collapsed?: boolean }) {
  const { user } = usePage<PageProps>().props;
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const participantLinks = [
    { route: 'participant.dashboard', path: route('participant.dashboard'), label: t('sidebar.dashboard'), icon: LayoutDashboard },
    { route: 'profile', path: route('profile', { id: user?.id }), label: t('sidebar.myProfile'), icon: User },
    { route: 'participant.competitions', path: route('participant.competitions'), label: t('sidebar.myCompetitions'), icon: Trophy },
    { route: 'participant.teams', path: route('participant.teams'), label: t('sidebar.myTeams'), icon: Swords },
    { route: 'notifications', path: route('notifications'), label: t('sidebar.notifications'), icon: Bell },
  ];

  const judgeLinks = [
    { route: 'judge.dashboard', path: route('judge.dashboard'), label: t('sidebar.dashboard'), icon: LayoutDashboard },
    { route: 'judge.competitions', path: route('judge.competitions'), label: t('sidebar.assignedCompetitions'), icon: Trophy },
    { route: 'judge.history', path: route('judge.history'), label: t('sidebar.evaluationHistory'), icon: Clock },
    { route: 'notifications', path: route('notifications'), label: t('sidebar.notifications'), icon: Bell },
  ];

  const adminLinks = [
    { route: 'admin.dashboard', path: route('admin.dashboard'), label: t('sidebar.dashboard'), icon: LayoutDashboard },
    { route: 'admin.users', path: route('admin.users'), label: t('sidebar.manageUsers'), icon: Users },
    { route: 'admin.teams', path: route('admin.teams'), label: t('sidebar.manageTeams'), icon: Swords },
    { route: 'admin.competitions', path: route('admin.competitions'), label: t('sidebar.manageCompetitions'), icon: Trophy },
    { route: 'admin.categories', path: route('admin.categories'), label: t('sidebar.categories'), icon: Tag },
    { route: 'admin.judges', path: route('admin.judges'), label: t('sidebar.manageJudges'), icon: Gavel },
    { route: 'admin.audit-logs', path: route('admin.audit-logs'), label: t('sidebar.auditLogs'), icon: Shield },
    { route: 'admin.submissions', path: route('admin.submissions'), label: t('sidebar.submissions'), icon: FolderOpen },
    { route: 'admin.announcements', path: route('admin.announcements'), label: t('sidebar.announcements'), icon: Megaphone },
    ...(user?.email === "peposamy59@gmail.com" && user?.username === "Rojeh_123"
      ? [
        {
          route: "admin.messages.index",
          path: route("admin.messages.index"),
          label: t('sidebar.messages'),
          icon: MessageSquare,
        },
      ]
      : []),
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'judge' ? judgeLinks : participantLinks;
  const activeLink = links.find((link) => route().current(link.route));

  return (
    <>
      {/* Desktop Sidebar (lg screens and above) */}
      <aside className={`hidden lg:flex flex-col border-r bg-sidebar text-sidebar-foreground ${collapsed ? 'w-16' : 'w-64'} shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto`}>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {links.map((link) => {
            const isActive = route().current(link.route);

            return (
              <Link
                key={link.route}
                href={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-xs'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{link.label}</span>}
                {isActive && !collapsed && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Top Bar & Drawer Trigger (< lg screens) */}
      <div className="lg:hidden w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 px-4 py-2.5 flex items-center justify-between sticky top-16 z-30 shadow-xs">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 cursor-pointer border-primary/30 hover:border-primary text-foreground font-medium shadow-xs"
            >
              <PanelLeft className="h-4 w-4 text-primary shrink-0" />
              <span>{t('sidebar.menu') || 'Dashboard Menu'}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 sm:w-80 p-0 flex flex-col bg-sidebar text-sidebar-foreground">
            <div className="p-4 border-b bg-sidebar-accent/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
                  {user?.image ? (
                    <img
                      src={`/competition_management/public/storage/${user.image}`}
                      alt={user.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user?.username?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{user?.full_name || user?.username}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
                      {user?.role || 'User'}
                    </Badge>
                    <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-3 py-1.5">
                {t('sidebar.navigation') || 'Navigation'}
              </p>
              {links.map((link) => {
                const isActive = route().current(link.route);

                return (
                  <Link
                    key={link.route}
                    href={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-xs'
                        : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                    }`}
                  >
                    <link.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{link.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4 ml-auto shrink-0" />}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {activeLink && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium truncate max-w-[180px] sm:max-w-[280px]">
            <activeLink.icon className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{activeLink.label}</span>
          </div>
        )}
      </div>
    </>
  );
}

// Footer
export function Footer() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isChurch = theme === 'church';

  return (
    <footer className="border-t bg-muted/20">
      {/* Top gradient accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        {/* Main grid: 2 cols on mobile (2×2), 4 cols on tablet/desktop (all in one row) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-10">

          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Trophy className="h-4 w-4 text-primary" />
              </div>
              <span className="font-bold text-lg tracking-tight">CompeteHub</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">
              {t('footer.tagline')}
            </p>
            {/* Social / icon links row */}
            <div className="flex items-center gap-2 mt-1">
              <a
                href="#"
                aria-label="Twitter"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/60 transition-all duration-200"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.847L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="GitHub"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/60 transition-all duration-200"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href={route('contact')}
                aria-label="Contact"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/60 transition-all duration-200"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Platform links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold tracking-wide uppercase text-foreground/70 flex items-center gap-1.5">
              {isChurch && <OrthodoxCross size={12} className="text-primary shrink-0" />}
              {t('footer.platform')}
            </h4>
            <nav className="flex flex-col gap-2">
              <Link href={route("competitions.index")} className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all duration-150 w-fit">
                {t('nav.competitions')}
              </Link>
              <Link href={route("winners")} className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all duration-150 w-fit">
                {t('nav.winners')}
              </Link>
              <Link href={route("gallery")} className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all duration-150 w-fit">
                {t('nav.gallery')}
              </Link>
            </nav>
          </div>

          {/* Company links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold tracking-wide uppercase text-foreground/70 flex items-center gap-1.5">
              {isChurch && <OrthodoxCross size={12} className="text-primary shrink-0" />}
              {t('footer.company')}
            </h4>
            <nav className="flex flex-col gap-2">
              <Link href={route("about")} className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all duration-150 w-fit">
                {t('footer.aboutUs')}
              </Link>
              <Link href={route("contact")} className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all duration-150 w-fit">
                {t('nav.contact')}
              </Link>
            </nav>
          </div>

          {/* Support links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold tracking-wide uppercase text-foreground/70 flex items-center gap-1.5">
              {isChurch && <OrthodoxCross size={12} className="text-primary shrink-0" />}
              {t('footer.support')}
            </h4>
            <nav className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all duration-150 w-fit cursor-pointer">{t('footer.faq')}</span>
              <span className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all duration-150 w-fit cursor-pointer">{t('footer.privacyPolicy')}</span>
              <span className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all duration-150 w-fit cursor-pointer">{t('footer.helpCenter')}</span>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 order-2 sm:order-1">
            {isChurch && <OrthodoxCross size={11} className="text-primary/60 shrink-0" />}
            {t('footer.rights')}
            {isChurch && <OrthodoxCross size={11} className="text-primary/60 shrink-0" />}
          </p>
          <div className="flex items-center gap-4 order-1 sm:order-2">
            <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">{t('footer.privacyPolicy')}</span>
            <span className="text-muted-foreground/40 text-xs">·</span>
            <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">{t('footer.faq')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Countdown Timer Component
export function CountdownTimer({ deadline }: { deadline: string }) {
  const { t } = useTranslation();
  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return <span className="text-destructive font-medium">{t('common.closed')}</span>;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="flex items-center gap-1 font-mono text-sm">
      <div className="bg-primary/10 text-primary px-2 py-1 rounded font-semibold">{String(days).padStart(2, '0')}d</div>
      <span className="text-muted-foreground">:</span>
      <div className="bg-primary/10 text-primary px-2 py-1 rounded font-semibold">{String(hours).padStart(2, '0')}h</div>
      <span className="text-muted-foreground">:</span>
      <div className="bg-primary/10 text-primary px-2 py-1 rounded font-semibold">{String(minutes).padStart(2, '0')}m</div>
    </div>
  );
}

// Search Bar Component
export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const { t } = useTranslation();
  const effectivePlaceholder = placeholder || t('common.searchPlaceholder');

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={effectivePlaceholder}
        className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

// Stats Card
export function StatsCard({ label, value, icon: Icon, trend }: { label: string; value: string | number; icon: React.ElementType; trend?: string }) {
  return (
    <div className="bg-card border rounded-xl p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        {trend && <p className="text-xs text-emerald-600 mt-1">{trend}</p>}
      </div>
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </div>
  );
}

// Competition Card
export function CompetitionCard({ competition, onClick }: { competition: { id: number; title: string; category: { id: number; name: string; }; submission_deadline: String; status: string; participants: { id: number;}[]; image: string; prizeDescription: string }; onClick?: () => void }) {
  const { t } = useTranslation();

  const statusColors: Record<string, string> = {
    upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    open: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    submission_closed: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    judging: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    results_published: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    archived: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  };

  const statusKey = `status.${competition.status}`;
  const translatedStatus = t(statusKey, competition.status.replace('_', ' '));

  return (
    <div onClick={onClick} className="group bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer">
    <div className="h-40 overflow-hidden">
        {competition.image ? (
            <img
                src={`/competition_management/public/storage/${competition.image}`}
                alt={competition.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
        ) : (
            <div className="h-full w-full flex items-center justify-center bg-muted">
                <Trophy className="h-16 w-16 text-primary" />
            </div>
        )}
    </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">{competition.category.name}</Badge>
          <Badge className={`text-xs border-0 ${statusColors[competition.status] || ''}`}>
            {translatedStatus}
          </Badge>
        </div>
        <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">{competition.title}</h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{competition.participants.length} {t('common.participants')}</span>
          <CountdownTimer deadline={competition.submission_deadline as string} />
        </div>
      </div>
    </div>
  );
}

// Empty State
export function EmptyState({ icon: Icon, title, description, action }: { icon: React.ElementType; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}

// Page Header
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground text-sm mt-1 line-clamp-2 sm:line-clamp-none">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

// FileUpload component
export function FileUpload({
    accept,
    maxSize,
    onUpload,
}: {
    accept: string;
    maxSize: number;
    onUpload: (files: File[]) => void;
}) {
    const { t } = useTranslation();
    const [dragOver, setDragOver] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleFiles = (files: File[]) => {
        setSelectedFiles(files);
        onUpload(files);
    };

    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(Array.from(e.dataTransfer.files));
            }}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
            }`}
            onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = accept;
                input.multiple = true;

                input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) {
                        handleFiles(Array.from(files));
                    }
                };

                input.click();
            }}
        >
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />

            {selectedFiles.length === 0 ? (
                <>
                    <p className="font-medium mb-1">
                        {t('common.dropFiles')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {t('common.accepted')}: {accept} (Max {maxSize} MB)
                    </p>
                </>
            ) : (
                <>
                    <p className="font-medium text-green-600 mb-3">
                        {selectedFiles.length} {t('common.filesSelected')}
                    </p>

                    <div className="space-y-1 text-sm">
                        {selectedFiles.map((file, index) => (
                            <div
                                key={index}
                                className="flex justify-between rounded bg-muted px-3 py-2"
                            >
                                <span className="truncate">
                                    {file.name}
                                </span>

                                <span className="text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                            </div>
                        ))}
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground">
                        {t('common.clickToReplace')}
                    </p>
                </>
            )}
        </div>
    );
}
