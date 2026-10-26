import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { AlertPolicyPanel } from '@/features/alerts/components/AlertPolicyPanel';
import type { MetricView } from '../utils/metricGroups';

interface MetricAlertPolicyDialogProps {
  open: boolean;
  metric: MetricView | null;
  onClose: () => void;
}

export function MetricAlertPolicyDialog({ open, metric, onClose }: MetricAlertPolicyDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle>{metric ? `اعلان ${metric.displayName}` : 'اعلان'}</DialogTitle>
      <DialogContent dividers>
        {metric ? (
          <AlertPolicyPanel
            owner={{ type: 'serverMetric', serverMetricDefinitionId: metric.id }}
            enabled={open}
            variant="plain"
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
