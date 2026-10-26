import { Stack } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardError, DashboardLoading } from '@/components/dashboard';
import { BackButton, EmptyState } from '@/components/common';
import {
  useApplicationComponents,
  useApplicationDashboard,
  useApplicationOverview,
} from '@/features/dashboard/hooks';
import { DashboardDesignerPage } from './DashboardDesignerPage';
import { buildDashboardRoute, ROUTES } from '@/routes/paths';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUserRoleSimple } from '@/features/auth/hooks/useUserRoleSimple';
import { canEditDashboard } from '@/auth/roleAccess';

export function ApplicationDashboardDesignerPage() {
  const { applicationId: applicationIdParam } = useParams<{ applicationId: string }>();
  const applicationId = Number(applicationIdParam);
  const navigate = useNavigate();
  const { data: role } = useUserRoleSimple();
  const canEdit = canEditDashboard(role);
  const enterEditMode = useDashboardStore((state) => state.enterEditMode);
  const exitEditMode = useDashboardStore((state) => state.exitEditMode);
  const setSelectedApplicationId = useDashboardStore((state) => state.setSelectedApplicationId);

  const overviewQuery = useApplicationOverview(applicationId);
  const componentsQuery = useApplicationComponents(applicationId);
  const dashboardQuery = useApplicationDashboard(applicationId);

  useEffect(() => {
    if (canEdit) {
      enterEditMode();
    }

    if (applicationId > 0) {
      setSelectedApplicationId(applicationId);
    }

    return () => {
      exitEditMode();
      setSelectedApplicationId(null);
    };
  }, [applicationId, canEdit, enterEditMode, exitEditMode, setSelectedApplicationId]);

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

  const isInitialLoading =
    (overviewQuery.isLoading && !overviewQuery.data) ||
    (componentsQuery.isLoading && !componentsQuery.data) ||
    (dashboardQuery.isLoading && !dashboardQuery.data);
  const isInitialError =
    (dashboardQuery.isError && !dashboardQuery.data) ||
    (overviewQuery.isError && !overviewQuery.data);

  const dashboardRoute = buildDashboardRoute(applicationId);

  if (isInitialLoading) {
    return (
      <Stack spacing={1}>
        <BackButton fallbackTo={dashboardRoute} />
        <DashboardLoading message="در حال بارگذاری ویجت های داشبورد..." />
      </Stack>
    );
  }

  if (isInitialError || !dashboardQuery.data) {
    return (
      <Stack spacing={1}>
        <BackButton fallbackTo={dashboardRoute} />
        <DashboardError
          error={dashboardQuery.error ?? overviewQuery.error}
          title="بارگذاری چیدمان داشبورد ممکن نیست"
          onRetry={() => {
            void overviewQuery.refetch();
            void componentsQuery.refetch();
            void dashboardQuery.refetch();
          }}
        />
      </Stack>
    );
  }

  if (!canEdit) {
    return (
      <Stack spacing={1}>
        <BackButton fallbackTo={dashboardRoute} />
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
      applicationId={applicationId}
      layout={dashboardQuery.data}
      components={componentsQuery.data ?? []}
      applicationName={overviewQuery.data?.name}
      onExit={() => navigate(dashboardRoute)}
    />
  );
}
