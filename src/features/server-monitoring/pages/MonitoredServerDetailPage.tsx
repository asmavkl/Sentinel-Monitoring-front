import { Alert, Stack } from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '@/api/apiUtils';
import { BackButton, EmptyState } from '@/components/common';
import { DashboardError, DashboardLoading } from '@/components/dashboard';
import { DashboardLayoutRenderer } from '@/components/widgets';
import { ThinHealthHeader } from '@/features/dashboard/components/ThinHealthHeader';
import { buildMonitoringServerDesignerRoute, ROUTES } from '@/routes/paths';
import { hasRenderableDashboardContent } from '@/utils/dashboardLayout';
import type { DashboardLayoutDto } from '@/types/dashboard';
import { ApplicationHealthStatus, ExecutionStatus } from '@/types/enums';
import { mapApplicationHealthStatus } from '@/utils/status';
import { getExecutionStatusLabel } from '../utils/executionStatus';
import { MetricAlertPolicyDialog } from '../components/MetricAlertPolicyDialog';
import { MetricCriteriaDialog } from '../components/MetricCriteriaDialog';
import { ServerDashboardView } from '../components/ServerDashboardView';
import { ServerMetricDetailDialog } from '../components/ServerMetricDetailDialog';
import { useMonitoredServer, useMonitoredServerStatus, useServerDashboard, useServerMetrics } from '../hooks';
import { useUserRoleSimple } from '@/features/auth/hooks/useUserRoleSimple';
import { canEditDashboard } from '@/auth/roleAccess';
import { buildMetricViews, type MetricView } from '../utils/metricGroups';

function resolveMetricView(
  metricDefinitionId: number,
  metricViews: MetricView[],
  layout: DashboardLayoutDto,
): MetricView {
  const metric = metricViews.find((item) => item.id === metricDefinitionId);
  if (metric) {
    return metric;
  }

  const source = layout.sections
    .flatMap((section) => section.widgets ?? [])
    .flatMap((widget) => widget.dataSources ?? [])
    .find((item) => item.serverMetricDefinitionId === metricDefinitionId);

  return {
    id: metricDefinitionId,
    name: source?.metricName ?? '',
    displayName: source?.metricDisplayName || source?.metricName || `متریک ${metricDefinitionId}`,
    description: null,
    instanceKey: null,
    unit: null,
    value: source?.value ?? null,
    timestamp: source?.timestamp ?? null,
    healthStatus: source?.healthStatus ?? ApplicationHealthStatus.Unknown,
  };
}

export function MonitoredServerDetailPage() {
  const params = useParams<{ id: string }>();
  const serverId = Number(params.id);
  const navigate = useNavigate();
  const { data: role } = useUserRoleSimple();
  const canEdit = canEditDashboard(role);
  const serverQuery = useMonitoredServer(serverId);
  const statusQuery = useMonitoredServerStatus(serverId);
  const metricsQuery = useServerMetrics(serverId);
  const dashboardQuery = useServerDashboard(serverId);
  const [criteriaMetric, setCriteriaMetric] = useState<MetricView | null>(null);
  const [alertMetric, setAlertMetric] = useState<MetricView | null>(null);
  const [detailMetric, setDetailMetric] = useState<MetricView | null>(null);

  const metricViews = useMemo(
    () => buildMetricViews(metricsQuery.data ?? [], statusQuery.data?.metrics ?? []),
    [metricsQuery.data, statusQuery.data?.metrics],
  );
  const healthStatus = statusQuery.data?.healthStatus ?? ApplicationHealthStatus.Unknown;
  const lastUpdatedAt = Math.max(
    serverQuery.dataUpdatedAt,
    statusQuery.dataUpdatedAt,
    metricsQuery.dataUpdatedAt,
    dashboardQuery.dataUpdatedAt,
  );
  const isRefreshing =
    serverQuery.isFetching || statusQuery.isFetching || metricsQuery.isFetching || dashboardQuery.isFetching;

  const refresh = () => {
    void serverQuery.refetch();
    void statusQuery.refetch();
    void metricsQuery.refetch();
    void dashboardQuery.refetch();
  };

  if (!Number.isFinite(serverId) || serverId <= 0) {
    return (
      <Stack spacing={1}>
        <BackButton fallbackTo={ROUTES.dashboards} />
        <EmptyState title="سرور نامعتبر است" description="شناسه سرور در آدرس صفحه معتبر نیست." />
      </Stack>
    );
  }

  if (serverQuery.isLoading && !serverQuery.data) {
    return (
      <Stack spacing={1}>
        <BackButton fallbackTo={ROUTES.dashboards} />
        <DashboardLoading message="در حال بارگذاری سرور..." />
      </Stack>
    );
  }

  if (serverQuery.isError || !serverQuery.data) {
    return (
      <Stack spacing={1}>
        <BackButton fallbackTo={ROUTES.dashboards} />
        <DashboardError
          error={serverQuery.error ?? new Error('سرور پیدا نشد.')}
          title="بارگذاری داشبورد سرور ممکن نیست"
          onRetry={refresh}
        />
      </Stack>
    );
  }

  const server = serverQuery.data;
  const dashboardMissing =
    dashboardQuery.isError &&
    dashboardQuery.error instanceof ApiError &&
    dashboardQuery.error.statusCode === 404;
  const designedLayout =
    dashboardQuery.data && hasRenderableDashboardContent(dashboardQuery.data)
      ? dashboardQuery.data
      : null;
  const refreshError =
    statusQuery.isError && statusQuery.dataUpdatedAt > 0 ? 'بروزرسانی وضعیت ممکن نیست' : null;
  const collectionStatus = statusQuery.data?.status;
  const collectionFailed = statusQuery.data != null && collectionStatus !== ExecutionStatus.Success;
  const collectionMessage =
    collectionStatus == null
      ? 'هنوز جمع‌آوری انجام نشده است.'
      : statusQuery.data?.errorMessage || getExecutionStatusLabel(collectionStatus);

  return (
    <Stack spacing={2}>
      <Stack spacing={0.75}>
        <BackButton fallbackTo={ROUTES.dashboards} />
        <ThinHealthHeader
          applicationName={server.name}
          status={mapApplicationHealthStatus(healthStatus)}
          lastUpdatedAt={lastUpdatedAt}
          isRefreshing={isRefreshing}
          refreshError={refreshError}
          onRefresh={refresh}
          onEdit={
            dashboardMissing || !canEdit
              ? undefined
              : () => navigate(buildMonitoringServerDesignerRoute(serverId))
          }
          canEdit={canEdit}
        />
      </Stack>

      {collectionFailed ? (
        <Alert severity={collectionStatus == null ? 'info' : 'error'}>{collectionMessage}</Alert>
      ) : null}

      {dashboardMissing ? (
        <Alert severity="info">
          این سرور داشبورد قابل ویرایش ندارد. سرورهای قبلی با ساخت دوبارهٔ سرور داشبورد خالی می‌گیرند.
        </Alert>
      ) : null}

      {dashboardQuery.isError && !dashboardMissing ? (
        <DashboardError
          error={dashboardQuery.error}
          title="بارگذاری داشبورد ممکن نیست"
          onRetry={() => void dashboardQuery.refetch()}
        />
      ) : null}

      {designedLayout ? (
        <DashboardLayoutRenderer
          layout={designedLayout}
          onConfigureServerMetric={(metricDefinitionId) => {
            setCriteriaMetric(resolveMetricView(metricDefinitionId, metricViews, designedLayout));
          }}
          onConfigureServerAlert={(metricDefinitionId) => {
            setAlertMetric(resolveMetricView(metricDefinitionId, metricViews, designedLayout));
          }}
          onOpenServerMetricDetails={(metricDefinitionId) => {
            setDetailMetric(resolveMetricView(metricDefinitionId, metricViews, designedLayout));
          }}
        />
      ) : (
        <ServerDashboardView
          serverId={serverId}
          metrics={metricViews}
          onConfigureCriteria={setCriteriaMetric}
          onConfigureAlert={setAlertMetric}
        />
      )}

      <ServerMetricDetailDialog
        open={detailMetric != null}
        serverId={serverId}
        metric={detailMetric}
        onClose={() => setDetailMetric(null)}
      />

      <MetricCriteriaDialog
        open={criteriaMetric != null}
        serverId={serverId}
        metric={criteriaMetric}
        onClose={() => setCriteriaMetric(null)}
      />

      <MetricAlertPolicyDialog
        open={alertMetric != null}
        metric={alertMetric}
        onClose={() => setAlertMetric(null)}
      />
    </Stack>
  );
}
