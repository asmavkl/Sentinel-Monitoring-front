import { Alert, Box, Card, CardContent, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { getErrorMessage, toApiError } from '@/api/apiUtils';
import type { AlertPolicyOwner } from '@/types/alertPolicy';
import { formatPersianDateTime } from '@/utils/dateUtils';
import { useAlertIncidents, useAlertPolicy, useSaveAlertPolicy } from '../hooks/useAlertPolicy';
import {
  ALERT_INCIDENT_STATUS_LABELS,
  NOTIFICATION_DELIVERY_STATUS_LABELS,
} from '../utils/alertPolicyForm';
import { AlertPolicyEditor } from './AlertPolicyEditor';

interface AlertPolicyPanelProps {
  owner: AlertPolicyOwner;
  enabled?: boolean;
  variant?: 'card' | 'plain';
}

export function AlertPolicyPanel({ owner, enabled = true, variant = 'card' }: AlertPolicyPanelProps) {
  const policyQuery = useAlertPolicy(owner, enabled);
  const savePolicy = useSaveAlertPolicy(owner);
  const policy = policyQuery.data ?? null;
  const incidentsQuery = useAlertIncidents(policy?.id ?? null);

  const content = (
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="h6">اعلان ایمیل</Typography>
            {policy ? (
              <Chip size="small" label={policy.isActive ? 'فعال' : 'غیرفعال'} color={policy.isActive ? 'success' : 'default'} />
            ) : null}
          </Stack>

          {policyQuery.isLoading ? (
            <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 120 }}>
              <CircularProgress size={28} />
            </Box>
          ) : null}
          {policyQuery.isError ? <Alert severity="error">{getErrorMessage(policyQuery.error)}</Alert> : null}

          {policyQuery.isSuccess ? (
            <AlertPolicyEditor
              key={policy ? `policy-${policy.id}` : 'new-policy'}
              policy={policy}
              isSaving={savePolicy.isPending}
              saveError={savePolicy.error ? formatSaveError(savePolicy.error) : null}
              onSave={(payload) => {
                savePolicy.mutate(payload);
              }}
            />
          ) : null}

          {policy ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2">حادثه‌ها</Typography>
              {incidentsQuery.isLoading ? <CircularProgress size={20} /> : null}
              {incidentsQuery.isError ? <Alert severity="error">{getErrorMessage(incidentsQuery.error)}</Alert> : null}
              {incidentsQuery.isSuccess && incidentsQuery.data.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  حادثه‌ای ثبت نشده است.
                </Typography>
              ) : null}
              {incidentsQuery.data?.map((incident) => (
                <Stack
                  key={incident.id}
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
                >
                  <Typography variant="body2">
                    {ALERT_INCIDENT_STATUS_LABELS[incident.status] ?? 'نامشخص'} ·{' '}
                    {formatPersianDateTime(incident.openedAt, 'short')}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`حادثه: ${NOTIFICATION_DELIVERY_STATUS_LABELS[incident.incidentNotificationStatus] ?? 'نامشخص'}`}
                    />
                    {incident.recoveryNotificationStatus != null ? (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`بازگشت: ${NOTIFICATION_DELIVERY_STATUS_LABELS[incident.recoveryNotificationStatus] ?? 'نامشخص'}`}
                      />
                    ) : null}
                  </Stack>
                </Stack>
              ))}
            </Stack>
          ) : null}
        </Stack>
  );

  if (variant === 'plain') {
    return <Box id="alert-policy">{content}</Box>;
  }

  return (
    <Card id="alert-policy">
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>{content}</CardContent>
    </Card>
  );
}

function formatSaveError(error: unknown): string {
  const apiError = toApiError(error);
  if (apiError.errors && apiError.errors.length > 0) {
    return apiError.errors.join(' ');
  }

  return apiError.message;
}
