import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Download } from 'lucide-react';
import { certificates } from '@/data/mockData';
import { Head } from '@inertiajs/react';
import { PageHeader, Navbar, DashboardSidebar, Footer } from '@/components/layout';

function CertificatesPage() {

    return (
        <>
            <Head title="Certificates & Awards – Earned Recognition" />
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex flex-1">
                    <DashboardSidebar />
                    <main className="flex-1 overflow-auto">
                        <div className="p-6">
                            <PageHeader title="My Certificates" description="Download your verified credential documents" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {certificates.map(cert => (
                                    <Card key={cert.id} className="overflow-hidden">
                                        <div className="h-3 bg-gradient-to-r from-amber-400 to-amber-600" />
                                        <CardContent className="pt-6">
                                            <div className="text-center">
                                                <Award className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                                                <h3 className="font-semibold">Certificate of {cert.rank <= 3 ? 'Rank' : 'Merit'}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">{cert.competitionTitle}</p>
                                                <Badge variant="secondary" className="mt-2">Rank #{cert.rank}</Badge>
                                                <p className="text-xs text-muted-foreground mt-3 font-mono">Hash: {cert.certificateCode}</p>
                                                <Button size="sm" className="mt-4 cursor-pointer w-full">
                                                    <Download className="h-4 w-4 mr-2" />Download PDF
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
                <Footer />
            </div>
        </>
    );
}

export default CertificatesPage;