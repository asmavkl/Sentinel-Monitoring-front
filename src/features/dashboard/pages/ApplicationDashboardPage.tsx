import { Stack } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardError, DashboardLoading } from '@/components/dashboard';
import { DashboardLayoutRenderer } from '@/components/widgets';
import { BackButton, EmptyState } from '@/components/common';
import { ThinHealthHeader } from '@/features/dashboard/components/ThinHealthHeader';
import {
  useApplicationDashboard,
  useApplicationOverview,
  useDashboardRefresh,
  useWidgetClick,
} from '@/features/dashboard/hooks';
import { buildDashboardDesignerRoute, ROUTES } from '@/routes/paths';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUserRoleSimple } from '@/features/auth/hooks/useUserRoleSimple';
import { canEditDashboard } from '@/auth/roleAccess';
import { deriveAvailabilityStatusFromOverview, deriveStatusFromOverview } from '@/utils/status';

export function ApplicationDashboardPage() {
  const { applicationId: applicationIdParam } = useParams<{ applicationId: string }>();
  const applicationId = Number(applicationIdParam);
  const navigate = useNavigate();
  const setSelectedApplicationId = useDashboardStore((state) => state.setSelectedApplicationId);
  const { data: role } = useUserRoleSimple();
  const canEdit = canEditDashboard(role);

  const overviewQuery = useApplicationOverview(applicationId);
  const dashboardQuery = useApplicationDashboard(applicationId);
  const { refreshDashboard, isRefreshing, refreshError } = useDashboardRefresh(applicationId);
  const onWidgetClick = useWidgetClick();

  useEffect(() => {
    if (applicationId > 0) {
      setSelectedApplicationId(applicationId);
    }

    return () => {
      setSelectedApplicationId(null);
    };
  }, [applicationId, setSelectedApplicationId]);

  if (!applicationId || Number.isNaN(applicationId)) {
    return (
      <Stack spacing={1}>
        <BackButton fallbackTo={ROUTES.applications} />
        <EmptyState
          title="سامانه نامعتبر است"
          description="شناسه سامانه در آدرس صفحه معتبر نیست."
        />
      </Stack>
    );
  }

  const overview = overviewQuery.data;
  const isInitialLoading = overviewQuery.isLoading && !overviewQuery.data;
  const isInitialError = overviewQuery.isError && !overviewQuery.data;
  const lastUpdatedAt = Math.max(overviewQuery.dataUpdatedAt, dashboardQuery.dataUpdatedAt);
  const isRefreshInFlight =
    isRefreshing || overviewQuery.isFetching || dashboardQuery.isFetching;
  const autoRefreshError =
    refreshError ??
    ((overviewQuery.isError && overviewQuery.dataUpdatedAt > 0) ||
      (dashboardQuery.isError && dashboardQuery.dataUpdatedAt > 0)
      ? 'بروزرسانی داشبورد ممکن نیست'
      : null);

  if (isInitialLoading) {
    return (
      <Stack spacing={1}>
        <BackButton fallbackTo={ROUTES.applications} />
        <DashboardLoading />
      </Stack>
    );
  }

  if (isInitialError) {
    return (
      <Stack spacing={1}>
        <BackButton fallbackTo={ROUTES.applications} />
        <DashboardError
          error={overviewQuery.error}
          title="بارگذاری داشبورد ممکن نیست"
          onRetry={() => {
            void overviewQuery.refetch();
            void dashboardQuery.refetch();
          }}
        />
      </Stack>
    );
  }

  if (!overview) {
    return (
      <Stack spacing={1}>
        <BackButton fallbackTo={ROUTES.applications} />
        <EmptyState
          title="سامانه پیدا نشد"
          description="اطلاعاتی برای این سامانه در دسترس نیست."
        />
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack spacing={0.75}>
        <BackButton fallbackTo={ROUTES.applications} />
        <ThinHealthHeader
          applicationName={overview.name}
          status={deriveStatusFromOverview(overview)}
          availabilityStatus={deriveAvailabilityStatusFromOverview(overview)}
          lastUpdatedAt={lastUpdatedAt}
          isRefreshing={isRefreshInFlight}
          refreshError={autoRefreshError}
          onRefresh={() => void refreshDashboard()}
          onEdit={() => navigate(buildDashboardDesignerRoute(applicationId))}
          canEdit={canEdit}
        />
      </Stack>

      <DashboardLayoutRenderer
        layout={dashboardQuery.data}
        isLoading={dashboardQuery.isLoading && !dashboardQuery.data}
        isError={dashboardQuery.isError && !dashboardQuery.data}
        error={dashboardQuery.error}
        onRetry={() => void dashboardQuery.refetch()}
        onWidgetClick={onWidgetClick}
      />
    </Stack>
  );
}

export const DashboardPage = ApplicationDashboardPage;
