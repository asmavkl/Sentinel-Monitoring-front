import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { isValidHttpUrl } from '../utils/formValidation';
import { useDashboardTemplates } from '../hooks/useDashboardTemplates';
import { ApplicationPriority } from '@/types/enums';
import type { MonitoringApplicationDto } from '@/types/monitoringManagement';
import {
  APPLICATION_PRIORITY_OPTIONS,
  normalizeApplicationPriority,
} from '../utils/applicationPriority';

export interface ApplicationFormValues {
  name: string;
  code: string;
  description: string;
  baseUrl: string;
  isActive: boolean;
  priority: ApplicationPriority;
  dashboardTemplateId: number | null;
}

interface ApplicationFormDialogProps {
  open: boolean;
  application?: MonitoringApplicationDto | null;
  existingCodes?: string[];
  isSubmitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (values: ApplicationFormValues) => void;
}

interface ApplicationFormErrors {
  name?: string;
  code?: string;
  baseUrl?: string;
}

const EMPTY_FORM: ApplicationFormValues = {
  name: '',
  code: '',
  description: '',
  baseUrl: '',
  isActive: true,
  priority: ApplicationPriority.Important,
  dashboardTemplateId: null,
};

const FALLBACK_TEMPLATE_LABELS: Record<string, string> = {
  empty: 'داشبورد خالی',
  Empty: 'داشبورد خالی',
  'Empty Dashboard': 'داشبورد خالی',
  standard: 'داشبورد پایش استاندارد',
  Standard: 'داشبورد پایش استاندارد',
  'Standard Monitoring Dashboard': 'داشبورد پایش استاندارد',
  noc: 'داشبورد NOC',
  NOC: 'داشبورد NOC',
  'NOC Dashboard': 'داشبورد NOC',
};

function validateApplicationForm(
  values: ApplicationFormValues,
  existingCodes: string[],
  currentCode?: string | null,
): ApplicationFormErrors {
  const errors: ApplicationFormErrors = {};
  const name = values.name.trim();
  const code = values.code.trim();
  const baseUrl = values.baseUrl.trim();

  if (!name) {
    errors.name = 'نام سامانه الزامی است';
  }

  if (!code) {
    errors.code = 'کد سامانه الزامی است';
  } else {
    const duplicate = existingCodes.some(
      (item) =>
        item.toLowerCase() === code.toLowerCase() &&
        item.toLowerCase() !== currentCode?.toLowerCase(),
    );
    if (duplicate) {
      errors.code = 'کد سامانه باید یکتا باشد';
    }
  }

  if (baseUrl && !isValidHttpUrl(baseUrl)) {
    errors.baseUrl = 'Base URL معتبر نیست';
  }

  return errors;
}

function templateLabel(name: string, code?: string | null): string {
  return (
    FALLBACK_TEMPLATE_LABELS[name] ??
    (code ? FALLBACK_TEMPLATE_LABELS[code] : undefined) ??
    name
  );
}

export function ApplicationFormDialog({
  open,
  application,
  existingCodes = [],
  isSubmitting = false,
  submitError,
  onClose,
  onSubmit,
}: ApplicationFormDialogProps) {
  const isCreate = !application;
  const templatesQuery = useDashboardTemplates(open && isCreate);
  const [values, setValues] = useState<ApplicationFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<ApplicationFormErrors>({});

  useEffect(() => {
    if (!open) {
      return;
    }

    setErrors({});
    setValues(
      application
        ? {
          name: application.name,
          code: application.code,
          description: application.description ?? '',
          baseUrl: application.baseUrl ?? '',
          isActive: application.isActive,
          priority: normalizeApplicationPriority(application.priority),
          dashboardTemplateId: null,
        }
        : EMPTY_FORM,
    );
  }, [open, application]);

  const handleSubmit = () => {
    const nextErrors = validateApplicationForm(values, existingCodes, application?.code);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit({
      name: values.name.trim(),
      code: values.code.trim(),
      description: values.description.trim(),
      baseUrl: values.baseUrl.trim(),
      isActive: values.isActive,
      priority: values.priority,
      dashboardTemplateId: isCreate ? values.dashboardTemplateId : null,
    });
  };

  const templates = templatesQuery.data ?? [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{application ? 'ویرایش سامانه' : 'افزودن سامانه'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            id="application-name"
            label="نام سامانه"
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            error={Boolean(errors.name)}
            helperText={errors.name}
            required
            fullWidth
            slotProps={{ htmlInput: { 'aria-label': 'نام سامانه' } }}
          />
          <TextField
            id="application-code"
            label="کد سامانه"
            value={values.code}
            onChange={(event) => setValues((current) => ({ ...current, code: event.target.value }))}
            error={Boolean(errors.code)}
            helperText={application ? 'کد پس از ایجاد قابل تغییر نیست' : errors.code}
            required
            disabled={Boolean(application)}
            fullWidth
            slotProps={{ htmlInput: { 'aria-label': 'کد سامانه' } }}
          />
          <TextField
            id="application-description"
            label="توضیحات"
            value={values.description}
            onChange={(event) =>
              setValues((current) => ({ ...current, description: event.target.value }))
            }
            fullWidth
            multiline
            minRows={2}
            slotProps={{ htmlInput: { 'aria-label': 'توضیحات' } }}
          />
          {/* <TextField
            id="application-base-url"
            label="Base URL"
            value={values.baseUrl}
            onChange={(event) => setValues((current) => ({ ...current, baseUrl: event.target.value }))}
            error={Boolean(errors.baseUrl)}
            helperText={errors.baseUrl}
            fullWidth
            slotProps={{ htmlInput: { 'aria-label': 'Base URL' } }}
          /> */}

          <FormControl fullWidth>
            <InputLabel id="application-priority-label">اولویت سامانه</InputLabel>
            <Select
              labelId="application-priority-label"
              id="application-priority"
              label="اولویت سامانه"
              value={values.priority}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  priority: Number(event.target.value) as ApplicationPriority,
                }))
              }
              inputProps={{ 'aria-label': 'اولویت سامانه' }}
            >
              {APPLICATION_PRIORITY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {isCreate ? (
            <FormControl fullWidth>
              <InputLabel id="dashboard-template-label">قالب داشبورد</InputLabel>
              <Select
                labelId="dashboard-template-label"
                id="dashboard-template"
                label="قالب داشبورد"
                value={
                  values.dashboardTemplateId == null ? '' : String(values.dashboardTemplateId)
                }
                onChange={(event) => {
                  const raw = String(event.target.value);
                  setValues((current) => ({
                    ...current,
                    dashboardTemplateId: raw === '' ? null : Number(raw),
                  }));
                }}
                inputProps={{ 'aria-label': 'قالب داشبورد' }}
              >
                <MenuItem value="">
                  <em>داشبورد خالی</em>
                </MenuItem>
                {templates.map((template) => (
                  <MenuItem key={template.id} value={String(template.id)}>
                    {templateLabel(template.name, template.code)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}

          <FormControlLabel
            control={
              <Switch
                checked={values.isActive}
                onChange={(event) =>
                  setValues((current) => ({ ...current, isActive: event.target.checked }))
                }
              />
            }
            label={values.isActive ? 'فعال' : 'غیرفعال'}
          />
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          انصراف
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
