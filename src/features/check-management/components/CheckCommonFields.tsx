import { FormControlLabel, Stack, Switch, TextField } from '@mui/material';
import type { CheckFormErrors, CheckFormValues } from '../utils/formValidation';

interface CheckCommonFieldsProps {
  values: CheckFormValues;
  errors: CheckFormErrors;
  readOnly?: boolean;
  onChange: (patch: Partial<CheckFormValues>) => void;
}

export function CheckCommonFields({ values, errors, readOnly = false, onChange }: CheckCommonFieldsProps) {
  return (
    <Stack spacing={2}>
      <TextField
        id="check-name"
        label="نام شاخص"
        value={values.name}
        onChange={(event) => onChange({ name: event.target.value })}
        error={Boolean(errors.name)}
        helperText={errors.name}
        required
        fullWidth
        disabled={readOnly}
        slotProps={{ htmlInput: { 'aria-label': 'نام شاخص' } }}
      />
      <TextField
        id="check-description"
        label="توضیحات"
        value={values.description}
        onChange={(event) => onChange({ description: event.target.value })}
        fullWidth
        multiline
        minRows={2}
        disabled={readOnly}
        slotProps={{ htmlInput: { 'aria-label': 'توضیحات' } }}
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          id="check-interval"
          label="فاصله اجرا (ثانیه)"
          value={values.intervalSeconds}
          onChange={(event) => onChange({ intervalSeconds: event.target.value })}
          error={Boolean(errors.intervalSeconds)}
          helperText={errors.intervalSeconds}
          required
          fullWidth
          disabled={readOnly}
          slotProps={{ htmlInput: { 'aria-label': 'Interval Seconds', inputMode: 'numeric' } }}
        />
        <TextField
          id="check-timeout"
          label="مهلت (ثانیه)"
          value={values.timeoutSeconds}
          onChange={(event) => onChange({ timeoutSeconds: event.target.value })}
          error={Boolean(errors.timeoutSeconds)}
          helperText={errors.timeoutSeconds}
          fullWidth
          disabled={readOnly}
          slotProps={{ htmlInput: { 'aria-label': 'Timeout Seconds', inputMode: 'numeric' } }}
        />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          id="check-retry-count"
          label="تعداد تلاش مجدد"
          value={values.retryCount}
          onChange={(event) => onChange({ retryCount: event.target.value })}
          error={Boolean(errors.retryCount)}
          helperText={errors.retryCount}
          fullWidth
          disabled={readOnly}
          slotProps={{ htmlInput: { 'aria-label': 'Retry Count', inputMode: 'numeric' } }}
        />
        <TextField
          id="check-retry-delay"
          label="تاخیر تلاش مجدد (ثانیه)"
          value={values.retryDelaySeconds}
          onChange={(event) => onChange({ retryDelaySeconds: event.target.value })}
          error={Boolean(errors.retryDelaySeconds)}
          helperText={errors.retryDelaySeconds}
          fullWidth
          disabled={readOnly}
          slotProps={{ htmlInput: { 'aria-label': 'Retry Delay Seconds', inputMode: 'numeric' } }}
        />
      </Stack>
      <FormControlLabel
        control={
          <Switch
            checked={values.isActive}
            disabled={readOnly}
            onChange={(event) => onChange({ isActive: event.target.checked })}
          />
        }
        label={values.isActive ? 'فعال' : 'غیرفعال'}
      />
    </Stack>
  );
}
