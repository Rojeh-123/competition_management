import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { platformStats } from '@/data/mockData';
import { PageHeader, Navbar, Footer, DashboardSidebar } from '@/components/layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Head } from "@inertiajs/react";

function ReportsPage() {
  const { t } = useTranslation();


  return (
    <div className="flex min-h-screen flex-col">
      <Head title={t('admin.reports.reportsPlatformAnalytics')} />
      <Navbar />
      <div className="flex flex-col lg:flex-row flex-1 min-w-0">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 min-w-0">
            <PageHeader title={t('admin.reports.reportsAnalytics')} description={t('admin.reports.platformMetricsAndDataExport')} />

            <Card className="mb-6">
              <CardHeader><CardTitle className="text-base">{t('admin.reports.exportReports')}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="cursor-pointer"><Download className="h-4 w-4 mr-2" />{t('admin.reports.pdfReport')}</Button>
                  <Button variant="outline" className="cursor-pointer"><Download className="h-4 w-4 mr-2" />{t('admin.reports.excelLedger')}</Button>
                  <Button variant="outline" className="cursor-pointer"><Download className="h-4 w-4 mr-2" />{t('admin.reports.rawCsv')}</Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">{t('admin.reports.monthlyRegistrations')}</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={platformStats.monthlyGrowth}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="hsl(234, 89%, 30%)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">{t('admin.reports.participationByCountry')}</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {platformStats.participationByCountry.map(item => (
                      <div key={item.country} className="flex items-center gap-3">
                        <span className="text-sm w-20">{item.country}</span>
                        <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${item.percentage}%` }} />
                        </div>
                        <span className="text-sm font-medium w-10 text-right">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
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

export default ReportsPage;