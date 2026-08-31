import { useTranslation } from '@/lib/i18n';
import { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Navbar,
  Footer,
  DashboardSidebar,
  PageHeader,
} from "@/components/layout";

interface AuditLog {
  id: number;
  action: string;
  table_name: string;
  record_id: number | null;
  details: string | null;
  ip_address: string | null;
  created_at: string;

  user: {
    id: number;
    full_name: string;
  } | null;
}

interface Props {
  auditLogs: AuditLog[];
  [key: string]: unknown;
}

export default function AuditLogsPage() {
  const { t } = useTranslation();

  const { auditLogs } = usePage<Props>().props;

  const [search, setSearch] = useState("");

  const getBadgeVariant = (
    action: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (action.toUpperCase()) {
      case "DELETE":
        return "destructive";

      case "CREATE":
        return "default";

      case "UPDATE":
        return "secondary";

      default:
        return "outline";
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    const searchValue = search.toLowerCase();

    return (
      log.action.toLowerCase().includes(searchValue) ||
      log.table_name.toLowerCase().includes(searchValue) ||
      log.details?.toLowerCase().includes(searchValue) ||
      log.ip_address?.toLowerCase().includes(searchValue) ||
      log.user?.full_name
        ?.toLowerCase()
        .includes(searchValue)
    );
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Head title={t('admin.auditLogs.auditLogsSecurityActivity')} />
      <Navbar />

      <div className="flex flex-col lg:flex-row flex-1 min-w-0">
        <DashboardSidebar />

        <main className="flex-1 overflow-auto min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 min-w-0">
            <PageHeader
              title={t('sidebar.auditLogs')}
              description={t('admin.auditLogs.platformSecurityAndActivityMonitoring')}
            />

            <div className="mb-6">
              <Input
                placeholder={t('admin.auditLogs.searchAuditLogs')}
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="max-w-md w-full"
              />
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">
                      {t('admin.auditLogs.timestamp')}</th>

                    <th className="px-4 py-3 text-left font-medium">
                      {t('admin.auditLogs.operator')}</th>

                    <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">
                      {t('admin.auditLogs.action')}</th>

                    <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
                      {t('admin.auditLogs.table')}</th>

                    <th className="hidden px-4 py-3 text-left font-medium lg:table-cell">
                      {t('admin.auditLogs.details')}</th>

                    <th className="hidden px-4 py-3 text-left font-medium xl:table-cell">
                      {t('admin.auditLogs.ipAddress')}</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-t hover:bg-muted/50"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(
                            log.created_at
                          ).toLocaleString()}
                        </td>

                        <td className="px-4 py-3 font-medium whitespace-nowrap">
                          {log.user?.full_name ??
                            "System"}
                        </td>

                        <td className="hidden px-4 py-3 sm:table-cell whitespace-nowrap">
                          <Badge
                            variant={getBadgeVariant(
                              log.action
                            )}
                          >
                            {log.action}
                          </Badge>
                        </td>

                        <td className="hidden px-4 py-3 md:table-cell whitespace-nowrap">
                          {log.table_name}
                        </td>

                        <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                          {log.details ??
                            (log.record_id
                              ? `Record #${log.record_id}`
                              : "-")}
                        </td>

                        <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground xl:table-cell whitespace-nowrap">
                          {log.ip_address ?? "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-10 text-center text-muted-foreground"
                      >
                        {t('admin.auditLogs.noAuditLogsFound')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}