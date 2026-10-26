export interface ServerFormValues {
  name: string;
  description: string;
  host: string;
  port: string;
  credentialId: string;
  isActive: boolean;
  intervalSeconds: string;
  timeoutSeconds: string;
  retryCount: string;
  retryDelaySeconds: string;
}

export interface ServerFormErrors {
  name?: string;
  host?: string;
  port?: string;
  credentialId?: string;
  intervalSeconds?: string;
  timeoutSeconds?: string;
  retryCount?: string;
  retryDelaySeconds?: string;
}

export const EMPTY_SERVER_FORM: ServerFormValues = {
  name: '',
  description: '',
  host: '',
  port: '',
  credentialId: '',
  isActive: true,
  intervalSeconds: '30',
  timeoutSeconds: '20',
  retryCount: '0',
  retryDelaySeconds: '5',
};

function parseBoundedInt(
  value: string,
  min: number,
  message: string,
): { value: number | null; error?: string } {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) {
    return { value: null, error: message };
  }

  const parsed = Number(trimmed);
  if (parsed < min) {
    return { value: null, error: message };
  }

  return { value: parsed };
}

export function validateServerForm(values: ServerFormValues): ServerFormErrors {
  const errors: ServerFormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'نام سرور الزامی است';
  }

  if (!values.host.trim()) {
    errors.host = 'IP سرور الزامی است';
  }

  if (values.port.trim()) {
    const port = parseBoundedInt(values.port, 1, 'پورت باید بین ۱ و ۶۵۵۳۵ باشد');
    if (port.error || (port.value != null && port.value > 65535)) {
      errors.port = 'پورت باید بین ۱ و ۶۵۵۳۵ باشد';
    }
  }

  if (!values.credentialId) {
    errors.credentialId = 'انتخاب اعتبارنامه SNMP الزامی است';
  }

  const interval = parseBoundedInt(values.intervalSeconds, 1, 'فاصله اجرا باید حداقل ۱ ثانیه باشد');
  if (interval.error) {
    errors.intervalSeconds = interval.error;
  }

  const timeout = parseBoundedInt(values.timeoutSeconds, 1, 'مهلت باید حداقل ۱ ثانیه باشد');
  if (timeout.error) {
    errors.timeoutSeconds = timeout.error;
  }

  const retryCount = parseBoundedInt(values.retryCount, 0, 'تعداد تلاش مجدد نمی‌تواند منفی باشد');
  if (retryCount.error) {
    errors.retryCount = retryCount.error;
  }

  const retryDelay = parseBoundedInt(
    values.retryDelaySeconds,
    0,
    'تأخیر تلاش مجدد نمی‌تواند منفی باشد',
  );
  if (retryDelay.error) {
    errors.retryDelaySeconds = retryDelay.error;
  }

  return errors;
}

export function toServerRequest(values: ServerFormValues) {
  return {
    name: values.name.trim(),
    description: values.description.trim() ? values.description.trim() : null,
    host: values.host.trim(),
    port: values.port.trim() ? Number(values.port.trim()) : null,
    credentialId: Number(values.credentialId),
    isActive: values.isActive,
    intervalSeconds: Number(values.intervalSeconds),
    timeoutSeconds: Number(values.timeoutSeconds),
    retryCount: Number(values.retryCount),
    retryDelaySeconds: Number(values.retryDelaySeconds),
  };
}
