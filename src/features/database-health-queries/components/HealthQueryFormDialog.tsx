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
} from '@mui/material';
import { useState } from 'react';
import { QueryEditorField } from '@/features/check-management/components/QueryEditorField';
import {
  getCredentialTypeLabel,
  isRelationalCredentialType,
} from '@/features/database-credentials/utils/credentialType';
import { CredentialType, DatabaseHealthQueryCategory, type CredentialType as CredentialTypeValue } from '@/types/enums';
import type { DatabaseHealthQueryDto } from '@/types/databaseHealthQueries';
import { ADD_HEALTH_QUERY_LABEL, EDIT_HEALTH_QUERY_LABEL, getHealthQueryCategoryLabel } from '../utils/labels';
import {
  validateHealthQueryForm,
  type HealthQueryFormErrors,
  type HealthQueryFormValues,
} from '../utils/formValidation';

export type HealthQueryDialogMode = 'create' | 'edit';

interface HealthQueryFormDialogProps {
  open: boolean;
  mode: HealthQueryDialogMode;
  healthQuery?: DatabaseHealthQueryDto | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (values: HealthQueryFormValues) => void;
}

const RELATIONAL_TYPES: CredentialTypeValue[] = [
  CredentialType.SqlServer,
  CredentialType.PostgreSql,
  CredentialType.MySql,
  CredentialType.Oracle,
];

const CATEGORIES = [
  DatabaseHealthQueryCategory.Connection,
  DatabaseHealthQueryCategory.Availability,
  DatabaseHealthQueryCategory.Performance,
  DatabaseHealthQueryCategory.Capacity,
  DatabaseHealthQueryCategory.Storage,
] as const;

const EMPTY_FORM: HealthQueryFormValues = {
  name: '',
  displayName: '',
  description: '',
  databaseType: CredentialType.SqlServer,
  category: DatabaseHealthQueryCategory.Connection,
  query: '',
  unit: '',
  isActive: true,
};

function valuesFromQuery(query: DatabaseHealthQueryDto): HealthQueryFormValues {
  return {
    name: query.name,
    displayName: query.displayName,
    description: query.description ?? '',
    databaseType: isRelationalCredentialType(query.databaseType)
      ? query.databaseType
      : CredentialType.SqlServer,
    category: query.category,
    query: query.query,
    unit: query.unit ?? '',
    isActive: query.isActive,
  };
}

export function HealthQueryFormDialog(props: HealthQueryFormDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="md" scroll="paper">
      {props.open ? <HealthQueryFormDialogBody key={`${props.mode}-${props.healthQuery?.id ?? 'new'}`} {...props} /> : null}
    </Dialog>
  );
}

function HealthQueryFormDialogBody({
  mode,
  healthQuery,
  isSubmitting = false,
  submitError,
  onClose,
  onSubmit,
}: HealthQueryFormDialogProps) {
  const isCreate = mode === 'create';
  const [values, setValues] = useState<HealthQueryFormValues>(() =>
    isCreate || !healthQuery ? EMPTY_FORM : valuesFromQuery(healthQuery),
  );
  const [errors, setErrors] = useState<HealthQueryFormErrors>({});

  const patchValues = (patch: Partial<HealthQueryFormValues>) => {
    setValues((current) => ({ ...current, ...patch }));
  };

  const handleSubmit = () => {
    const nextErrors = validateHealthQueryForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit(values);
  };

  return (
    <>
      <DialogTitle>{isCreate ? ADD_HEALTH_QUERY_LABEL : EDIT_HEALTH_QUERY_LABEL}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <TextField
            id="health-query-name"
            label="نام فنی"
            value={values.name}
            onChange={(event) => patchValues({ name: event.target.value })}
            error={Boolean(errors.name)}
            helperText={errors.name}
            required
            fullWidth
            slotProps={{ htmlInput: { 'aria-label': 'Name', maxLength: 200 } }}
          />
          <TextField
            id="health-query-display-name"
            label="نام نمایشی"
            value={values.displayName}
            onChange={(event) => patchValues({ displayName: event.target.value })}
            error={Boolean(errors.displayName)}
            helperText={errors.displayName}
            required
            fullWidth
            slotProps={{ htmlInput: { 'aria-label': 'نام نمایشی', maxLength: 200 } }}
          />
          <TextField
            id="health-query-description"
            label="توضیحات"
            value={values.description}
            onChange={(event) => patchValues({ description: event.target.value })}
            error={Boolean(errors.description)}
            helperText={errors.description}
            fullWidth
            multiline
            minRows={2}
            slotProps={{ htmlInput: { 'aria-label': 'Description', maxLength: 2000 } }}
          />
          <FormControl fullWidth error={Boolean(errors.databaseType)}>
            <InputLabel id="health-query-database-type-label">Database Type</InputLabel>
            <Select
              labelId="health-query-database-type-label"
              id="health-query-database-type"
              label="نوع پایگاه داده"
              value={values.databaseType}
              onChange={(event) =>
                patchValues({ databaseType: Number(event.target.value) as CredentialTypeValue })
              }
              inputProps={{ 'aria-label': 'نوع پایگاه داده' }}
            >
              {RELATIONAL_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {getCredentialTypeLabel(type)}
                </MenuItem>
              ))}
            </Select>
            {errors.databaseType ? <FormHelperText>{errors.databaseType}</FormHelperText> : null}
          </FormControl>
          <FormControl fullWidth error={Boolean(errors.category)}>
            <InputLabel id="health-query-category-label">Category</InputLabel>
            <Select
              labelId="health-query-category-label"
              id="health-query-category"
              label="دسته‌بندی"
              value={values.category}
              onChange={(event) =>
                patchValues({
                  category: Number(event.target.value) as DatabaseHealthQueryCategory,
                })
              }
              inputProps={{ 'aria-label': 'دسته بندی' }}
            >
              {CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {getHealthQueryCategoryLabel(category)}
                </MenuItem>
              ))}
            </Select>
            {errors.category ? <FormHelperText>{errors.category}</FormHelperText> : null}
          </FormControl>
          <QueryEditorField
            id="health-query-text"
            label="کوئری"
            value={values.query}
            onChange={(query) => patchValues({ query })}
            error={Boolean(errors.query)}
            helperText={errors.query}
            required
            ariaLabel="Query"
          />
          <TextField
            id="health-query-unit"
            label="واحد"
            value={values.unit}
            onChange={(event) => patchValues({ unit: event.target.value })}
            fullWidth
            slotProps={{ htmlInput: { 'aria-label': 'Unit' } }}
          />
          <TextField
            label="نوع خروجی"
            value="Scalar"
            fullWidth
            disabled
            slotProps={{ htmlInput: { 'aria-label': 'نوع خروجی' } }}
          />
          {isCreate ? (
            <FormControlLabel
              control={
                <Switch
                  checked={values.isActive}
                  onChange={(event) => patchValues({ isActive: event.target.checked })}
                />
              }
              label={values.isActive ? 'فعال' : 'غیرفعال'}
            />
          ) : null}
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          انصراف
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
        </Button>
      </DialogActions>
    </>
  );
}
