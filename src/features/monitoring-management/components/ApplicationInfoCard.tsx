import { Chip, Stack, Typography } from '@mui/material';
import { MonitoringTableCard } from '@/components/monitoring/layout';
import type { MonitoringApplicationDto } from '@/types/monitoringManagement';

interface ApplicationInfoCardProps {
  application: MonitoringApplicationDto;
}

export function ApplicationInfoCard({ application }: ApplicationInfoCardProps) {
  return (
    <MonitoringTableCard title="اطلاعات سامانه">
      <Stack spacing={1} sx={{ p: 2 }} data-testid="application-info-card">
        <InfoRow label="نام" value={application.name} />
        <InfoRow label="کد" value={application.code} />
        <InfoRow label="توضیحات" value={application.description || '—'} />
        {/* <InfoRow label="Base URL" value={application.baseUrl || '—'} /> */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            وضعیت:
          </Typography>
          <Chip
            size="small"
            label={application.isActive ? 'فعال' : 'غیرفعال'}
            color={application.isActive ? 'info' : 'default'}
          />
        </Stack>
      </Stack>
    </MonitoringTableCard>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
      <Typography variant="body2" color="text.secondary">
        {label}:
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}
