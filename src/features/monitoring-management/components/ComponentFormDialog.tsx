import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import type { MonitoringComponentDto } from '@/types/monitoringManagement';

export interface ComponentFormValues {
  name: string;
  description: string;
  isActive: boolean;
}

interface ComponentFormDialogProps {
  open: boolean;
  component?: MonitoringComponentDto | null;
  existingNames?: string[];
  isSubmitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (values: ComponentFormValues) => void;
}

interface ComponentFormErrors {
  name?: string;
}

const EMPTY_FORM: ComponentFormValues = {
  name: '',
  description: '',
  isActive: true,
};

function validateComponentForm(
  values: ComponentFormValues,
  existingNames: string[],
  currentName?: string | null,
): ComponentFormErrors {
  const errors: ComponentFormErrors = {};
  const name = values.name.trim();

  if (!name) {
    errors.name = 'نام مولفه الزامی است';
    return errors;
  }

  const duplicate = existingNames.some(
    (item) =>
      item.toLowerCase() === name.toLowerCase() &&
      item.toLowerCase() !== currentName?.toLowerCase(),
  );
  if (duplicate) {
    errors.name = 'نام مولفه در این سامانه باید یکتا باشد';
  }

  return errors;
}

export function ComponentFormDialog({
  open,
  component,
  existingNames = [],
  isSubmitting = false,
  submitError,
  onClose,
  onSubmit,
}: ComponentFormDialogProps) {
  const [values, setValues] = useState<ComponentFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<ComponentFormErrors>({});

  useEffect(() => {
    if (!open) {
      return;
    }

    setErrors({});
    setValues(
      component
        ? {
          name: component.name,
          description: component.description ?? '',
          isActive: component.isActive,
        }
        : EMPTY_FORM,
    );
  }, [open, component]);

  const handleSubmit = () => {
    const nextErrors = validateComponentForm(values, existingNames, component?.name);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit({
      name: values.name.trim(),
      description: values.description.trim(),
      isActive: values.isActive,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{component ? 'ویرایش مولفه' : 'افزودن مولفه'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            id="component-name"
            label="نام مولفه"
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            error={Boolean(errors.name)}
            helperText={errors.name}
            required
            fullWidth
            slotProps={{ htmlInput: { 'aria-label': 'نام مولفه' } }}
          />
          <TextField
            id="component-description"
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
