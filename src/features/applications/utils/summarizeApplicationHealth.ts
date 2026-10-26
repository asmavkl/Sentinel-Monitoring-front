import type { ApplicationListItem } from '@/types/applications';

export interface ApplicationHealthSummary {
  up: number;
  warning: number;
  down: number;
  unknown: number;
  outOfService: number;
  total: number;
}

export function summarizeApplicationHealth(
  applications: ApplicationListItem[] | undefined,
): ApplicationHealthSummary {
  const summary: ApplicationHealthSummary = {
    up: 0,
    warning: 0,
    down: 0,
    unknown: 0,
    outOfService: 0,
    total: 0,
  };

  if (!applications?.length) {
    return summary;
  }

  applications.forEach((application) => {
    summary.total += 1;

    if (application.status === 'UP') {
      summary.up += 1;
      return;
    }

    if (application.status === 'WARNING') {
      summary.warning += 1;
      return;
    }

    if (application.status === 'DOWN') {
      summary.down += 1;
      return;
    }

    if (application.status === 'OUT_OF_SERVICE') {
      summary.outOfService += 1;
      return;
    }

    summary.unknown += 1;
  });

  return summary;
}
