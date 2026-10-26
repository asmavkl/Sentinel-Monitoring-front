import { useApplications } from '@/features/applications/hooks/useApplications';
import { summarizeApplicationHealth } from '@/features/applications/utils/summarizeApplicationHealth';

export function useApplicationHealthSummary() {
  const query = useApplications();

  return {
    ...summarizeApplicationHealth(query.data),
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
