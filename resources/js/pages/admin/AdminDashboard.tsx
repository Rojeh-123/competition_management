import { Head, usePage } from "@inertiajs/react";
import {
    Trophy,
    Users,
    FileText,
    UserCheck,
    CheckCircle,
    Clock,
} from "lucide-react";

import {
    Navbar,
    Footer,
    StatsCard,
    PageHeader,
    DashboardSidebar,
} from "@/components/layout";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar,
} from "recharts";

interface MonthlyGrowth {
    month: string;
    users: number;
    submissions: number;
}

interface Country {
    country: string;
    percentage: number;
}

interface Activity {
    message: string;
    date: string;
}

interface Stats {
    totalUsers: number;
    activeCompetitions: number;
    completedCompetitions: number;

    totalSubmissions: number;
    pendingSubmissions: number;

    totalJudges: number;
    newUsersThisMonth: number;

    submissionsToday: number;

    upcomingCompetitions: number;
    judgingCompetitions: number;

    winnersAnnounced: number;

    submissionClosed: number;

    monthlyGrowth: MonthlyGrowth[];

    participationByCountry: Country[];

    recentActivities: Activity[];
}

function AdminDashboard() {
    const { stats } = usePage().props as unknown as {
        stats: Stats;
    };

    return (
        <>
            <Head title="Admin Dashboard – Control Panel" />
            <div className="flex min-h-screen flex-col">
            <Navbar />

            <div className="flex flex-col lg:flex-row flex-1 min-w-0">
                <DashboardSidebar />

                <main className="flex-1 overflow-auto min-w-0">
                    <div className="p-4 sm:p-6 lg:p-8 min-w-0">

                        <PageHeader
                            title="Administration Dashboard"
                            description="Manage competitions and monitor platform performance."
                        />


                        {/* Statistics */}

                        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                            <StatsCard
                                label="Total Users"
                                value={stats.totalUsers.toString()}
                                icon={Users}
                            />

                            <StatsCard
                                label="Active Competitions"
                                value={stats.activeCompetitions.toString()}
                                icon={Trophy}
                            />

                            <StatsCard
                                label="Total Submissions"
                                value={stats.totalSubmissions.toString()}
                                icon={FileText}
                            />

                            <StatsCard
                                label="Total Judges"
                                value={stats.totalJudges.toString()}
                                icon={UserCheck}
                            />

                            <StatsCard
                                label="Pending Submissions"
                                value={stats.pendingSubmissions.toString()}
                                icon={Clock}
                            />

                            <StatsCard
                                label="Completed Competitions"
                                value={stats.completedCompetitions.toString()}
                                icon={CheckCircle}
                            />

                            <StatsCard
                                label="New Users This Month"
                                value={stats.newUsersThisMonth.toString()}
                                icon={Users}
                            />

                            <StatsCard
                                label="Submissions Today"
                                value={stats.submissionsToday.toString()}
                                icon={FileText}
                            />

                        </div>


                        {/* Charts */}

                        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        User Growth
                                    </CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={250}
                                    >
                                        <LineChart
                                            data={stats.monthlyGrowth}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                className="stroke-border"
                                            />

                                            <XAxis
                                                dataKey="month"
                                                className="text-xs"
                                            />

                                            <YAxis className="text-xs" />

                                            <Tooltip />

                                            <Line
                                                type="monotone"
                                                dataKey="users"
                                                stroke="hsl(234, 89%, 30%)"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Monthly Submissions
                                    </CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={250}
                                    >
                                        <BarChart
                                            data={stats.monthlyGrowth}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                className="stroke-border"
                                            />

                                            <XAxis
                                                dataKey="month"
                                                className="text-xs"
                                            />

                                            <YAxis className="text-xs" />

                                            <Tooltip />

                                            <Bar
                                                dataKey="submissions"
                                                fill="hsl(38, 92%, 50%)"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>


                        {/* Competition Overview */}

                        <div className="mb-6 grid gap-6 lg:grid-cols-2">

                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Competition Overview
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-3">

                                    <p>
                                        Active :
                                        {" "}
                                        {stats.activeCompetitions}
                                    </p>

                                    <p>
                                        Upcoming :
                                        {" "}
                                        {stats.upcomingCompetitions}
                                    </p>

                                    <p>
                                        submissionClosed :
                                        {" "}
                                        {stats.submissionClosed}
                                    </p>

                                    <p>
                                        Judging :
                                        {" "}
                                        {stats.judgingCompetitions}
                                    </p>

                                    <p>
                                        Winners Announced :
                                        {" "}
                                        {stats.winnersAnnounced}
                                    </p>

                                    <p>
                                        Completed :
                                        {" "}
                                        {stats.completedCompetitions}
                                    </p>

                                </CardContent>
                            </Card>



                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Recent Activities
                                    </CardTitle>
                                </CardHeader>

                                <CardContent>

                                    <div className="space-y-4">

                                        {stats.recentActivities.length > 0 ? (

                                            stats.recentActivities.map(
                                                (activity,index)=>(
                                                    <div
                                                        key={index}
                                                    >
                                                        <p className="text-sm font-medium">
                                                            {activity.message}
                                                        </p>

                                                        <p className="text-xs text-muted-foreground">
                                                            {activity.date}
                                                        </p>
                                                    </div>
                                                )
                                            )

                                        ) : (

                                            <p className="text-sm text-muted-foreground">
                                                No recent activities.
                                            </p>

                                        )}

                                    </div>

                                </CardContent>
                            </Card>

                        </div>



                        {/* Country Statistics */}

                        <Card>

                            <CardHeader>
                                <CardTitle>
                                    Participation By Country
                                </CardTitle>
                            </CardHeader>

                            <CardContent>

                                {stats.participationByCountry.length > 0 ? (

                                    <div className="space-y-3">

                                        {stats.participationByCountry.map(
                                            (item)=>(
                                                <div
                                                    key={item.country}
                                                    className="flex items-center gap-4"
                                                >

                                                    <span className="w-24 text-sm">
                                                        {item.country}
                                                    </span>

                                                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">

                                                        <div
                                                            className="h-full rounded-full bg-primary"
                                                            style={{
                                                                width:`${item.percentage}%`
                                                            }}
                                                        />

                                                    </div>

                                                    <span className="w-10 text-right text-sm font-medium">
                                                        {item.percentage}%
                                                    </span>

                                                </div>
                                            )
                                        )}

                                    </div>

                                ) : (

                                    <p className="text-sm text-muted-foreground">
                                        No participation data available.
                                    </p>

                                )}

                            </CardContent>

                        </Card>

                    </div>
                </main>
            </div>

            <Footer />
        </div>
        </>
    );
}

export default AdminDashboard;