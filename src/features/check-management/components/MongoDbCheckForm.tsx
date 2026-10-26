import { FormControl, FormHelperText, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { QueryEditorField } from './QueryEditorField';
import { CredentialType, MongoOperationType } from '@/types/enums';
import { credentialScopeLabel } from '@/features/database-credentials/utils/credentialLabels';
import type { DatabaseCredentialDto } from '@/types/databaseCredentials';
import { getCredentialType } from '@/features/database-credentials/utils/credentialType';
import type { CheckFormErrors, CheckFormValues } from '../utils/formValidation';

interface MongoDbCheckFormProps {
  values: CheckFormValues;
  errors: CheckFormErrors;
  credentials: DatabaseCredentialDto[];
  readOnly?: boolean;
  onChange: (patch: Partial<CheckFormValues>) => void;
}

const OPERATION_OPTIONS: { value: MongoOperationType; label: string }[] = [
  { value: MongoOperationType.Ping, label: 'Ping' },
  { value: MongoOperationType.CollectionCount, label: 'Collection Count' },
  { value: MongoOperationType.Query, label: 'Query' },
];

export function MongoDbCheckForm({
  values,
  errors,
  credentials,
  readOnly = false,
  onChange,
}: MongoDbCheckFormProps) {
  const mongoCredentials = credentials.filter(
    (credential) => getCredentialType(credential) === CredentialType.MongoDb,
  );

  const handleCredentialChange = (credentialId: number | '') => {
    onChange({ mongoCredentialId: credentialId });
  };

  return (
    <Stack spacing={2} data-testid="mongodb-check-form">
      <FormControl fullWidth disabled={readOnly} error={Boolean(errors.mongoCredentialId)}>
        <InputLabel id="mongo-credential-label">{credentialScopeLabel('MongoDB')}</InputLabel>
        <Select
          labelId="mongo-credential-label"
          id="mongo-credential"
          label={credentialScopeLabel('MongoDB')}
          value={values.mongoCredentialId}
          onChange={(event) => {
            const parsed = Number(event.target.value);
            handleCredentialChange(Number.isFinite(parsed) && parsed > 0 ? parsed : '');
          }}
          inputProps={{ 'aria-label': credentialScopeLabel('MongoDB') }}
        >
          <MenuItem value="">
            <em>انتخاب کنید</em>
          </MenuItem>
          {mongoCredentials.map((credential) => (
            <MenuItem key={credential.id} value={credential.id}>
              {credential.name}
            </MenuItem>
          ))}
        </Select>
        {errors.mongoCredentialId ? (
          <FormHelperText>{errors.mongoCredentialId}</FormHelperText>
        ) : null}
      </FormControl>

      <FormControl fullWidth disabled={readOnly}>
        <InputLabel id="mongo-operation-label">Operation</InputLabel>
        <Select
          labelId="mongo-operation-label"
          id="mongo-operation"
          label="Operation"
          value={values.mongoOperationType}
          onChange={(event) =>
            onChange({
              mongoOperationType: Number(event.target.value) as MongoOperationType,
            })
          }
          inputProps={{ 'aria-label': 'MongoDB Operation' }}
        >
          {OPERATION_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        id="mongo-collection"
        label="Collection"
        value={values.mongoCollectionName}
        onChange={(event) => onChange({ mongoCollectionName: event.target.value })}
        error={Boolean(errors.mongoCollectionName)}
        helperText={errors.mongoCollectionName}
        fullWidth
        disabled={readOnly}
        slotProps={{ htmlInput: { 'aria-label': 'MongoDB Collection' } }}
      />

      <QueryEditorField
        id="mongo-query"
        label="Query"
        value={values.mongoQueryJson}
        onChange={(mongoQueryJson) => onChange({ mongoQueryJson })}
        error={Boolean(errors.mongoQueryJson)}
        helperText={errors.mongoQueryJson}
        disabled={readOnly}
        minRows={6}
        ariaLabel="MongoDB Query"
        language="plain"
      />

      <TextField
        id="mongo-expected"
        label="Expected Count / Result"
        value={values.mongoExpectedValue}
        onChange={(event) => onChange({ mongoExpectedValue: event.target.value })}
        fullWidth
        disabled={readOnly}
        slotProps={{ htmlInput: { 'aria-label': 'MongoDB Expected Result' } }}
      />

      <TextField
        id="mongo-timeout"
        label="Timeout (ثانیه)"
        value={values.mongoTimeoutSeconds}
        onChange={(event) => onChange({ mongoTimeoutSeconds: event.target.value })}
        error={Boolean(errors.mongoTimeoutSeconds)}
        helperText={errors.mongoTimeoutSeconds}
        fullWidth
        disabled={readOnly}
        slotProps={{ htmlInput: { 'aria-label': 'MongoDB Timeout' } }}
      />
    </Stack>
  );
}
