import { Footer, Navbar, PageHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Shield, Trophy, Users } from 'lucide-react';
import { Head } from '@inertiajs/react';
import profileImage from '@/assets/images/rojeh.jpg';
import { useTranslation } from '@/lib/i18n';

function AboutPage() {
  const { t } = useTranslation();

  return (
    <>
      <Head title={`${t('about.title')} – CompeteHub`} />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <PageHeader title={t('about.title')} description={t('about.description')} />

                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Left Card */}
                        <Card className="lg:col-span-2">
                            <CardContent className="pt-6">
                                <h3 className="mb-4 text-xl font-semibold">{t('about.myMission')}</h3>
                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    {t('about.missionText')}
                                </p>

                                <h3 className="mb-4 text-xl font-semibold">{t('about.whatIDo')}</h3>

                                <ul className="text-muted-foreground space-y-3">
                                    <li className="flex items-start gap-2">
                                        <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                                        {t('about.bullet1')}
                                    </li>

                                    <li className="flex items-start gap-2">
                                        <Shield className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                                        {t('about.bullet2')}
                                    </li>

                                    <li className="flex items-start gap-2">
                                        <Award className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                                        {t('about.bullet3')}
                                    </li>

                                    <li className="flex items-start gap-2">
                                        <Users className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                                        {t('about.bullet4')}
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Right Card */}
                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="mb-6 text-xl text-center font-semibold">
                                    {t('about.developedBy')}
                                </h3>

                                <div className="text-center">
                                    <div className="bg-primary/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                                        <img
                                            src={profileImage}
                                            alt="Rojeh Samy"
                                            className="h-20 w-20 rounded-full object-cover"
                                        />
                                    </div>

                                    <h4 className="font-semibold text-lg">Rojeh Samy</h4>

                                    <p className="mb-4 text-sm text-amber-600 dark:text-amber-400">
                                        {t('about.role')}
                                    </p>

                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {t('about.bio')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default AboutPage;