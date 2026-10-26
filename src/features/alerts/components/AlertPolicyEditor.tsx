import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {
  Alert,
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { ApplicationHealthStatus, AlertThresholdMode } from '@/types/enums';
import type { AlertPolicyDto } from '@/types/alertPolicy';
import { HEALTH_STATUS_LABELS } from '@/utils/healthStatus';
import {
  ALERT_THRESHOLD_MODE_LABELS,
  alertPolicyToForm,
  createDefaultAlertPolicyForm,
  toUpsertAlertPolicyRequest,
  validateAlertPolicyForm,
  type AlertPolicyFormValues,
} from '../utils/alertPolicyForm';

const STATUS_OPTIONS = [
  ApplicationHealthStatus.Unknown,
  ApplicationHealthStatus.Normal,
  ApplicationHealthStatus.Warning,
  ApplicationHealthStatus.Critical,
  ApplicationHealthStatus.OutOfService,
] as const;

interface AlertPolicyEditorProps {
  policy: AlertPolicyDto | null;
  isSaving: boolean;
  saveError: string | null;
  onSave: (payload: ReturnType<typeof toUpsertAlertPolicyRequest>) => void;
}

export function AlertPolicyEditor({ policy, isSaving, saveError, onSave }: AlertPolicyEditorProps) {
  const [values, setValues] = useState<AlertPolicyFormValues>(() =>
    policy ? alertPolicyToForm(policy) : createDefaultAlertPolicyForm(),
  );
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const update = (patch: Partial<AlertPolicyFormValues>) => {
    setValues((current) => ({ ...current, ...patch }));
  };

  const handleSave = () => {
    const errors = validateAlertPolicyForm(values);
    setFormErrors(errors);
    if (errors.length > 0) {
      return;
    }

    // Mark all recipients as existing after save
    const updatedRecipients = values.recipients.map((recipient) => ({
      ...recipient,
      isExisting: true,
    }));
    update({ recipients: updatedRecipients });

    onSave(toUpsertAlertPolicyRequest({ ...values, recipients: updatedRecipients }));
  };

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        ایمیل گیرنده روی همین سیاست ذخیره می‌شود. پروفایل Database Mail فقط مسیر ارسال است.
      </Typography>

      {formErrors.map((error) => (
        <Alert key={error} severity="warning">
          {error}
        </Alert>
      ))}
      {saveError ? <Alert severity="error">{saveError}</Alert> : null}

      <FormControlLabel
        control={
          <Switch
            checked={values.isActive}
            onChange={(event) => update({ isActive: event.target.checked })}
            slotProps={{ input: { 'aria-label': 'فعال بودن اعلان' } }}
          />
        }
        label={values.isActive ? 'فعال — ایمیل ارسال می‌شود' : 'غیرفعال — ایمیل ارسال نمی‌شود'}
      />

      <ThresholdFields
        title="شروع حادثه"
        status={values.triggerStatus}
        mode={values.triggerMode}
        threshold={values.triggerThreshold}
        statusLabelId="alert-trigger-status"
        modeLabelId="alert-trigger-mode"
        thresholdLabel="آستانه شروع"
        onStatus={(triggerStatus) => update({ triggerStatus })}
        onMode={(triggerMode) => update({ triggerMode })}
        onThreshold={(triggerThreshold) => update({ triggerThreshold })}
      />

      <ThresholdFields
        title="بازگشت"
        status={values.recoveryStatus}
        mode={values.recoveryMode}
        threshold={values.recoveryThreshold}
        statusLabelId="alert-recovery-status"
        modeLabelId="alert-recovery-mode"
        thresholdLabel="آستانه بازگشت"
        onStatus={(recoveryStatus) => update({ recoveryStatus })}
        onMode={(recoveryMode) => update({ recoveryMode })}
        onThreshold={(recoveryThreshold) => update({ recoveryThreshold })}
      />

      <Stack spacing={1}>
        <Typography variant="subtitle2">گیرندگان ایمیل</Typography>
        {values.recipients.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            گیرنده‌ای ثبت نشده است. حادثه باز می‌شود، ولی ایمیلی ساخته نمی‌شود.
          </Typography>
        ) : (
          values.recipients.map((recipient, index) => (
            <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
              <TextField
                size="small"
                label="ایمیل"
                value={recipient.address}
                onChange={(event) => {
                  const recipients = values.recipients.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, address: event.target.value } : item,
                  );
                  update({ recipients });
                }}
                disabled={recipient.isExisting}
                sx={{ flex: 1 }}
                slotProps={{ htmlInput: { 'aria-label': `ایمیل گیرنده ${index + 1}` } }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={recipient.isActive}
                    onChange={(event) => {
                      const recipients = values.recipients.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, isActive: event.target.checked } : item,
                      );
                      update({ recipients });
                    }}
                  />
                }
                label="فعال"
              />
              <IconButton
                aria-label={`حذف گیرنده ${index + 1}`}
                onClick={() => update({ recipients: values.recipients.filter((_, itemIndex) => itemIndex !== index) })}
              >
                <DeleteOutlinedIcon />
              </IconButton>
            </Stack>
          ))
        )}
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => update({ recipients: [...values.recipients, { address: '', isActive: true, isExisting: false }] })}
          sx={{ alignSelf: 'flex-start' }}
        >
          افزودن گیرنده
        </Button>
      </Stack>

      <Button variant="contained" onClick={handleSave} disabled={isSaving} sx={{ alignSelf: 'flex-start' }}>
        {isSaving ? 'در حال ذخیره…' : 'ذخیره اعلان'}
      </Button>
    </Stack>
  );
}

function ThresholdFields({
  title,
  status,
  mode,
  threshold,
  statusLabelId,
  modeLabelId,
  thresholdLabel,
  onStatus,
  onMode,
  onThreshold,
}: {
  title: string;
  status: ApplicationHealthStatus;
  mode: AlertThresholdMode;
  threshold: number;
  statusLabelId: string;
  modeLabelId: string;
  thresholdLabel: string;
  onStatus: (status: ApplicationHealthStatus) => void;
  onMode: (mode: AlertThresholdMode) => void;
  onThreshold: (threshold: number) => void;
}) {
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{title}</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <FormControl size="small" sx={{ minWidth: 180, flex: 1 }}>
          <InputLabel id={statusLabelId}>وضعیت</InputLabel>
          <Select
            labelId={statusLabelId}
            label="وضعیت"
            value={status}
            onChange={(event) => onStatus(Number(event.target.value) as ApplicationHealthStatus)}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {HEALTH_STATUS_LABELS[option]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 180, flex: 1 }}>
          <InputLabel id={modeLabelId}>حالت</InputLabel>
          <Select
            labelId={modeLabelId}
            label="حالت"
            value={mode}
            onChange={(event) => onMode(Number(event.target.value) as AlertThresholdMode)}
          >
            {Object.entries(ALERT_THRESHOLD_MODE_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={Number(value)}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          type="number"
          label={mode === AlertThresholdMode.Duration ? `${thresholdLabel} (ثانیه)` : thresholdLabel}
          value={threshold}
          onChange={(event) => onThreshold(Number(event.target.value))}
          slotProps={{ htmlInput: { min: 1, 'aria-label': thresholdLabel } }}
          sx={{ width: { sm: 160 } }}
        />
      </Stack>
    </Stack>
  );
}
