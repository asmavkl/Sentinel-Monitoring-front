import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import type { DatabaseCredentialDto } from '@/types/databaseCredentials';
import type { MonitoredServerDto } from '@/types/monitoredServers';
import { getMonitoringMethodLabel, isSelectableSnmpCredential, ADD_SERVER_LABEL, EDIT_SERVER_LABEL } from '../utils/labels';
import {
  EMPTY_SERVER_FORM,
  toServerRequest,
  validateServerForm,
  type ServerFormErrors,
  type ServerFormValues,
} from '../utils/formValidation';

export type ServerDialogMode = 'create' | 'edit';

interface ServerFormDialogProps {
  open: boolean;
  mode: ServerDialogMode;
  server?: MonitoredServerDto | null;
  credentials: DatabaseCredentialDto[];
  isSubmitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (values: ReturnType<typeof toServerRequest>) => void;
}

function valuesFromServer(server: MonitoredServerDto): ServerFormValues {
  return {
    name: server.name,
    description: server.description ?? '',
    host: server.host,
    port: String(server.port),
    credentialId: String(server.credentialId),
    isActive: server.isActive,
    intervalSeconds: String(server.intervalSeconds),
    timeoutSeconds: String(server.timeoutSeconds),
    retryCount: String(server.retryCount),
    retryDelaySeconds: String(server.retryDelaySeconds),
  };
}

export function ServerFormDialog({
  open,
  mode,
  server,
  credentials,
  isSubmitting = false,
  submitError,
  onClose,
  onSubmit,
}: ServerFormDialogProps) {
  const formKey = `${mode}-${server?.id ?? 'new'}`;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      {open ? (
        <ServerFormDialogBody
          key={formKey}
          mode={mode}
          server={server}
          credentials={credentials}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  );
}

function ServerFormDialogBody({
  mode,
  server,
  credentials,
  isSubmitting = false,
  submitError,
  onClose,
  onSubmit,
}: Omit<ServerFormDialogProps, 'open'>) {
  const isCreate = mode === 'create';
  const [values, setValues] = useState<ServerFormValues>(() =>
    server && mode === 'edit' ? valuesFromServer(server) : EMPTY_SERVER_FORM,
  );
  const [errors, setErrors] = useState<ServerFormErrors>({});

  const selectable = credentials.filter(
    (credential) =>
      isSelectableSnmpCredential(credential) || credential.id === Number(values.credentialId),
  );

  const patch = (next: Partial<ServerFormValues>) => {
    setValues((current) => ({ ...current, ...next }));
  };

  const handleSubmit = () => {
    const nextErrors = validateServerForm(values);
    const selected = credentials.find((credential) => credential.id === Number(values.credentialId));
    if (selected && !isSelectableSnmpCredential(selected)) {
      nextErrors.credentialId = 'اعتبارنامه SNMP باید فعال باشد';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit(toServerRequest(values));
  };

  return (
    <>
      <DialogTitle>{isCreate ? ADD_SERVER_LABEL : EDIT_SERVER_LABEL}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            سرور مانیتور شده یک شاخص برنامه نیست. نسخه SNMP روی اعتبارنامه است و اینجا فقط همان
            اعتبارنامه انتخاب می‌شود.
          </Typography>
          <TextField
            label="نام"
            value={values.name}
            onChange={(event) => patch({ name: event.target.value })}
            error={Boolean(errors.name)}
            helperText={errors.name}
            required
            fullWidth
            slotProps={{ htmlInput: { 'aria-label': 'نام' } }}
          />
          <TextField
            label="توضیح"
            value={values.description}
            onChange={(event) => patch({ description: event.target.value })}
            fullWidth
            multiline
            minRows={2}
            slotProps={{ htmlInput: { 'aria-label': 'توضیح' } }}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="IP سرور"
              value={values.host}
              onChange={(event) => patch({ host: event.target.value })}
              error={Boolean(errors.host)}
              helperText={errors.host}
              required
              fullWidth
              slotProps={{ htmlInput: { 'aria-label': 'IP سرور' } }}
            />
            <TextField
              label="پورت"
              value={values.port}
              onChange={(event) => patch({ port: event.target.value })}
              error={Boolean(errors.port)}
              helperText={errors.port ?? 'خالی یعنی ۱۶۱'}
              fullWidth
              slotProps={{ htmlInput: { 'aria-label': 'پورت', inputMode: 'numeric' } }}
            />
          </Stack>
          <TextField label="روش مانیتورینگ" value={getMonitoringMethodLabel()} disabled fullWidth />
          <FormControl fullWidth error={Boolean(errors.credentialId)}>
            <InputLabel id="server-credential-label">اعتبارنامه SNMP</InputLabel>
            <Select
              labelId="server-credential-label"
              label="اعتبارنامه SNMP"
              value={values.credentialId}
              onChange={(event) => patch({ credentialId: String(event.target.value) })}
              inputProps={{ 'aria-label': 'اعتبارنامه SNMP' }}
            >
              {selectable.length === 0 ? (
                <MenuItem value="" disabled>
                  اعتبارنامه SNMP فعالی وجود ندارد
                </MenuItem>
              ) : null}
              {selectable.map((credential) => (
                <MenuItem key={credential.id} value={String(credential.id)}>
                  {credential.name}
                  {credential.isActive ? '' : ' (غیرفعال)'}
                </MenuItem>
              ))}
            </Select>
            {errors.credentialId ? <FormHelperText>{errors.credentialId}</FormHelperText> : null}
          </FormControl>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="فاصله اجرا (ثانیه)"
              value={values.intervalSeconds}
              onChange={(event) => patch({ intervalSeconds: event.target.value })}
              error={Boolean(errors.intervalSeconds)}
              helperText={errors.intervalSeconds}
              required
              fullWidth
              slotProps={{ htmlInput: { 'aria-label': 'فاصله اجرا', inputMode: 'numeric' } }}
            />
            <TextField
              label="مهلت (ثانیه)"
              value={values.timeoutSeconds}
              onChange={(event) => patch({ timeoutSeconds: event.target.value })}
              error={Boolean(errors.timeoutSeconds)}
              helperText={errors.timeoutSeconds}
              required
              fullWidth
              slotProps={{ htmlInput: { 'aria-label': 'مهلت', inputMode: 'numeric' } }}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="تعداد تلاش مجدد"
              value={values.retryCount}
              onChange={(event) => patch({ retryCount: event.target.value })}
              error={Boolean(errors.retryCount)}
              helperText={errors.retryCount}
              required
              fullWidth
              slotProps={{ htmlInput: { 'aria-label': 'تعداد تلاش مجدد', inputMode: 'numeric' } }}
            />
            <TextField
              label="تأخیر تلاش مجدد (ثانیه)"
              value={values.retryDelaySeconds}
              onChange={(event) => patch({ retryDelaySeconds: event.target.value })}
              error={Boolean(errors.retryDelaySeconds)}
              helperText={errors.retryDelaySeconds}
              required
              fullWidth
              slotProps={{ htmlInput: { 'aria-label': 'تأخیر تلاش مجدد', inputMode: 'numeric' } }}
            />
          </Stack>
          <FormControlLabel
            control={
              <Switch
                checked={values.isActive}
                onChange={(event) => patch({ isActive: event.target.checked })}
              />
            }
            label={values.isActive ? 'فعال' : 'غیرفعال'}
          />
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          انصراف
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'در حال ذخیره...' : isCreate ? 'ثبت سرور' : 'ذخیره'}
        </Button>
      </DialogActions>
    </>
  );
}
