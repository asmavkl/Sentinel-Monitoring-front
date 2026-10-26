import {
  Alert,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { getErrorMessage } from '@/api/apiUtils';
import { credentialScopeLabel } from '@/features/database-credentials/utils/credentialLabels';
import {
  getCredentialType,
  getCredentialTypeLabel,
  isRelationalCredentialType,
} from '@/features/database-credentials/utils/credentialType';
import {
  useDatabaseHealthQueries,
  useDatabaseHealthQuery,
} from '@/features/database-health-queries/hooks';
import { ResultType, type CredentialType } from '@/types/enums';
import type { DatabaseCredentialDto } from '@/types/databaseCredentials';
import type { CheckFormErrors, CheckFormValues } from '../utils/formValidation';
import { QueryEditorField } from './QueryEditorField';

interface DatabaseCheckFormProps {
  values: CheckFormValues;
  errors: CheckFormErrors;
  credentials: DatabaseCredentialDto[];
  readOnly?: boolean;
  onChange: (patch: Partial<CheckFormValues>) => void;
}

export function DatabaseCheckForm({
  values,
  errors,
  credentials,
  readOnly = false,
  onChange,
}: DatabaseCheckFormProps) {
  const relationalCredentials = credentials.filter((credential) =>
    isRelationalCredentialType(getCredentialType(credential)),
  );
  const selectedCredential = relationalCredentials.find(
    (credential) => credential.id === values.databaseCredentialId,
  );
  const credentialType = selectedCredential ? getCredentialType(selectedCredential) : null;
  const healthQueryMode = values.querySource === 'healthQuery';
  const selectedHealthQueryId = typeof values.healthQueryId === 'number' ? values.healthQueryId : 0;

  const healthQueries = useDatabaseHealthQueries(
    {
      databaseType: credentialType ?? undefined,
      isActive: true,
    },
    healthQueryMode && credentialType != null,
  );
  const selectedHealthQuery = useDatabaseHealthQuery(healthQueryMode ? selectedHealthQueryId : 0);

  const options = useMemo(() => {
    const activeQueries = healthQueries.data ?? [];
    const current = selectedHealthQuery.data;
    if (
      current &&
      credentialType != null &&
      current.databaseType === credentialType &&
      !activeQueries.some((query) => query.id === current.id)
    ) {
      return [current, ...activeQueries];
    }

    return activeQueries;
  }, [credentialType, healthQueries.data, selectedHealthQuery.data]);

  const handleCredentialChange = (rawValue: string) => {
    const parsed = Number(rawValue);
    const nextId = Number.isFinite(parsed) && parsed > 0 ? parsed : '';
    const nextCredential = relationalCredentials.find((credential) => credential.id === nextId);
    const nextType = nextCredential ? getCredentialType(nextCredential) : null;
    const patch: Partial<CheckFormValues> = { databaseCredentialId: nextId };

    if (healthQueryMode && nextType !== credentialType) {
      patch.healthQueryId = '';
    }

    onChange(patch);
  };

  return (
    <Stack spacing={2} data-testid="database-check-form">
      <FormControl fullWidth disabled={readOnly} error={Boolean(errors.databaseCredentialId)}>
        <InputLabel id="check-credential-label">{credentialScopeLabel('Database')}</InputLabel>
        <Select
          labelId="check-credential-label"
          id="check-credential"
          label={credentialScopeLabel('Database')}
          value={values.databaseCredentialId}
          onChange={(event) => handleCredentialChange(String(event.target.value))}
          inputProps={{ 'aria-label': credentialScopeLabel('Database') }}
        >
          <MenuItem value="">
            <em>انتخاب کنید</em>
          </MenuItem>
          {relationalCredentials.map((credential) => (
            <MenuItem key={credential.id} value={credential.id}>
              {credential.name}
            </MenuItem>
          ))}
        </Select>
        {errors.databaseCredentialId ? (
          <FormHelperText>{errors.databaseCredentialId}</FormHelperText>
        ) : null}
      </FormControl>

      <FormControl>
        <FormLabel id="query-source-label">منبع کوئری</FormLabel>
        <RadioGroup
          aria-labelledby="query-source-label"
          value={values.querySource}
          onChange={(event) =>
            onChange({
              querySource: event.target.value as CheckFormValues['querySource'],
            })
          }
        >
          <FormControlLabel
            value="custom"
            control={<Radio />}
            label="SQL سفارشی"
            disabled={readOnly}
          />
          <FormControlLabel
            value="healthQuery"
            control={<Radio />}
            label="کوئری سلامت دیتابیس"
            disabled={readOnly}
          />
        </RadioGroup>
      </FormControl>

      {healthQueryMode ? (
        <HealthQuerySelector
          values={values}
          errors={errors}
          readOnly={readOnly}
          credentialType={credentialType}
          options={options}
          isLoading={healthQueries.isLoading}
          isError={healthQueries.isError}
          error={healthQueries.error}
          catalogQuery={selectedHealthQuery.data?.query}
          catalogLoading={selectedHealthQuery.isLoading}
          onChange={onChange}
        />
      ) : (
        <>
          <QueryEditorField
            id="check-query"
            label="Query"
            value={values.query}
            onChange={(query) => onChange({ query })}
            error={Boolean(errors.query)}
            helperText={errors.query}
            required
            disabled={readOnly}
            ariaLabel="Query"
          />
          <FormControl fullWidth disabled={readOnly}>
            <InputLabel id="check-result-type-label">Result Type</InputLabel>
            <Select
              labelId="check-result-type-label"
              id="check-result-type"
              label="Result Type"
              value={values.resultType}
              onChange={(event) => onChange({ resultType: Number(event.target.value) as ResultType })}
              inputProps={{ 'aria-label': 'Result Type' }}
            >
              <MenuItem value={ResultType.Scalar}>Scalar</MenuItem>
              <MenuItem value={ResultType.StatusCount}>StatusCount</MenuItem>
              <MenuItem value={ResultType.Dataset}>Dataset</MenuItem>
            </Select>
          </FormControl>
        </>
      )}
    </Stack>
  );
}

function HealthQuerySelector({
  values,
  errors,
  readOnly,
  credentialType,
  options,
  isLoading,
  isError,
  error,
  catalogQuery,
  catalogLoading,
  onChange,
}: {
  values: CheckFormValues;
  errors: CheckFormErrors;
  readOnly: boolean;
  credentialType: CredentialType | null;
  options: { id: number; displayName: string; name: string; isActive: boolean }[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  catalogQuery?: string;
  catalogLoading: boolean;
  onChange: (patch: Partial<CheckFormValues>) => void;
}) {
  const selectorDisabled = readOnly || credentialType == null;

  return (
    <Stack spacing={2}>
      <TextField
        label="Database Type"
        value={credentialType == null ? '' : getCredentialTypeLabel(credentialType)}
        disabled
        fullWidth
        slotProps={{ htmlInput: { 'aria-label': 'Database Type' } }}
      />
      <FormControl fullWidth disabled={selectorDisabled} error={Boolean(errors.healthQueryId)}>
        <InputLabel id="health-query-select-label">کوئری سلامت</InputLabel>
        <Select
          labelId="health-query-select-label"
          id="health-query-select"
          label="کوئری سلامت"
          value={values.healthQueryId}
          onChange={(event) => {
            const parsed = Number(event.target.value);
            onChange({
              healthQueryId: Number.isFinite(parsed) && parsed > 0 ? parsed : '',
            });
          }}
          inputProps={{ 'aria-label': 'کوئری سلامت' }}
        >
          <MenuItem value="">
            <em>انتخاب کنید</em>
          </MenuItem>
          {options.map((query) => (
            <MenuItem key={query.id} value={query.id}>
              {query.displayName}
              {query.isActive ? '' : ' (غیرفعال)'}
            </MenuItem>
          ))}
        </Select>
        {!credentialType ? (
          <FormHelperText>ابتدا اعتبارنامه را انتخاب کنید.</FormHelperText>
        ) : null}
        {credentialType && isLoading ? (
          <FormHelperText>در حال بارگذاری کوئری‌های سلامت دیتابیس...</FormHelperText>
        ) : null}
        {credentialType && !isLoading && !isError && options.length === 0 ? (
          <FormHelperText>هیچ کوئری سلامت فعالی برای این نوع دیتابیس وجود ندارد.</FormHelperText>
        ) : null}
        {errors.healthQueryId ? <FormHelperText>{errors.healthQueryId}</FormHelperText> : null}
      </FormControl>
      {isError ? <Alert severity="error">{getErrorMessage(error)}</Alert> : null}
      {values.healthQueryId ? (
        catalogLoading ? (
          <Typography variant="body2" color="text.secondary">
            در حال بارگذاری کوئری‌های سلامت دیتابیس...
          </Typography>
        ) : catalogQuery ? (
          <QueryEditorField
            id="catalog-query-preview"
            label="متن فعلی کاتالوگ"
            value={catalogQuery}
            onChange={() => undefined}
            disabled
            ariaLabel="متن فعلی کاتالوگ"
            helperText="نتیجه Scalar است. متن کوئری از کاتالوگ خوانده می‌شود و در شاخص کپی نمی‌شود."
          />
        ) : null
      ) : null}
    </Stack>
  );
}
