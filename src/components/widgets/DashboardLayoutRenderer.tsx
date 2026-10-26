import { Stack } from '@mui/material';
import { useMemo } from 'react';
import type { DashboardLayoutDto, WidgetDto } from '@/types/dashboard';
import { DashboardError, DashboardLoading } from '@/components/dashboard';
import { EmptyState } from '@/components/common';
import { DashboardSectionRenderer } from './DashboardSectionRenderer';
import { getVisibleDashboardSections } from '@/utils/dashboardLayout';

interface DashboardLayoutRendererProps {
  layout?: DashboardLayoutDto | null;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onWidgetClick?: (widget: WidgetDto) => void;
  onConfigureServerMetric?: (metricDefinitionId: number) => void;
  onConfigureServerAlert?: (metricDefinitionId: number) => void;
  onOpenServerMetricDetails?: (metricDefinitionId: number) => void;
}

export function DashboardLayoutRenderer({
  layout,
  isLoading = false,
  isError = false,
  error,
  onRetry,
  onWidgetClick,
  onConfigureServerMetric,
  onConfigureServerAlert,
  onOpenServerMetricDetails,
}: DashboardLayoutRendererProps) {
  const visibleSections = useMemo(
    () => (layout ? getVisibleDashboardSections(layout) : []),
    [layout],
  );

  if (isLoading) {
    return <DashboardLoading message="در حال بارگذاری ویجت های داشبورد..." />;
  }

  if (isError) {
    return (
      <DashboardError
        error={error}
        title="بارگذاری چیدمان داشبورد ممکن نیست"
        onRetry={onRetry}
      />
    );
  }

  if (!layout) {
    return (
      <EmptyState
        title="چیدمان داشبورد تعریف نشده است"
        description="برای این سامانه هنوز چیدمان داشبورد تنظیم نشده است."
      />
    );
  }

  if (layout.sections.length === 0 || visibleSections.length === 0) {
    return (
      <EmptyState
        title="داشبورد پیکربندی نشده است"
        description="No dashboard configured"
      />
    );
  }

  return (
    <Stack spacing={2} data-testid="dashboard-layout">
      {visibleSections.map((section) => (
        <DashboardSectionRenderer
          key={section.id}
          section={section}
          onWidgetClick={onWidgetClick}
          onConfigureServerMetric={onConfigureServerMetric}
          onConfigureServerAlert={onConfigureServerAlert}
          onOpenServerMetricDetails={onOpenServerMetricDetails}
        />
      ))}
    </Stack>
  );
}
