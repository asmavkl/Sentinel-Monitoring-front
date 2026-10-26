import { Stack } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardError, DashboardLoading } from '@/components/dashboard';
import { BackButton, EmptyState } from '@/components/common';
import { useDashboardStore } from '@/store/dashboardStore';
import { buildMonitoringServerRoute, ROUTES } from '@/routes/paths';
import { useMonitoredServer, useServerMetrics } from '@/features/server-monitoring/hooks';
import { useServerDashboard } from '@/features/server-monitoring/hooks/useServerDashboard';
import { useUserRoleSimple } from '@/features/auth/hooks/useUserRoleSimple';
import { canEditDashboard } from '@/auth/roleAccess';
import { DashboardDesignerPage } from './DashboardDesignerPage';

export function ServerDashboardDesignerPage() {
  const params = useParams<{ id: string }>();
  const serverId = Number(params.id);
  const navigate = useNavigate();
  const { data: role } = useUserRoleSimple();
  const canEdit = canEditDashboard(role);
  const enterEditMode = useDashboardStore((state) => state.enterEditMode);
  const exitEditMode = useDashboardStore((state) => state.exitEditMode);
  const serverQuery = useMonitoredServer(serverId);
  const metricsQuery = useServerMetrics(serverId);
  const dashboardQuery = useServerDashboard(serverId);
  const serverRoute = buildMonitoringServerRoute(serverId);

  console.log('ServerDashboardDesignerPage:', {
    serverId,
    metricsData: metricsQuery.data,
    serverMetricsLength: metricsQuery.data?.length,
  });

  useEffect(() => {
    if (canEdit) {
      enterEditMode();
    }
    return () => {
      exitEditMode();
    };
  }, [canEdit, enterEditMode, exitEditMode]);

  if (!Number.isFinite(serverId) || serverId <= 0) {
    return (
      <Stack spacing={1}>
        <BackButton fallbackTo={ROUTES.monitoringServers} />
        <EmptyState title="سرور نامعتبر است" description="شناسه سرور در آدرس صفحه معتبر نیست." />
      </Stack>
    );
  }

  const isInitialLoading =
    (serverQuery.isLoading && !serverQuery.data) ||
    (metricsQuery.isLoading && !metricsQuery.data) ||
    (dashboardQuery.isLoading && !dashboardQuery.data);

  if (isInitialLoading) {
    return (
      <Stack spacing={1}>
        <BackButton fallbackTo={serverRoute} />
        <DashboardLoading message="در حال بارگذاری ویجت های داشبورد..." />
      </Stack>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <Stack spacing={1}>
        <BackButton fallbackTo={serverRoute} />
        <DashboardError
          error={dashboardQuery.error ?? new Error('داشبورد سرور پیدا نشد.')}
          title="بارگذاری چیدمان داشبورد ممکن نیست"
          onRetry={() => {
            void serverQuery.refetch();
            void metricsQuery.refetch();
            void dashboardQuery.refetch();
          }}
        />
      </Stack>
    );
  }

  if (!canEdit) {
    return (
      <Stack spacing={1}>
        <BackButton fallbackTo={serverRoute} />
        <EmptyState
          title="دسترسی غیرمجاز"
          description="شما دسترسی ویرایش داشبورد را ندارید."
        />
      </Stack>
    );
  }

  return (
    <DashboardDesignerPage
      key={dashboardQuery.data.dashboardId}
      applicationId={0}
      serverId={serverId}
      serverMetrics={metricsQuery.data ?? []}
      serverName={serverQuery.data?.name}
      isServerMode={true}
      layout={dashboardQuery.data}
      components={[]}
      applicationName={serverQuery.data?.name}
      exitPath={serverRoute}
      onExit={() => navigate(serverRoute)}
    />
  );
}
