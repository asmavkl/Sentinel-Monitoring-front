import { Stack } from '@mui/material';
import { ApplicationGroupSection } from './ApplicationGroupSection';
import { groupApplications } from '@/features/applications/utils/groupApplications';
import type { ApplicationListItem } from '@/types/applications';

interface ApplicationsWallProps {
  applications: ApplicationListItem[];
  onOpenApplication: (applicationId: number) => void;
}

export function ApplicationsWall({ applications, onOpenApplication }: ApplicationsWallProps) {
  const groups = groupApplications(applications);

  return (
    <Stack data-testid="applications-wall" spacing={1.5} dir="rtl">
      {groups.map((group) => (
        <ApplicationGroupSection
          key={group.key}
          title={group.title}
          applications={group.applications}
          color={group.color}
          onOpenApplication={onOpenApplication}
        />
      ))}
    </Stack>
  );
}
