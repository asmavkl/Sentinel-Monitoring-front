import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { alertPolicyApi } from '@/api/alertPolicyApi';
import type { AlertPolicyOwner, UpsertAlertPolicyRequest } from '@/types/alertPolicy';

export const alertPolicyQueryKeys = {
  all: ['alert-policy'] as const,
  policy: (owner: AlertPolicyOwner) => [...alertPolicyQueryKeys.all, owner] as const,
  incidents: (policyId: number) => [...alertPolicyQueryKeys.all, 'incidents', policyId] as const,
};

export function useAlertPolicy(owner: AlertPolicyOwner, enabled = true) {
  return useQuery({
    queryKey: alertPolicyQueryKeys.policy(owner),
    queryFn: () =>
      owner.type === 'check'
        ? alertPolicyApi.getForCheck(owner.checkId)
        : alertPolicyApi.getForServerMetric(owner.serverMetricDefinitionId),
    enabled,
  });
}

export function useAlertIncidents(policyId: number | null) {
  return useQuery({
    queryKey: alertPolicyQueryKeys.incidents(policyId ?? 0),
    queryFn: () => alertPolicyApi.getIncidents(policyId ?? 0),
    enabled: policyId != null,
  });
}

export function useSaveAlertPolicy(owner: AlertPolicyOwner) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertAlertPolicyRequest) =>
      owner.type === 'check'
        ? alertPolicyApi.saveForCheck(owner.checkId, payload)
        : alertPolicyApi.saveForServerMetric(owner.serverMetricDefinitionId, payload),
    onSuccess: async (policy) => {
      await queryClient.invalidateQueries({ queryKey: alertPolicyQueryKeys.policy(owner) });
      await queryClient.invalidateQueries({ queryKey: alertPolicyQueryKeys.incidents(policy.id) });
    },
  });
}
