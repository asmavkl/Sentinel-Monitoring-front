import { Alert, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import { getErrorMessage } from '@/api/apiUtils';
import { DashboardLoading } from '@/components/dashboard';
import { CriteriaRuleEditor } from '@/features/checks/components/CriteriaRuleEditor';
import { CriteriaOperator } from '@/types/enums';
import type { CriteriaDefinitionDto, CriteriaRuleDto } from '@/types/checkManagement';
import type { ServerMetricCriteriaDto } from '@/types/monitoredServers';
import { useServerMetricCriteria, useUpdateServerMetricCriteria } from '../hooks';
import type { MetricView } from '../utils/metricGroups';

interface MetricCriteriaDialogProps {
  open: boolean;
  serverId: number;
  metric: MetricView | null;
  onClose: () => void;
}

function toEditorCriteria(
  metricDefinitionId: number,
  criteria: ServerMetricCriteriaDto | null | undefined,
): CriteriaDefinitionDto | undefined {
  if (!criteria) {
    return undefined;
  }

  return {
    id: criteria.id,
    checkDefinitionId: metricDefinitionId,
    isActive: criteria.isActive,
    rules: criteria.rules,
  };
}

function toUpdateRules(rules: CriteriaRuleDto[]) {
  return rules.map((rule, index) => {
    if (rule.operator === CriteriaOperator.Between) {
      return {
        operator: rule.operator,
        expectedValue: null,
        minValue: rule.minValue ?? null,
        maxValue: rule.maxValue ?? null,
        healthStatus: rule.healthStatus,
        priority: index + 1,
      };
    }

    return {
      operator: rule.operator,
      expectedValue: rule.expectedValue ?? null,
      minValue: null,
      maxValue: null,
      healthStatus: rule.healthStatus,
      priority: index + 1,
    };
  });
}

export function MetricCriteriaDialog({ open, serverId, metric, onClose }: MetricCriteriaDialogProps) {
  const metricId = open ? (metric?.id ?? null) : null;
  const criteriaQuery = useServerMetricCriteria(serverId, metricId, open);
  const updateCriteria = useUpdateServerMetricCriteria();

  const handleSave = async (criteria: CriteriaDefinitionDto) => {
    if (!metric) {
      return;
    }

    try {
      await updateCriteria.mutateAsync({
        serverId,
        metricDefinitionId: metric.id,
        payload: {
          isActive: criteria.isActive,
          rules: toUpdateRules(criteria.rules),
        },
      });
      onClose();
    } catch {
      // The dialog keeps the editor and shows the API message.
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle>{metric ? `معیار ${metric.displayName}` : 'معیار'}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          معیار متعلق به همین متریک است، نه کل سرور. مثال CPU فقط راهنماست و ذخیره نمی‌شود: زیر ۷۰
          سالم، از ۷۰ تا قبل از ۸۵ هشدار، از ۸۵ به بالا بحرانی.
        </Typography>
        {criteriaQuery.isLoading ? <DashboardLoading message="در حال بارگذاری معیار..." /> : null}
        {criteriaQuery.isError ? <Alert severity="error">{getErrorMessage(criteriaQuery.error)}</Alert> : null}
        {updateCriteria.error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {getErrorMessage(updateCriteria.error)}
          </Alert>
        ) : null}
        {criteriaQuery.isSuccess && metric ? (
          <CriteriaRuleEditor
            key={`${metric.id}-${criteriaQuery.data?.id ?? 'new'}-${criteriaQuery.dataUpdatedAt}`}
            criteria={toEditorCriteria(metric.id, criteriaQuery.data)}
            checkId={metric.id}
            isLoading={updateCriteria.isPending}
            activeSwitchLabel="فعال — در سلامت سرور اثر دارد"
            inactiveSwitchLabel="غیرفعال — در سلامت سرور اثر ندارد"
            activeHint="اگر معیار فعال باشد و هیچ قانونی با مقدار جور نشود، سلامت سرور خارج از سرویس می‌شود."
            inactiveHint="معیار غیرفعال در محاسبه سلامت اثری ندارد. این با نبود معیار یکی نیست."
            betweenHint="بازه «بین» نیمه‌باز است: حد پایین شامل می‌شود و حد بالا شامل نمی‌شود."
            onCancel={onClose}
            onSave={(criteria) => {
              void handleSave(criteria);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
