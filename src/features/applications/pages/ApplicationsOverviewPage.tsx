import AddIcon from '@mui/icons-material/Add';
import { Button, Stack } from '@mui/material';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardError, DashboardLoading } from '@/components/dashboard';
import { MonitoringEmptyState, MonitoringPageContainer } from '@/components/monitoring/layout';
import { ApplicationsWall } from '@/features/applications/components';
import { useApplications } from '@/features/applications/hooks/useApplications';
import {
  useMonitoredServerStatuses,
  useMonitoredServers,
} from '@/features/server-monitoring/hooks';
import { ServersWall } from '@/features/server-monitoring/components/ServersWall';
import { buildDashboardRoute, buildMonitoringServerRoute, ROUTES } from '@/routes/paths';
import type { MonitoredServerStatusDto } from '@/types/monitoredServers';

const EMPTY_TITLE = 'در حال حاضر سامانه ای برای پایش تعریف نشده است';

export function ApplicationsOverviewPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useApplications();
  const serversQuery = useMonitoredServers();
  const servers = useMemo(() => serversQuery.data ?? [], [serversQuery.data]);
  const statusQueries = useMonitoredServerStatuses(servers.map((server) => server.id));
  const statusById = useMemo(() => {
    const map = new Map<number, MonitoredServerStatusDto | undefined>();
    servers.forEach((server, index) => {
      map.set(server.id, statusQueries[index]?.data);
    });
    return map;
  }, [servers, statusQueries]);

  const openApplication = (applicationId: number) => {
    navigate(buildDashboardRoute(applicationId));
  };

  if (isLoading) {
    return (
      <MonitoringPageContainer>
        <DashboardLoading message="در حال بارگذاری سامانه ها..." />
      </MonitoringPageContainer>
    );
  }

  if (isError) {
    return (
      <MonitoringPageContainer>
        <DashboardError
          error={error}
          title="امکان بارگذاری سامانه ها وجود ندارد"
          onRetry={() => {
            void refetch();
          }}
        />
      </MonitoringPageContainer>
    );
  }

  const serversReady = serversQuery.isSuccess || serversQuery.isError;
  const hasApplications = (data?.length ?? 0) > 0;
  const hasServers = servers.length > 0;

  if (!isError && !hasApplications && serversReady && !hasServers) {
    return (
      <MonitoringPageContainer>
        <MonitoringEmptyState
          title={EMPTY_TITLE}
          description="این صفحه وضعیت سلامت سامانه‌ها و سرورهای SNMP را نشان می‌دهد. برای تعریف سامانه، از مدیریت پایش استفاده کنید."
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(ROUTES.monitoringApplications)}
              sx={{ mt: 1 }}
            >
              تعریف سامانه ها
            </Button>
          }
        />
      </MonitoringPageContainer>
    );
  }

  return (
    <MonitoringPageContainer>
      <Stack spacing={2}>
        {hasApplications && data ? (
          <ApplicationsWall applications={data} onOpenApplication={openApplication} />
        ) : null}
        {serversQuery.isError ? (
          <DashboardError
            error={serversQuery.error}
            title="امکان بارگذاری سرورهای SNMP وجود ندارد"
            onRetry={() => {
              void serversQuery.refetch();
            }}
          />
        ) : null}
        <ServersWall
          servers={servers}
          statusById={statusById}
          onOpenServer={(serverId) => navigate(buildMonitoringServerRoute(serverId))}
        />
      </Stack>
    </MonitoringPageContainer>
  );
}
