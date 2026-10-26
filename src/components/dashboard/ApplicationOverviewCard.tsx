import { Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import { DualStatusBadge } from '@/components/common/DualStatusBadge';
import type { ApplicationOverviewDto } from '@/types/dashboard';
import { deriveAvailabilityStatusFromOverview, deriveStatusFromOverview } from '@/utils/status';

interface ApplicationOverviewCardProps {
  overview: ApplicationOverviewDto;
}

export function ApplicationOverviewCard({ overview }: ApplicationOverviewCardProps) {
  const status = deriveStatusFromOverview(overview);
  const availabilityStatus = deriveAvailabilityStatusFromOverview(overview);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }} spacing={2}>
            <Typography variant="h5">{overview.name}</Typography>
            <DualStatusBadge
              mainStatus={status}
              availabilityStatus={availabilityStatus}
            />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {overview.code}
          </Typography>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle2">مولفه‌ها</Typography>
            <Typography variant="body2" color="text.secondary">
              {overview.activeComponents} فعال از {overview.totalComponents} مورد
            </Typography>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle2">پایش ها</Typography>
            <Typography variant="body2" color="text.secondary">
              {overview.activeChecks} مورد
            </Typography>
            <Typography variant="body2" color="success.main">
              {overview.healthyChecks} سالم
            </Typography>
            <Typography variant="body2" color="error.main">
              {overview.unhealthyChecks} ناسالم
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
