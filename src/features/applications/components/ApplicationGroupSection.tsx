import { Box, Grid } from '@mui/material';
import { ApplicationHealthCard } from './ApplicationHealthCard';
import { MonitoringSectionHeader } from '@/components/monitoring/layout';
import type { ApplicationGroupColor } from '@/features/applications/utils/groupApplications';
import type { ApplicationListItem } from '@/types/applications';

interface ApplicationGroupSectionProps {
  title: string;
  applications: ApplicationListItem[];
  color: ApplicationGroupColor;
  onOpenApplication: (applicationId: number) => void;
}

export function ApplicationGroupSection({
  title,
  applications,
  color,
  onOpenApplication,
}: ApplicationGroupSectionProps) {
  if (applications.length === 0) {
    return null;
  }

  return (
    <Box data-testid="application-group-section" data-group-color={color}>
      <Box sx={{ mb: 1 }}>
        <MonitoringSectionHeader title={title} color={color} />
      </Box>

      <Grid container spacing={1}>
        {applications.map((application) => (
          <Grid key={application.id} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
            <ApplicationHealthCard application={application} onOpen={onOpenApplication} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
