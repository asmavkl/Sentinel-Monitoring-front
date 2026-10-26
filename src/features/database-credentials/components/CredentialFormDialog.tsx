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
import {
  CredentialType,
  SnmpAuthenticationProtocol,
  SnmpPrivacyProtocol,
  SnmpVersion,
} from '@/types/enums';
import type { DatabaseCredentialDto, TestDatabaseConnectionResult } from '@/types/databaseCredentials';
import { useTestDatabaseConnection } from '../hooks';
import {
  getCredentialType,
  getCredentialTypeLabel,
  getMongoConnectionFromCredential,
  getRedisConnectionFromCredential,
  getSnmpAuthenticationProtocolLabel,
  getSnmpPrivacyProtocolLabel,
  getSnmpVersionLabel,
  isRelationalCredentialType,
  isSnmpCredentialType,
  toApiCredentialPayload,
} from '../utils/credentialType';
import {
  ADD_CREDENTIAL_LABEL,
  CREDENTIAL_NAME_LABEL,
  CREDENTIAL_TYPE_LABEL,
  EDIT_CREDENTIAL_LABEL,
  REGISTER_CREDENTIAL_LABEL,
  VIEW_CREDENTIAL_LABEL,
} from '../utils/credentialLabels';
import {
  parseCredentialPort,
  validateCredentialPort,
  validateCredentialForm,
  type CredentialFormErrors,
  type CredentialFormValues,
} from '../utils/formValidation';
import { ConnectionTestResult } from './ConnectionTestResult';

export type CredentialDialogMode = 'create' | 'edit' | 'view';

export interface CredentialFormSubmitValues {
  name: string;
  server: string;
  databaseName: string;
  username: string;
  password?: string;
  privacyPassword?: string;
  port: number | null;
  isActive: boolean;
  credentialType: CredentialType;
  snmpVersion?: SnmpVersion;
  snmpAuthenticationProtocol?: SnmpAuthenticationProtocol;
  snmpPrivacyProtocol?: SnmpPrivacyProtocol;
}

interface CredentialFormDialogProps {
  open: boolean;
  mode: CredentialDialogMode;
  credential?: DatabaseCredentialDto | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (values: CredentialFormSubmitValues) => void;
}

const EMPTY_FORM: CredentialFormValues = {
  credentialType: CredentialType.SqlServer,
  name: '',
  server: '',
  databaseName: '',
  username: '',
  password: '',
  privacyPassword: '',
  port: '',
  isActive: true,
  snmpVersion: '',
  snmpAuthenticationProtocol: '',
  snmpPrivacyProtocol: '',
};

const AUTH_PROTOCOLS = [
  SnmpAuthenticationProtocol.Md5,
  SnmpAuthenticationProtocol.Sha1,
  SnmpAuthenticationProtocol.Sha256,
  SnmpAuthenticationProtocol.Sha384,
  SnmpAuthenticationProtocol.Sha512,
] as const;

const PRIVACY_PROTOCOLS = [
  SnmpPrivacyProtocol.Des,
  SnmpPrivacyProtocol.Aes128,
  SnmpPrivacyProtocol.Aes192,
  SnmpPrivacyProtocol.Aes256,
] as const;

function portValue(port?: number | null): string {
  return port == null ? '' : String(port);
}

function databaseFieldLabel(credentialType: CredentialType): string {
  return credentialType === CredentialType.Oracle ? 'Service Name' : 'نام دیتابیس';
}

function portHelperText(credentialType: CredentialType): string {
  switch (credentialType) {
    case CredentialType.PostgreSql:
      return 'اگر خالی بماند، هنگام اتصال از پورت 5432 استفاده می‌شود.';
    case CredentialType.MySql:
      return 'اگر خالی بماند، هنگام اتصال از پورت 3306 استفاده می‌شود.';
    case CredentialType.Oracle:
      return 'اگر خالی بماند، هنگام اتصال از پورت 1521 استفاده می‌شود.';
    case CredentialType.SqlServer:
      return 'اگر خالی بماند، پورت از رشته سرور خوانده می‌شود. اگر سرور به‌شکل host,1433 است، Port را خالی بگذارید.';
    default:
      return 'اختیاری. مقدار خالی یعنی پورت پیش‌فرض سرویس.';
  }
}

function clearedSecrets(values: CredentialFormValues): CredentialFormValues {
  return {
    ...values,
    username: '',
    password: '',
    privacyPassword: '',
  };
}

function valuesForCredentialType(
  current: CredentialFormValues,
  credentialType: CredentialType,
): CredentialFormValues {
  const next = clearedSecrets({
    ...current,
    credentialType,
    server: '',
    databaseName: '',
    port: '',
    snmpVersion: '',
    snmpAuthenticationProtocol: '',
    snmpPrivacyProtocol: '',
  });

  if (credentialType === CredentialType.Snmp) {
    next.snmpVersion = SnmpVersion.V2c;
  }

  return next;
}

function valuesForSnmpVersion(
  current: CredentialFormValues,
  snmpVersion: SnmpVersion,
): CredentialFormValues {
  const staysCommunity =
    (current.snmpVersion === SnmpVersion.V1 || current.snmpVersion === SnmpVersion.V2c) &&
    (snmpVersion === SnmpVersion.V1 || snmpVersion === SnmpVersion.V2c);

  if (staysCommunity) {
    return {
      ...current,
      snmpVersion,
      username: '',
      privacyPassword: '',
      snmpAuthenticationProtocol: '',
      snmpPrivacyProtocol: '',
    };
  }

  const next = clearedSecrets({
    ...current,
    snmpVersion,
    snmpAuthenticationProtocol: '',
    snmpPrivacyProtocol: '',
  });

  if (snmpVersion === SnmpVersion.V3) {
    next.snmpAuthenticationProtocol = SnmpAuthenticationProtocol.Sha256;
    next.snmpPrivacyProtocol = SnmpPrivacyProtocol.Aes128;
  }

  return next;
}

function valuesFromCredential(credential: DatabaseCredentialDto): CredentialFormValues {
  const credentialType = getCredentialType(credential);

  if (credentialType === CredentialType.Snmp) {
    return {
      ...EMPTY_FORM,
      credentialType,
      name: credential.name,
      username: credential.username ?? '',
      isActive: credential.isActive,
      snmpVersion: credential.snmpVersion ?? '',
      snmpAuthenticationProtocol: credential.snmpAuthenticationProtocol ?? '',
      snmpPrivacyProtocol: credential.snmpPrivacyProtocol ?? '',
    };
  }

  if (credentialType === CredentialType.Redis) {
    const connection = getRedisConnectionFromCredential(credential);
    return {
      credentialType,
      name: credential.name,
      server: connection.host,
      databaseName: '',
      username: connection.username,
      password: '',
      port: portValue(credential.port),
      isActive: credential.isActive,
    };
  }

  if (credentialType === CredentialType.MongoDb) {
    const connection = getMongoConnectionFromCredential(credential);
    return {
      credentialType,
      name: credential.name,
      server: connection.host,
      databaseName: connection.databaseName || '',
      username: connection.username,
      password: '',
      port: portValue(credential.port),
      isActive: credential.isActive,
    };
  }

  return {
    ...EMPTY_FORM,
    credentialType,
    name: credential.name,
    server: credential.server ?? '',
    databaseName: credential.databaseName ?? '',
    username: credential.username,
    password: '',
    port: portValue(credential.port),
    isActive: credential.isActive,
  };
}

function dialogTitle(mode: CredentialDialogMode): string {
  if (mode === 'edit') {
    return EDIT_CREDENTIAL_LABEL;
  }

  if (mode === 'view') {
    return VIEW_CREDENTIAL_LABEL;
  }

  return ADD_CREDENTIAL_LABEL;
}

function initialFormValues(
  mode: CredentialDialogMode,
  credential?: DatabaseCredentialDto | null,
): CredentialFormValues {
  if (mode === 'create' || !credential) {
    return EMPTY_FORM;
  }

  return valuesFromCredential(credential);
}

export function CredentialFormDialog({
  open,
  mode,
  credential,
  isSubmitting = false,
  submitError,
  onClose,
  onSubmit,
}: CredentialFormDialogProps) {
  const formKey = `${mode}-${credential?.id ?? 'new'}`;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
      {open ? (
        <CredentialFormDialogBody
          key={formKey}
          mode={mode}
          credential={credential}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  );
}

interface CredentialFormDialogBodyProps {
  mode: CredentialDialogMode;
  credential?: DatabaseCredentialDto | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (values: CredentialFormSubmitValues) => void;
}

function CredentialFormDialogBody({
  mode,
  credential,
  isSubmitting = false,
  submitError,
  onClose,
  onSubmit,
}: CredentialFormDialogBodyProps) {
  const readOnly = mode === 'view';
  const isCreate = mode === 'create';
  const testConnection = useTestDatabaseConnection();

  const [values, setValues] = useState<CredentialFormValues>(() => initialFormValues(mode, credential));
  const [errors, setErrors] = useState<CredentialFormErrors>({});
  const [testResult, setTestResult] = useState<TestDatabaseConnectionResult | null>(null);

  const snmp = isSnmpCredentialType(values.credentialType);
  const snmpV3 = snmp && values.snmpVersion === SnmpVersion.V3;

  const patchValues = (patch: Partial<CredentialFormValues>) => {
    setValues((current) => ({ ...current, ...patch }));
    setErrors({});
    setTestResult(null);
  };

  const handleSubmit = () => {
    if (readOnly) {
      return;
    }

    const nextErrors = validateCredentialForm(values, isCreate);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const parsedPort = parseCredentialPort(values.port);
    const payload = toApiCredentialPayload({
      ...values,
      password: snmp ? values.password : values.password || undefined,
      privacyPassword: values.privacyPassword,
      port: parsedPort.port,
    });

    onSubmit({
      name: payload.name,
      server: payload.server,
      databaseName: payload.databaseName,
      username: payload.username,
      password: payload.password,
      port: payload.port,
      isActive: payload.isActive,
      credentialType: payload.credentialType,
      ...(payload.snmpVersion != null ? { snmpVersion: payload.snmpVersion } : {}),
      ...(payload.snmpAuthenticationProtocol != null
        ? { snmpAuthenticationProtocol: payload.snmpAuthenticationProtocol }
        : {}),
      ...(payload.snmpPrivacyProtocol != null
        ? { snmpPrivacyProtocol: payload.snmpPrivacyProtocol }
        : {}),
      ...(payload.privacyPassword !== undefined ? { privacyPassword: payload.privacyPassword } : {}),
    });
  };

  const handleTestConnection = async () => {
    const connectionErrors: CredentialFormErrors = {};

    if (snmp) {
      const formErrors = validateCredentialForm(
        {
          ...values,
          password: values.password || ' ',
          privacyPassword: values.privacyPassword || ' ',
        },
        false,
      );
      Object.assign(connectionErrors, formErrors);
      if (!values.password) {
        connectionErrors.password = snmpV3
          ? 'برای تست، رمز احراز هویت را وارد کنید'
          : 'برای تست، Community را وارد کنید';
      }
      if (snmpV3 && !values.privacyPassword) {
        connectionErrors.privacyPassword = 'برای تست، رمز حریم خصوصی را وارد کنید';
      }
    } else {
      if (!values.server.trim()) {
        connectionErrors.server = 'Server الزامی است';
      }
      if (!values.databaseName.trim()) {
        connectionErrors.databaseName = 'نام دیتابیس الزامی است';
      }
      if (!values.username.trim()) {
        connectionErrors.username = 'Username الزامی است';
      }
      if (!values.password) {
        connectionErrors.password = isCreate
          ? 'Password الزامی است'
          : 'برای تست اتصال، Password را وارد کنید';
      }

      const portError = validateCredentialPort(values.credentialType, values.server, values.port);
      if (portError) {
        connectionErrors.port = portError;
      }
    }

    setErrors(connectionErrors);
    if (Object.keys(connectionErrors).length > 0) {
      return;
    }

    setTestResult(null);
    try {
      const result = await testConnection.mutateAsync(
        snmp
          ? {
            credentialType: CredentialType.Snmp,
            server: '',
            database: '',
            username: snmpV3 ? values.username.trim() : '',
            password: values.password,
            port: null,
          }
          : {
            credentialType: values.credentialType,
            server: values.server.trim(),
            database: values.databaseName.trim(),
            username: values.username.trim(),
            password: values.password,
            port: parseCredentialPort(values.port).port,
          },
      );
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'اتصال برقرار نشد',
      });
    }
  };

  const submitLabel = isCreate ? REGISTER_CREDENTIAL_LABEL : 'ذخیره';

  return (
    <>
      <DialogTitle>{dialogTitle(mode)}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <FormControl fullWidth disabled={readOnly || !isCreate}>
            <InputLabel id="credential-type-label">{CREDENTIAL_TYPE_LABEL}</InputLabel>
            <Select
              labelId="credential-type-label"
              id="credential-type"
              label={CREDENTIAL_TYPE_LABEL}
              value={values.credentialType}
              onChange={(event) => {
                const credentialType = Number(event.target.value) as CredentialType;
                setValues((current) => valuesForCredentialType(current, credentialType));
                setErrors({});
                setTestResult(null);
              }}
              inputProps={{ 'aria-label': CREDENTIAL_TYPE_LABEL }}
            >
              <MenuItem value={CredentialType.SqlServer}>
                {getCredentialTypeLabel(CredentialType.SqlServer)}
              </MenuItem>
              <MenuItem value={CredentialType.PostgreSql}>
                {getCredentialTypeLabel(CredentialType.PostgreSql)}
              </MenuItem>
              <MenuItem value={CredentialType.MySql}>
                {getCredentialTypeLabel(CredentialType.MySql)}
              </MenuItem>
              <MenuItem value={CredentialType.Oracle}>
                {getCredentialTypeLabel(CredentialType.Oracle)}
              </MenuItem>
              <MenuItem value={CredentialType.Redis}>
                {getCredentialTypeLabel(CredentialType.Redis)}
              </MenuItem>
              <MenuItem value={CredentialType.MongoDb}>
                {getCredentialTypeLabel(CredentialType.MongoDb)}
              </MenuItem>
              <MenuItem value={CredentialType.Snmp}>
                {getCredentialTypeLabel(CredentialType.Snmp)}
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            id="credential-name"
            label={CREDENTIAL_NAME_LABEL}
            value={values.name}
            onChange={(event) => patchValues({ name: event.target.value })}
            error={Boolean(errors.name)}
            helperText={errors.name}
            required
            fullWidth
            disabled={readOnly}
            slotProps={{ htmlInput: { 'aria-label': CREDENTIAL_NAME_LABEL } }}
          />

          {snmp ? null : isRelationalCredentialType(values.credentialType) ? (
            <>
              <TextField
                id="credential-server"
                label="IP سرور"
                value={values.server}
                onChange={(event) => patchValues({ server: event.target.value })}
                error={Boolean(errors.server)}
                helperText={errors.server}
                required
                fullWidth
                disabled={readOnly}
                slotProps={{ htmlInput: { 'aria-label': 'Server' } }}
              />
              <TextField
                id="credential-database"
                label={databaseFieldLabel(values.credentialType)}
                value={values.databaseName}
                onChange={(event) => patchValues({ databaseName: event.target.value })}
                error={Boolean(errors.databaseName)}
                helperText={errors.databaseName}
                required
                fullWidth
                disabled={readOnly}
                slotProps={{ htmlInput: { 'aria-label': databaseFieldLabel(values.credentialType) } }}
              />
            </>
          ) : (
            <TextField
              id="credential-host"
              label="Host"
              value={values.server}
              onChange={(event) => patchValues({ server: event.target.value })}
              error={Boolean(errors.server)}
              helperText={errors.server}
              required
              fullWidth
              disabled={readOnly}
              slotProps={{ htmlInput: { 'aria-label': 'Host' } }}
            />
          )}

          {snmp ? (
            <SnmpCredentialFields
              values={values}
              errors={errors}
              readOnly={readOnly}
              isCreate={isCreate}
              versionLocked={!isCreate}
              onChange={patchValues}
              onVersionChange={(snmpVersion) => {
                setValues((current) => valuesForSnmpVersion(current, snmpVersion));
                setErrors({});
                setTestResult(null);
              }}
            />
          ) : (
            <>
              <TextField
                id="credential-port"
                label="پورت"
                value={values.port}
                onChange={(event) => patchValues({ port: event.target.value })}
                error={Boolean(errors.port)}
                helperText={errors.port ?? portHelperText(values.credentialType)}
                fullWidth
                disabled={readOnly}
                slotProps={{ htmlInput: { 'aria-label': 'Port', inputMode: 'numeric' } }}
              />

              <TextField
                id="credential-username"
                label="نام کاربری"
                value={values.username}
                onChange={(event) => patchValues({ username: event.target.value })}
                error={Boolean(errors.username)}
                helperText={errors.username}
                required={isRelationalCredentialType(values.credentialType)}
                fullWidth
                disabled={readOnly}
                slotProps={{ htmlInput: { 'aria-label': 'Username' } }}
              />
              <TextField
                id="credential-password"
                label="پسورد"
                type="password"
                value={values.password}
                onChange={(event) => patchValues({ password: event.target.value })}
                error={Boolean(errors.password)}
                helperText={
                  errors.password ??
                  (readOnly
                    ? '********'
                    : isCreate
                      ? undefined
                      : 'برای تغییر رمز عبور، مقدار جدید را وارد کنید')
                }
                required={isCreate}
                fullWidth
                disabled={readOnly}
                autoComplete="new-password"
                placeholder={readOnly || !isCreate ? '********' : undefined}
                slotProps={{ htmlInput: { 'aria-label': 'Password' } }}
              />
            </>
          )}
          <FormControlLabel
            control={
              <Switch
                checked={values.isActive}
                disabled={readOnly}
                onChange={(event) => patchValues({ isActive: event.target.checked })}
              />
            }
            label={values.isActive ? 'فعال' : 'غیرفعال'}
          />
          {!readOnly && (isRelationalCredentialType(values.credentialType) || snmp) ? (
            <Button
              variant="outlined"
              onClick={() => {
                void handleTestConnection();
              }}
              disabled={testConnection.isPending}
            >
              {testConnection.isPending ? 'در حال تست...' : 'تست اتصال'}
            </Button>
          ) : null}
          {testResult ? (
            <ConnectionTestResult
              success={testResult.success}
              message={testResult.message}
              durationMs={testResult.durationMs}
            />
          ) : null}
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, flexShrink: 0 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          {readOnly ? 'بستن' : 'انصراف'}
        </Button>
        {!readOnly ? (
          <Button
            variant="contained"
            data-testid="credential-submit-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'در حال ثبت...' : submitLabel}
          </Button>
        ) : null}
      </DialogActions>
    </>
  );
}

function SnmpCredentialFields({
  values,
  errors,
  readOnly,
  isCreate,
  versionLocked,
  onChange,
  onVersionChange,
}: {
  values: CredentialFormValues;
  errors: CredentialFormErrors;
  readOnly: boolean;
  isCreate: boolean;
  versionLocked: boolean;
  onChange: (patch: Partial<CredentialFormValues>) => void;
  onVersionChange: (version: SnmpVersion) => void;
}) {
  const version = values.snmpVersion ?? '';
  const isV3 = version === SnmpVersion.V3;
  const isCommunity = version === SnmpVersion.V1 || version === SnmpVersion.V2c;
  const secretHelper = readOnly
    ? '********'
    : isCreate
      ? undefined
      : 'خالی بماند تا مقدار ذخیره‌شده حفظ شود';

  return (
    <>
      <FormControl fullWidth disabled={readOnly || versionLocked} error={Boolean(errors.snmpVersion)}>
        <InputLabel id="snmp-version-label">نسخه SNMP</InputLabel>
        <Select
          labelId="snmp-version-label"
          label="نسخه SNMP"
          value={version}
          onChange={(event) => onVersionChange(Number(event.target.value) as SnmpVersion)}
          inputProps={{ 'aria-label': 'نسخه SNMP' }}
        >
          <MenuItem value={SnmpVersion.V1}>{getSnmpVersionLabel(SnmpVersion.V1)}</MenuItem>
          <MenuItem value={SnmpVersion.V2c}>{getSnmpVersionLabel(SnmpVersion.V2c)}</MenuItem>
          <MenuItem value={SnmpVersion.V3}>{getSnmpVersionLabel(SnmpVersion.V3)}</MenuItem>
        </Select>
        {errors.snmpVersion ? <FormHelperText>{errors.snmpVersion}</FormHelperText> : null}
      </FormControl>

      {isCommunity ? (
        <>
          <Alert severity="warning">
           رشته دسترسی SNMP در SNMPv1 و SNMPv2c روی شبکه به‌صورت متن آشکار ارسال می‌شود.
          </Alert>
          <TextField
            label="رشته دسترسی SNMP"
            type="password"
            value={values.password}
            onChange={(event) => onChange({ password: event.target.value })}
            error={Boolean(errors.password)}
            helperText={errors.password ?? secretHelper}
            required={isCreate}
            fullWidth
            disabled={readOnly}
            autoComplete="new-password"
            placeholder={readOnly || !isCreate ? '********' : undefined}
            slotProps={{ htmlInput: { 'aria-label': 'Community' } }}
          />
        </>
      ) : null}

      {isV3 ? (
        <>
          <Alert severity="info">SNMPv3 فقط AuthPriv را پشتیبانی می‌کند. noAuth و authNoPriv در دسترس نیست.</Alert>
          <TextField
            label="نام کاربری"
            value={values.username}
            onChange={(event) => onChange({ username: event.target.value })}
            error={Boolean(errors.username)}
            helperText={errors.username}
            required
            fullWidth
            disabled={readOnly}
            slotProps={{ htmlInput: { 'aria-label': 'Username' } }}
          />
          <FormControl fullWidth disabled={readOnly} error={Boolean(errors.snmpAuthenticationProtocol)}>
            <InputLabel id="snmp-auth-protocol-label">پروتکل احراز هویت</InputLabel>
            <Select
              labelId="snmp-auth-protocol-label"
              label="پروتکل احراز هویت"
              value={values.snmpAuthenticationProtocol ?? ''}
              onChange={(event) =>
                onChange({
                  snmpAuthenticationProtocol: Number(event.target.value) as SnmpAuthenticationProtocol,
                })
              }
              inputProps={{ 'aria-label': 'پروتکل احراز هویت' }}
            >
              {AUTH_PROTOCOLS.map((protocol) => (
                <MenuItem key={protocol} value={protocol}>
                  {getSnmpAuthenticationProtocolLabel(protocol)}
                </MenuItem>
              ))}
            </Select>
            {errors.snmpAuthenticationProtocol ? (
              <FormHelperText>{errors.snmpAuthenticationProtocol}</FormHelperText>
            ) : null}
          </FormControl>
          <TextField
            label="رمز احراز هویت"
            type="password"
            value={values.password}
            onChange={(event) => onChange({ password: event.target.value })}
            error={Boolean(errors.password)}
            helperText={errors.password ?? secretHelper}
            required={isCreate}
            fullWidth
            disabled={readOnly}
            autoComplete="new-password"
            placeholder={readOnly || !isCreate ? '********' : undefined}
            slotProps={{ htmlInput: { 'aria-label': 'رمز احراز هویت' } }}
          />
          <FormControl fullWidth disabled={readOnly} error={Boolean(errors.snmpPrivacyProtocol)}>
            <InputLabel id="snmp-privacy-protocol-label">پروتکل حریم خصوصی</InputLabel>
            <Select
              labelId="snmp-privacy-protocol-label"
              label="پروتکل حریم خصوصی"
              value={values.snmpPrivacyProtocol ?? ''}
              onChange={(event) =>
                onChange({
                  snmpPrivacyProtocol: Number(event.target.value) as SnmpPrivacyProtocol,
                })
              }
              inputProps={{ 'aria-label': 'پروتکل حریم خصوصی' }}
            >
              {PRIVACY_PROTOCOLS.map((protocol) => (
                <MenuItem key={protocol} value={protocol}>
                  {getSnmpPrivacyProtocolLabel(protocol)}
                </MenuItem>
              ))}
            </Select>
            {errors.snmpPrivacyProtocol ? <FormHelperText>{errors.snmpPrivacyProtocol}</FormHelperText> : null}
          </FormControl>
          <TextField
            label="رمز حریم خصوصی"
            type="password"
            value={values.privacyPassword ?? ''}
            onChange={(event) => onChange({ privacyPassword: event.target.value })}
            error={Boolean(errors.privacyPassword)}
            helperText={errors.privacyPassword ?? secretHelper}
            required={isCreate}
            fullWidth
            disabled={readOnly}
            autoComplete="new-password"
            placeholder={readOnly || !isCreate ? '********' : undefined}
            slotProps={{ htmlInput: { 'aria-label': 'رمز حریم خصوصی' } }}
          />
        </>
      ) : null}
    </>
  );
}
