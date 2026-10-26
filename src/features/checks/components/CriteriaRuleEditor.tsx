import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ApplicationHealthStatus, CriteriaOperator } from '@/types/enums';
import type { CriteriaDefinitionDto, CriteriaRuleDto } from '@/types/checkManagement';
import { HEALTH_STATUS_COLORS, HEALTH_STATUS_LABELS } from '@/utils/healthStatus';

const OPERATORS: { value: CriteriaOperator; label: string; symbol: string }[] = [
  { value: CriteriaOperator.GreaterThan, label: 'بیشتر از', symbol: '>' },
  { value: CriteriaOperator.GreaterThanOrEqual, label: 'بیشتر یا مساوی', symbol: '≥' },
  { value: CriteriaOperator.LessThan, label: 'کمتر از', symbol: '<' },
  { value: CriteriaOperator.LessThanOrEqual, label: 'کمتر یا مساوی', symbol: '≤' },
  { value: CriteriaOperator.Equals, label: 'برابر', symbol: '=' },
  { value: CriteriaOperator.Between, label: 'بین', symbol: '↔' },
];

const HEALTH_OPTIONS: ApplicationHealthStatus[] = [
  ApplicationHealthStatus.Normal,
  ApplicationHealthStatus.Warning,
  ApplicationHealthStatus.Critical,
  ApplicationHealthStatus.OutOfService,
  ApplicationHealthStatus.Unknown,
];

interface CriteriaRuleEditorProps {
  criteria?: CriteriaDefinitionDto;
  checkId: number;
  onSave: (criteria: CriteriaDefinitionDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
  activeSwitchLabel?: string;
  inactiveSwitchLabel?: string;
  activeHint?: string;
  inactiveHint?: string;
  betweenHint?: string;
}

function parseNumber(value: string): number | null {
  if (value.trim() === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function validateRule(rule: CriteriaRuleDto): string | null {
  if (rule.operator === CriteriaOperator.Between) {
    if (rule.minValue === null || rule.minValue === undefined) {
      return 'حد پایین را وارد کنید.';
    }
    if (rule.maxValue === null || rule.maxValue === undefined) {
      return 'حد بالا را وارد کنید.';
    }
    if (rule.minValue >= rule.maxValue) {
      return 'حد پایین باید کوچک‌تر از حد بالا باشد.';
    }
    return null;
  }

  if (rule.expectedValue === null || rule.expectedValue === undefined) {
    return 'مقدار شرط را وارد کنید.';
  }

  return null;
}

function applyRulePatch<T extends CriteriaRuleDto>(rule: T, patch: Partial<CriteriaRuleDto>): T {
  const next = { ...rule, ...patch };
  if (patch.operator === undefined) {
    return next;
  }
  if (patch.operator === CriteriaOperator.Between) {
    next.expectedValue = null;
  } else {
    next.minValue = null;
    next.maxValue = null;
  }
  return next;
}

type EditableRule = CriteriaRuleDto & { clientKey: string };

let ruleKeySeed = 0;

function nextRuleKey(): string {
  ruleKeySeed += 1;
  return `rule-${ruleKeySeed}`;
}

function toEditableRule(rule: CriteriaRuleDto): EditableRule {
  return { ...rule, clientKey: nextRuleKey() };
}

function createDraftRule(priority: number): EditableRule {
  return toEditableRule({
    operator: CriteriaOperator.GreaterThan,
    expectedValue: null,
    minValue: null,
    maxValue: null,
    healthStatus: ApplicationHealthStatus.Warning,
    priority,
  });
}

interface RuleCardProps {
  rule: CriteriaRuleDto;
  index: number;
  total: number;
  error?: string;
  disabled?: boolean;
  onChange: (patch: Partial<CriteriaRuleDto>) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}

function RuleCard({ rule, index, total, error, disabled = false, onChange, onRemove, onMove }: RuleCardProps) {
  const statusColor = HEALTH_STATUS_COLORS[rule.healthStatus] ?? HEALTH_STATUS_COLORS[ApplicationHealthStatus.Unknown];
  const isBetween = rule.operator === CriteriaOperator.Between;

  return (
    <Box
      sx={(theme) => ({
        p: 1.5,
        border: '1px solid',
        borderColor: error ? 'error.main' : 'divider',
        borderInlineStartWidth: 4,
        borderInlineStartStyle: 'solid',
        borderInlineStartColor: statusColor,
        borderRadius: 1,
        bgcolor: alpha(statusColor, theme.palette.mode === 'dark' ? 0.16 : 0.07),
      })}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography
            variant="caption"
            sx={{
              minWidth: 28,
              height: 28,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '50%',
              fontWeight: 700,
              color: '#fff',
              bgcolor: statusColor,
            }}
            aria-hidden
          >
            {index + 1}
          </Typography>
          <Typography variant="subtitle2" sx={{ flex: 1 }}>
            قانون {index + 1}
          </Typography>
          <Tooltip title="جابه‌جایی به بالا">
            <span>
              <IconButton
                size="small"
                aria-label={`انتقال قانون ${index + 1} به بالا`}
                disabled={disabled || index === 0}
                onClick={() => onMove(-1)}
              >
                <KeyboardArrowUpIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="جابه‌جایی به پایین">
            <span>
              <IconButton
                size="small"
                aria-label={`انتقال قانون ${index + 1} به پایین`}
                disabled={disabled || index === total - 1}
                onClick={() => onMove(1)}
              >
                <KeyboardArrowDownIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="حذف قانون">
            <IconButton
              size="small"
              color="error"
              aria-label={`حذف قانون ${index + 1}`}
              disabled={disabled}
              onClick={onRemove}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
            اگر مقدار
          </Typography>
          <FormControl size="small" sx={{ minWidth: 180 }} disabled={disabled}>
            <InputLabel id={`rule-${index}-operator`}>عملگر</InputLabel>
            <Select
              labelId={`rule-${index}-operator`}
              label="عملگر"
              value={rule.operator}
              onChange={(event) => onChange({ operator: Number(event.target.value) as CriteriaOperator })}
            >
              {OPERATORS.map((operator) => (
                <MenuItem key={operator.value} value={operator.value}>
                  {operator.symbol} {operator.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {isBetween ? (
            <>
              <TextField
                label="از"
                type="number"
                size="small"
                value={rule.minValue ?? ''}
                disabled={disabled}
                onChange={(event) => onChange({ minValue: parseNumber(event.target.value) })}
                sx={{ width: 112 }}
                slotProps={{ htmlInput: { 'aria-label': `حد پایین قانون ${index + 1}` } }}
              />
              <Typography variant="body2" color="text.secondary">
                تا
              </Typography>
              <TextField
                label="تا"
                type="number"
                size="small"
                value={rule.maxValue ?? ''}
                disabled={disabled}
                onChange={(event) => onChange({ maxValue: parseNumber(event.target.value) })}
                sx={{ width: 112 }}
                slotProps={{ htmlInput: { 'aria-label': `حد بالای قانون ${index + 1}` } }}
              />
            </>
          ) : (
            <TextField
              label="مقدار"
              type="number"
              size="small"
              value={rule.expectedValue ?? ''}
              disabled={disabled}
              onChange={(event) => onChange({ expectedValue: parseNumber(event.target.value) })}
              sx={{ width: 120 }}
              slotProps={{ htmlInput: { 'aria-label': `مقدار قانون ${index + 1}` } }}
            />
          )}

          <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
            باشد، وضعیت
          </Typography>
          <FormControl size="small" sx={{ minWidth: 180 }} disabled={disabled}>
            <InputLabel id={`rule-${index}-status`}>وضعیت سلامت</InputLabel>
            <Select
              labelId={`rule-${index}-status`}
              label="وضعیت سلامت"
              value={rule.healthStatus}
              onChange={(event) => onChange({ healthStatus: Number(event.target.value) as ApplicationHealthStatus })}
            >
              {HEALTH_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: HEALTH_STATUS_COLORS[status],
                      }}
                    />
                    {HEALTH_STATUS_LABELS[status]}
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {error ? <FormHelperText error sx={{ mx: 0 }}>{error}</FormHelperText> : null}
      </Stack>
    </Box>
  );
}

export function CriteriaRuleEditor({
  criteria,
  checkId,
  onSave,
  onCancel,
  isLoading = false,
  activeSwitchLabel = 'فعال',
  inactiveSwitchLabel = 'غیرفعال',
  activeHint,
  inactiveHint,
  betweenHint,
}: CriteriaRuleEditorProps) {
  const [isActive, setIsActive] = useState(criteria?.isActive ?? true);
  const [rules, setRules] = useState<EditableRule[]>(() =>
    [...(criteria?.rules ?? [])]
      .sort((left, right) => left.priority - right.priority)
      .map(toEditableRule),
  );
  const [errors, setErrors] = useState<Record<number, string>>({});

  const updateRule = (index: number, patch: Partial<CriteriaRuleDto>) => {
    setRules((current) => current.map((rule, ruleIndex) => (
      ruleIndex === index ? applyRulePatch(rule, patch) : rule
    )));
    setErrors((current) => {
      if (!current[index]) {
        return current;
      }
      const next = { ...current };
      delete next[index];
      return next;
    });
  };

  const removeRule = (index: number) => {
    setRules((current) => current.filter((_, ruleIndex) => ruleIndex !== index));
    setErrors({});
  };

  const moveRule = (index: number, direction: -1 | 1) => {
    setRules((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) {
        return current;
      }
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
    setErrors({});
  };

  const addRule = () => {
    setRules((current) => [...current, createDraftRule(current.length + 1)]);
  };

  const handleSave = () => {
    const nextErrors: Record<number, string> = {};
    rules.forEach((rule, index) => {
      const error = validateRule(rule);
      if (error) {
        nextErrors[index] = error;
      }
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSave({
      id: criteria?.id,
      checkDefinitionId: checkId,
      isActive,
      rules: rules.map(({ clientKey: _clientKey, ...rule }, index) => ({
        ...rule,
        priority: index + 1,
      })),
    });
  };

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
          >
            <Box>
              <Typography variant="h6">قوانین معیار سلامت</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 640 }}>
                هر قانون می‌گوید اگر مقدار پایش با شرط جور شد، چه وضعیتی ثبت شود.
                ترتیب کارت‌ها همان اولویت است؛ کارت بالاتر اولویت ۱ دارد.
              </Typography>
            </Box>
            <FormControlLabel
              sx={{ m: 0, flexShrink: 0, alignSelf: { xs: 'flex-start', sm: 'center' } }}
              control={(
                <Switch
                  checked={isActive}
                  color="success"
                  disabled={isLoading}
                  onChange={(event) => setIsActive(event.target.checked)}
                  slotProps={{ input: { 'aria-label': 'فعال بودن معیار سلامت' } }}
                />
              )}
              label={isActive ? activeSwitchLabel : inactiveSwitchLabel}
            />
          </Stack>

          {isActive && activeHint ? (
            <Alert severity="info" variant="outlined">
              {activeHint}
            </Alert>
          ) : null}

          {!isActive ? (
            <Alert severity="warning" variant="outlined">
              {inactiveHint ??
                'معیار خاموش است. قانون‌ها نگه داشته می‌شوند، ولی تا روشن شدن در محاسبه سلامت استفاده نمی‌شوند.'}
            </Alert>
          ) : null}

          {betweenHint ? (
            <Alert severity="info" variant="outlined">
              {betweenHint}
            </Alert>
          ) : null}

          {rules.length === 0 ? (
            <Box
              sx={{
                px: 2,
                py: 4,
                textAlign: 'center',
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                هنوز قانونی ندارید
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                بدون قانون، سلامت این پایش نامشخص می‌ماند.
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={addRule} disabled={isLoading}>
                افزودن اولین قانون
              </Button>
            </Box>
          ) : (
            <Stack spacing={1.25}>
              {rules.map((rule, index) => (
                <RuleCard
                  key={rule.clientKey}
                  rule={rule}
                  index={index}
                  total={rules.length}
                  error={errors[index]}
                  disabled={isLoading}
                  onChange={(patch) => updateRule(index, patch)}
                  onRemove={() => removeRule(index)}
                  onMove={(direction) => moveRule(index, direction)}
                />
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addRule}
                disabled={isLoading}
                sx={{ alignSelf: 'flex-start' }}
              >
                افزودن قانون
              </Button>
            </Stack>
          )}

          <Divider />

          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
            <Button onClick={onCancel} disabled={isLoading}>
              انصراف
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'در حال ذخیره…' : 'ذخیره معیار'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
