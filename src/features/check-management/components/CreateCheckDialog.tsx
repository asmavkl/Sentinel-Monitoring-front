import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { CheckType, HttpMethod, MongoOperationType, RedisOperationType, ResultType } from '@/types/enums';
import type { CheckDefinitionDto, CheckListItem, CreateCheckRequest } from '@/types/checkManagement';
import { getCheckTypeLabel } from '../utils/checkLabels';
import {
  useApplicationComponents,
  useCheck,
  useDatabaseCredentials,
  useMonitoringApplications,
} from '../hooks';
import {
  parseFormNumber,
  parseOptionalJsonString,
  validateCheckForm,
  type CheckFormErrors,
  type CheckFormValues,
} from '../utils/formValidation';
import { buildSqlConfiguration, getSqlConfiguration } from '../utils/sqlCheckPayload';
import { CheckCommonFields } from './CheckCommonFields';
import { CheckTypeSelector } from './CheckTypeSelector';
import { DatabaseCheckForm } from './DatabaseCheckForm';
import { HttpCheckForm } from './HttpCheckForm';
import { MongoDbCheckForm } from './MongoDbCheckForm';
import { RedisCheckForm } from './RedisCheckForm';

export type CheckDialogMode = 'create' | 'edit' | 'view';

interface CreateCheckDialogProps {
  open: boolean;
  mode: CheckDialogMode;
  check?: CheckListItem | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateCheckRequest) => void;
}

const STEPS = ['سامانه', 'مولفه', 'نوع شاخص', 'پیکربندی'];

const EMPTY_FORM: CheckFormValues = {
  name: '',
  description: '',
  intervalSeconds: '60',
  timeoutSeconds: '10',
  retryCount: '3',
  retryDelaySeconds: '5',
  isActive: true,
  url: '',
  httpMethod: HttpMethod.GET,
  expectedStatusCode: '200',
  headers: '',
  requestBody: '',
  useSSOToken: false,
  databaseCredentialId: '',
  querySource: 'custom',
  healthQueryId: '',
  query: '',
  resultType: ResultType.StatusCount,
  redisCredentialId: '',
  redisDatabaseNumber: '0',
  redisOperationType: RedisOperationType.Ping,
  redisCommandOrKeyName: '',
  redisExpectedValue: '',
  redisTimeoutSeconds: '30',
  mongoCredentialId: '',
  mongoOperationType: MongoOperationType.Ping,
  mongoCollectionName: '',
  mongoQueryJson: '',
  mongoExpectedValue: '',
  mongoTimeoutSeconds: '30',
};

function valuesFromCheck(check: CheckDefinitionDto | CheckListItem): CheckFormValues {
  const sql = getSqlConfiguration(check);

  return {
    name: check.name,
    description: check.description ?? '',
    intervalSeconds: String(check.intervalSeconds),
    timeoutSeconds: String(check.timeoutSeconds),
    retryCount: String(check.retryCount),
    retryDelaySeconds: String(check.retryDelaySeconds),
    isActive: check.isActive,
    url: check.httpConfiguration?.url ?? '',
    httpMethod: check.httpConfiguration?.httpMethod ?? HttpMethod.GET,
    expectedStatusCode: String(check.httpConfiguration?.expectedStatusCode ?? 200),
    headers: check.httpConfiguration?.headers ?? '',
    requestBody: check.httpConfiguration?.requestBody ?? '',
    useSSOToken: check.httpConfiguration?.useSSOToken ?? false,
    databaseCredentialId: sql?.databaseCredentialId ?? '',
    querySource: sql?.healthQueryId ? 'healthQuery' : 'custom',
    healthQueryId: sql?.healthQueryId ?? '',
    query: sql?.query ?? '',
    resultType: sql?.resultType ?? ResultType.StatusCount,
    redisCredentialId: check.redisConfiguration?.databaseCredentialId ?? '',
    redisDatabaseNumber: String(check.redisConfiguration?.databaseNumber ?? 0),
    redisOperationType: check.redisConfiguration?.operationType ?? RedisOperationType.Ping,
    redisCommandOrKeyName: check.redisConfiguration?.commandOrKeyName ?? '',
    redisExpectedValue: check.redisConfiguration?.expectedValue ?? '',
    redisTimeoutSeconds: String(check.redisConfiguration?.timeoutSeconds ?? 30),
    mongoCredentialId: check.mongoDbConfiguration?.databaseCredentialId ?? '',
    mongoOperationType: check.mongoDbConfiguration?.operationType ?? MongoOperationType.Ping,
    mongoCollectionName: check.mongoDbConfiguration?.collectionName ?? '',
    mongoQueryJson: check.mongoDbConfiguration?.queryJson ?? '',
    mongoExpectedValue: check.mongoDbConfiguration?.expectedValue ?? '',
    mongoTimeoutSeconds: String(check.mongoDbConfiguration?.timeoutSeconds ?? 30),
  };
}

function buildCreatePayload(
  values: CheckFormValues,
  applicationComponentId: number,
  checkType: CheckType,
): CreateCheckRequest {
  const payload: CreateCheckRequest = {
    applicationComponentId,
    name: values.name.trim(),
    description: values.description.trim() || null,
    checkType,
    intervalSeconds: parseFormNumber(values.intervalSeconds, 60),
    timeoutSeconds: parseFormNumber(values.timeoutSeconds, 10),
    retryCount: parseFormNumber(values.retryCount, 3),
    retryDelaySeconds: parseFormNumber(values.retryDelaySeconds, 5),
    isActive: values.isActive,
  };

  if (checkType === 1) { // HttpRequest or Http (both have value 1)
    payload.httpConfiguration = {
      url: values.url.trim(),
      httpMethod: values.httpMethod,
      headers: parseOptionalJsonString(values.headers),
      requestBody: parseOptionalJsonString(values.requestBody),
      expectedStatusCode: parseFormNumber(values.expectedStatusCode, 200),
      useSSOToken: values.useSSOToken,
    };
  }

  if (checkType === 2) { // SqlQuery or DatabaseQuery (both have value 2)
    payload.sqlConfiguration = buildSqlConfiguration(values);
  }

  if (checkType === CheckType.Redis) {
    payload.redisConfiguration = {
      databaseCredentialId: Number(values.redisCredentialId),
      databaseNumber: parseFormNumber(values.redisDatabaseNumber, 0),
      operationType: values.redisOperationType,
      commandOrKeyName: values.redisCommandOrKeyName.trim() || null,
      expectedValue: values.redisExpectedValue.trim() || null,
      thresholdValue: null,
      timeoutSeconds: parseFormNumber(values.redisTimeoutSeconds, 30),
    };
  }

  if (checkType === CheckType.MongoDb) {
    payload.mongoDbConfiguration = {
      databaseCredentialId: Number(values.mongoCredentialId),
      operationType: values.mongoOperationType,
      collectionName: values.mongoCollectionName.trim() || null,
      queryJson: values.mongoQueryJson.trim() || null,
      expectedValue: values.mongoExpectedValue.trim() || null,
      thresholdValue: null,
      timeoutSeconds: parseFormNumber(values.mongoTimeoutSeconds, 30),
    };
  }

  return payload;
}

function dialogTitle(mode: CheckDialogMode): string {
  if (mode === 'edit') {
    return 'ویرایش شاخص';
  }

  if (mode === 'view') {
    return 'مشاهده شاخص';
  }

  return 'افزودن شاخص';
}

export function CreateCheckDialog(props: CreateCheckDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="md">
      {props.open ? <CreateCheckDialogBody {...props} /> : null}
    </Dialog>
  );
}

function CreateCheckDialogBody({
  mode,
  check,
  isSubmitting = false,
  submitError,
  onClose,
  onSubmit,
}: CreateCheckDialogProps) {
  const detailQuery = useCheck(check?.id ?? 0);
  const source = mode === 'create' ? null : (detailQuery.data ?? check ?? null);
  const waitingForDetail = mode !== 'create' && Boolean(check) && detailQuery.isLoading;

  if (waitingForDetail) {
    return (
      <>
        <DialogTitle>{dialogTitle(mode)}</DialogTitle>
        <DialogContent>
          <Stack sx={{ alignItems: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>بستن</Button>
        </DialogActions>
      </>
    );
  }

  return (
    <CheckWizard
      mode={mode}
      source={source}
      listItem={check}
      isSubmitting={isSubmitting}
      submitError={submitError}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

interface CheckWizardProps {
  mode: CheckDialogMode;
  source: CheckDefinitionDto | CheckListItem | null;
  listItem?: CheckListItem | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateCheckRequest) => void;
}

function CheckWizard({
  mode,
  source,
  listItem,
  isSubmitting = false,
  submitError,
  onClose,
  onSubmit,
}: CheckWizardProps) {
  const readOnly = mode === 'view';
  const [step, setStep] = useState(mode === 'create' ? 0 : 3);
  const [applicationId, setApplicationId] = useState<number | ''>(source?.applicationId ?? '');
  const [componentId, setComponentId] = useState<number | ''>(source?.applicationComponentId ?? '');
  const [checkType, setCheckType] = useState<CheckType | null>(source?.checkType ?? null);
  const [values, setValues] = useState<CheckFormValues>(source ? valuesFromCheck(source) : EMPTY_FORM);
  const [errors, setErrors] = useState<CheckFormErrors>({});
  const [stepError, setStepError] = useState<string | null>(null);

  const applicationsQuery = useMonitoringApplications();
  const componentsQuery = useApplicationComponents(Number(applicationId) || 0);
  const credentialsQuery = useDatabaseCredentials(
    checkType === 2 || // SqlQuery or DatabaseQuery
    checkType === CheckType.Redis ||
    checkType === CheckType.MongoDb,
  );

  const applications = applicationsQuery.data ?? [];
  const components = componentsQuery.data ?? [];
  const credentials = credentialsQuery.data ?? [];
  const summary = listItem ?? (source && 'applicationName' in source ? source : null);

  const patchValues = (patch: Partial<CheckFormValues>) => {
    setValues((current) => ({ ...current, ...patch }));
  };

  const handleNext = () => {
    if (step === 0 && !applicationId) {
      setStepError('انتخاب سامانه الزامی است');
      return;
    }

    if (step === 1 && !componentId) {
      setStepError('انتخاب مولفه الزامی است');
      return;
    }

    if (step === 2 && checkType == null) {
      setStepError('انتخاب نوع شاخص الزامی است');
      return;
    }

    setStepError(null);
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const handleSubmit = () => {
    if (readOnly) {
      return;
    }

    const nextErrors = validateCheckForm(values, checkType);
    setErrors(nextErrors);

    if (!applicationId || !componentId || checkType == null || Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit(buildCreatePayload(values, Number(componentId), checkType));
  };

  return (
    <>
      <DialogTitle>{dialogTitle(mode)}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {mode === 'create' ? (
            <Stepper activeStep={step} alternativeLabel>
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          ) : summary ? (
            <Typography variant="body2" color="text.secondary">
              {summary.applicationName} / {summary.componentName} / {getCheckTypeLabel(summary.checkType)}
            </Typography>
          ) : null}

          {step === 0 ? (
            <FormControl fullWidth disabled={mode !== 'create'} error={Boolean(stepError) && !applicationId}>
              <InputLabel id="check-application-label">سامانه</InputLabel>
              <Select
                labelId="check-application-label"
                id="check-application"
                label="سامانه"
                value={applicationId}
                onChange={(event) => {
                  const parsed = Number(event.target.value);
                  setApplicationId(Number.isFinite(parsed) && parsed > 0 ? parsed : '');
                  setComponentId('');
                  setStepError(null);
                }}
                inputProps={{ 'aria-label': 'سامانه' }}
              >
                <MenuItem value="">
                  <em>انتخاب کنید</em>
                </MenuItem>
                {applications.map((application) => (
                  <MenuItem key={application.id} value={application.id}>
                    {application.name}
                  </MenuItem>
                ))}
              </Select>
              {stepError && !applicationId ? <FormHelperText>{stepError}</FormHelperText> : null}
            </FormControl>
          ) : null}

          {step === 1 ? (
            <FormControl fullWidth disabled={mode !== 'create'} error={Boolean(stepError) && !componentId}>
              <InputLabel id="check-component-label">مولفه</InputLabel>
              <Select
                labelId="check-component-label"
                id="check-component"
                label="مولفه"
                value={componentId}
                onChange={(event) => {
                  const parsed = Number(event.target.value);
                  setComponentId(Number.isFinite(parsed) && parsed > 0 ? parsed : '');
                  setStepError(null);
                }}
                inputProps={{ 'aria-label': 'مولفه' }}
              >
                <MenuItem value="">
                  <em>انتخاب کنید</em>
                </MenuItem>
                {components.map((component) => (
                  <MenuItem key={component.id} value={component.id}>
                    {component.name}
                  </MenuItem>
                ))}
              </Select>
              {componentsQuery.isLoading ? (
                <FormHelperText>در حال بارگذاری مولفه‌ها...</FormHelperText>
              ) : null}
              {stepError && !componentId ? <FormHelperText>{stepError}</FormHelperText> : null}
            </FormControl>
          ) : null}

          {step === 2 ? (
            <Stack spacing={1}>
              <CheckTypeSelector
                value={checkType}
                disabled={mode !== 'create'}
                onChange={(value) => {
                  setCheckType(value);
                  setStepError(null);
                }}
              />
              {stepError && checkType == null ? (
                <Typography color="error" variant="body2">
                  {stepError}
                </Typography>
              ) : null}
            </Stack>
          ) : null}

          {step === 3 ? (
            <Stack spacing={3}>
              <CheckCommonFields
                values={values}
                errors={errors}
                readOnly={readOnly}
                onChange={patchValues}
              />
              {checkType === 1 ? ( // HttpRequest or Http (both have value 1)
                <HttpCheckForm
                  values={values}
                  errors={errors}
                  readOnly={readOnly}
                  onChange={patchValues}
                />
              ) : null}
              {checkType === 2 ? ( // SqlQuery or DatabaseQuery (both have value 2)
                <DatabaseCheckForm
                  values={values}
                  errors={errors}
                  credentials={credentials}
                  readOnly={readOnly}
                  onChange={patchValues}
                />
              ) : null}
              {checkType === CheckType.Redis ? (
                <RedisCheckForm
                  values={values}
                  errors={errors}
                  credentials={credentials}
                  readOnly={readOnly}
                  onChange={patchValues}
                />
              ) : null}
              {checkType === CheckType.MongoDb ? (
                <MongoDbCheckForm
                  values={values}
                  errors={errors}
                  credentials={credentials}
                  readOnly={readOnly}
                  onChange={patchValues}
                />
              ) : null}
            </Stack>
          ) : null}

          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          {readOnly ? 'بستن' : 'انصراف'}
        </Button>
        {mode === 'create' && step > 0 ? (
          <Button onClick={() => setStep((current) => current - 1)} disabled={isSubmitting}>
            قبلی
          </Button>
        ) : null}
        {mode === 'create' && step < STEPS.length - 1 ? (
          <Button variant="contained" onClick={handleNext}>
            بعدی
          </Button>
        ) : null}
        {!readOnly && (mode !== 'create' || step === STEPS.length - 1) ? (
          <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
        ) : null}
      </DialogActions>
    </>
  );
}
