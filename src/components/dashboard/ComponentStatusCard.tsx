import { Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material';
import { StatusBadge } from '@/components/common';
import type { ComponentStatusDto } from '@/types/dashboard';
import { mapApplicationHealthStatus } from '@/utils/status';

interface ComponentStatusCardProps {
  component: ComponentStatusDto;
  onClick?: (componentId: number) => void;
}

export function ComponentStatusCard({ component, onClick }: ComponentStatusCardProps) {
  const status = mapApplicationHealthStatus(component.status);
  const failedChecks = component.unhealthyChecks;

  const content = (
    <CardContent>
      <Stack spacing={1.5}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }} spacing={2}>
          <Typography variant="h6">{component.name}</Typography>
          <StatusBadge status={status} />
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {component.activeChecks} پایش
        </Typography>

        <Typography variant="body2" color={failedChecks > 0 ? 'error.main' : 'text.secondary'}>
          {failedChecks} ناموفق
        </Typography>
      </Stack>
    </CardContent>
  );

  if (!onClick) {
    return <Card>{content}</Card>;
  }

  return (
    <Card>
      <CardActionArea onClick={() => onClick(component.componentId)}>{content}</CardActionArea>
    </Card>
  );
}
