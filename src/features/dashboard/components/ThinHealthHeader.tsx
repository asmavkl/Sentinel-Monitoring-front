import { Box, Button, Stack, Typography } from '@mui/material';
import { DualStatusBadge } from '@/components/common/DualStatusBadge';
import { AutoRefreshToggle } from '@/features/dashboard/components/AutoRefreshToggle';
import { DashboardRefreshButton } from '@/features/dashboard/components/DashboardRefreshButton';
import { LastUpdatedLabel } from '@/features/dashboard/components/LastUpdatedLabel';
import type { MonitoringStatus } from '@/utils/status';

interface ThinHealthHeaderProps {
  applicationName: string;
  status: MonitoringStatus;
  availabilityStatus?: MonitoringStatus;
  lastUpdatedAt?: number | null;
  isRefreshing?: boolean;
  refreshError?: string | null;
  onRefresh: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
}

export function ThinHealthHeader({
  applicationName,
  status,
  availabilityStatus,
  lastUpdatedAt,
  isRefreshing = false,
  refreshError,
  onRefresh,
  onEdit,
  canEdit = true,
}: ThinHealthHeaderProps) {
  return (
    <Box
      data-testid="thin-health-header"
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {applicationName}
            </Typography>
            <DualStatusBadge
              mainStatus={status}
              availabilityStatus={availabilityStatus}
            />
          </Stack>
          <LastUpdatedLabel updatedAt={lastUpdatedAt} />
          {refreshError ? (
            <Typography variant="caption" color="error">
              {refreshError}
            </Typography>
          ) : null}
        </Stack>

        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <AutoRefreshToggle />
          <DashboardRefreshButton loading={isRefreshing} onRefresh={onRefresh} />
          {onEdit && canEdit ? (
            <Button variant="outlined" size="small" onClick={onEdit}>
              ویرایش داشبورد
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
}
