import type { CheckFormErrors, CheckFormValues } from '../utils/formValidation';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { RedisOperationType } from '@/types/enums';
import { credentialScopeLabel } from '@/features/database-credentials/utils/credentialLabels';
import type { DatabaseCredentialDto } from '@/types/databaseCredentials';
import { getCredentialType } from '@/features/database-credentials/utils/credentialType';
import { CredentialType } from '@/types/enums';

interface RedisCheckFormProps {
  values: CheckFormValues;
  errors: CheckFormErrors;
  credentials: DatabaseCredentialDto[];
  readOnly?: boolean;
  onChange: (patch: Partial<CheckFormValues>) => void;
}

const OPERATION_OPTIONS: { value: RedisOperationType; label: string }[] = [
  { value: RedisOperationType.Ping, label: 'Ping' },
  { value: RedisOperationType.Info, label: 'Info' },
  { value: RedisOperationType.Get, label: 'Get' },
  { value: RedisOperationType.KeyExists, label: 'Key Exists' },
  { value: RedisOperationType.ListLength, label: 'List Length' },
];

export function RedisCheckForm({
  values,
  errors,
  credentials,
  readOnly = false,
  onChange,
}: RedisCheckFormProps) {
  const redisCredentials = credentials.filter(
    (credential) => getCredentialType(credential) === CredentialType.Redis,
  );

  const handleCredentialChange = (credentialId: number | '') => {
    onChange({ redisCredentialId: credentialId });
  };

  return (
    <Stack spacing={2} data-testid="redis-check-form">
      <FormControl fullWidth disabled={readOnly} error={Boolean(errors.redisCredentialId)}>
        <InputLabel id="redis-credential-label">{credentialScopeLabel('Redis')}</InputLabel>
        <Select
          labelId="redis-credential-label"
          id="redis-credential"
          label={credentialScopeLabel('Redis')}
          value={values.redisCredentialId}
          onChange={(event) => {
            const parsed = Number(event.target.value);
            handleCredentialChange(Number.isFinite(parsed) && parsed > 0 ? parsed : '');
          }}
          inputProps={{ 'aria-label': credentialScopeLabel('Redis') }}
        >
          <MenuItem value="">
            <em>انتخاب کنید</em>
          </MenuItem>
          {redisCredentials.map((credential) => (
            <MenuItem key={credential.id} value={credential.id}>
              {credential.name}
            </MenuItem>
          ))}
        </Select>
        {errors.redisCredentialId ? (
          <FormHelperText>{errors.redisCredentialId}</FormHelperText>
        ) : null}
      </FormControl>

      <TextField
        id="redis-database-number"
        label="Database Number"
        value={values.redisDatabaseNumber}
        onChange={(event) => onChange({ redisDatabaseNumber: event.target.value })}
        error={Boolean(errors.redisDatabaseNumber)}
        helperText={errors.redisDatabaseNumber}
        fullWidth
        disabled={readOnly}
        slotProps={{ htmlInput: { 'aria-label': 'Redis Database Number' } }}
      />

      <FormControl fullWidth disabled={readOnly}>
        <InputLabel id="redis-command-label">Command</InputLabel>
        <Select
          labelId="redis-command-label"
          id="redis-command"
          label="Command"
          value={values.redisOperationType}
          onChange={(event) =>
            onChange({
              redisOperationType: Number(event.target.value) as RedisOperationType,
            })
          }
          inputProps={{ 'aria-label': 'Redis Command' }}
        >
          {OPERATION_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        id="redis-key"
        label="Key"
        value={values.redisCommandOrKeyName}
        onChange={(event) => onChange({ redisCommandOrKeyName: event.target.value })}
        error={Boolean(errors.redisCommandOrKeyName)}
        helperText={errors.redisCommandOrKeyName ?? 'مثال: redis.connected_users'}
        fullWidth
        disabled={readOnly}
        slotProps={{ htmlInput: { 'aria-label': 'Redis Key' } }}
      />

      <TextField
        id="redis-expected-value"
        label="Expected Value"
        value={values.redisExpectedValue}
        onChange={(event) => onChange({ redisExpectedValue: event.target.value })}
        fullWidth
        disabled={readOnly}
        slotProps={{ htmlInput: { 'aria-label': 'Redis Expected Value' } }}
      />

      <TextField
        id="redis-timeout"
        label="Timeout (ثانیه)"
        value={values.redisTimeoutSeconds}
        onChange={(event) => onChange({ redisTimeoutSeconds: event.target.value })}
        error={Boolean(errors.redisTimeoutSeconds)}
        helperText={errors.redisTimeoutSeconds}
        fullWidth
        disabled={readOnly}
        slotProps={{ htmlInput: { 'aria-label': 'Redis Timeout' } }}
      />
    </Stack>
  );
}
