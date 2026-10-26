import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { HttpMethod } from '@/types/enums';
import type { CheckFormErrors, CheckFormValues } from '../utils/formValidation';

interface HttpCheckFormProps {
  values: CheckFormValues;
  errors: CheckFormErrors;
  readOnly?: boolean;
  onChange: (patch: Partial<CheckFormValues>) => void;
}

export function HttpCheckForm({ values, errors, readOnly = false, onChange }: HttpCheckFormProps) {
  return (
    <Stack spacing={2}>
      <TextField
        id="check-url"
        label="URL"
        value={values.url}
        onChange={(event) => onChange({ url: event.target.value })}
        error={Boolean(errors.url)}
        helperText={errors.url}
        required
        fullWidth
        disabled={readOnly}
        slotProps={{ htmlInput: { 'aria-label': 'URL' } }}
      />
      <FormControl fullWidth disabled={readOnly}>
        <InputLabel id="check-http-method-label">HTTP Method</InputLabel>
        <Select
          labelId="check-http-method-label"
          id="check-http-method"
          label="HTTP Method"
          value={values.httpMethod ?? HttpMethod.GET}
          onChange={(event) => onChange({ httpMethod: Number(event.target.value) as HttpMethod })}
          inputProps={{ 'aria-label': 'HTTP Method' }}
        >
          <MenuItem value={HttpMethod.GET}>GET</MenuItem>
          <MenuItem value={HttpMethod.POST}>POST</MenuItem>
          <MenuItem value={HttpMethod.PUT}>PUT</MenuItem>
          <MenuItem value={HttpMethod.DELETE}>DELETE</MenuItem>
        </Select>
      </FormControl>
      <TextField
        id="check-expected-status"
        label="Expected Status Code"
        value={values.expectedStatusCode}
        onChange={(event) => onChange({ expectedStatusCode: event.target.value })}
        error={Boolean(errors.expectedStatusCode)}
        helperText={errors.expectedStatusCode}
        required
        fullWidth
        disabled={readOnly}
        slotProps={{ htmlInput: { 'aria-label': 'Expected Status Code', inputMode: 'numeric' } }}
      />
      <TextField
        id="check-headers"
        label="Headers JSON"
        value={values.headers}
        onChange={(event) => onChange({ headers: event.target.value })}
        error={Boolean(errors.headers)}
        helperText={errors.headers}
        fullWidth
        multiline
        minRows={2}
        disabled={readOnly}
        slotProps={{ htmlInput: { 'aria-label': 'Headers JSON' } }}
      />
      <TextField
        id="check-body"
        label="Body JSON"
        value={values.requestBody}
        onChange={(event) => onChange({ requestBody: event.target.value })}
        error={Boolean(errors.requestBody)}
        helperText={errors.requestBody}
        fullWidth
        multiline
        minRows={2}
        disabled={readOnly}
        slotProps={{ htmlInput: { 'aria-label': 'Body JSON' } }}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={values.useSSOToken}
            disabled={readOnly}
            onChange={(event) => onChange({ useSSOToken: event.target.checked })}
          />
        }
        label="استفاده از توکن SSO"
      />
    </Stack>
  );
}
