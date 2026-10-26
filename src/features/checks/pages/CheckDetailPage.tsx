import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getErrorMessage } from '@/api/apiUtils';
import { BackButton } from '@/components/common';
import { ROUTES } from '@/routes/paths';
import { ConfirmDeleteDialog } from '@/features/monitoring-management/components/ConfirmDeleteDialog';
import { CriteriaRuleEditor } from '@/features/checks/components/CriteriaRuleEditor';
import { CheckSqlSourceCard } from '@/features/checks/components/CheckSqlSourceCard';
import {
  useCheck,
  useCheckCriteria,
  useCreateCriteria,
  useDeleteCriteria,
  useUpdateCriteria,
} from '@/features/check-management/hooks/useCheckManagement';
import { ApplicationHealthStatus, CriteriaOperator } from '@/types/enums';
import type { CriteriaDefinitionDto, CriteriaRuleDto } from '@/types/checkManagement';
import { AlertPolicyPanel } from '@/features/alerts/components/AlertPolicyPanel';
import { HEALTH_STATUS_COLORS, HEALTH_STATUS_LABELS } from '@/utils/healthStatus';

const OPERATOR_LABELS: Record<number, string> = {
  [CriteriaOperator.Equals]: 'برابر با',
  [CriteriaOperator.LessThan]: 'کمتر از',
  [CriteriaOperator.LessThanOrEqual]: 'کمتر یا مساوی',
  [CriteriaOperator.GreaterThan]: 'بیشتر از',
  [CriteriaOperator.GreaterThanOrEqual]: 'بیشتر یا مساوی',
  [CriteriaOperator.Between]: 'بین',
};

function RuleSummary({ rule }: { rule: CriteriaRuleDto }) {
  const status = rule.healthStatus as ApplicationHealthStatus;
  const statusColor = HEALTH_STATUS_COLORS[status] ?? HEALTH_STATUS_COLORS[ApplicationHealthStatus.Unknown];
  const isBetween = rule.operator === CriteriaOperator.Between;

  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1.25,
        border: '1px solid',
        borderColor: 'divider',
        borderInlineStartWidth: 4,
        borderInlineStartStyle: 'solid',
        borderInlineStartColor: statusColor,
        borderRadius: 1,
        bgcolor: alpha(statusColor, theme.palette.mode === 'dark' ? 0.16 : 0.07),
      })}
    >
      <Typography
        variant="caption"
        sx={{
          minWidth: 28,
          height: 28,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          borderRadius: '50%',
          fontWeight: 700,
          color: '#fff',
          bgcolor: statusColor,
        }}
        aria-hidden
      >
        {rule.priority}
      </Typography>

      <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
        اگر مقدار{' '}
        <Box component="span" sx={{ fontWeight: 700 }}>
          {OPERATOR_LABELS[rule.operator] ?? 'نامشخص'}
        </Box>
        {' '}
        {isBetween ? (
          <>
            <Box component="span" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {rule.minValue}
            </Box>
            {' تا '}
            <Box component="span" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {rule.maxValue}
            </Box>
          </>
        ) : (
          <Box component="span" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {rule.expectedValue}
          </Box>
        )}
        {' '}
        باشد
      </Typography>

      <Chip
        size="small"
        label={HEALTH_STATUS_LABELS[status] ?? 'نامشخص'}
        sx={{ flexShrink: 0, fontWeight: 600, bgcolor: statusColor, color: '#fff' }}
      />
    </Box>
  );
}

export function CheckDetailPage() {
  const { checkId } = useParams<{ checkId: string }>();
  const checkIdNum = Number(checkId);
  const [isEditingCriteria, setIsEditingCriteria] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: check, isLoading: checkLoading } = useCheck(checkIdNum);
  const { data: criteria, isLoading: criteriaLoading, refetch: refetchCriteria } = useCheckCriteria(checkIdNum);
  const createCriteria = useCreateCriteria();
  const updateCriteria = useUpdateCriteria();
  const deleteCriteria = useDeleteCriteria();

  useEffect(() => {
    if (checkLoading || window.location.hash !== '#alert-policy') {
      return;
    }

    document.getElementById('alert-policy')?.scrollIntoView({ block: 'start' });
  }, [checkLoading, checkIdNum]);

  const handleSaveCriteria = async (criteriaData: CriteriaDefinitionDto) => {
    try {
      setSaveError(null);
      const rulesPayload = criteriaData.rules.map((rule) => {
        if (rule.operator === CriteriaOperator.Between) {
          return {
            operator: rule.operator,
            expectedValue: null,
            minValue: rule.minValue,
            maxValue: rule.maxValue,
            healthStatus: rule.healthStatus,
            priority: rule.priority,
          };
        }
        return {
          operator: rule.operator,
          expectedValue: rule.expectedValue,
          minValue: null,
          maxValue: null,
          healthStatus: rule.healthStatus,
          priority: rule.priority,
        };
      });

      if (criteria?.id) {
        await updateCriteria.mutateAsync({
          checkId: checkIdNum,
          criteriaId: criteria.id,
          payload: {
            isActive: criteriaData.isActive,
            rules: rulesPayload,
          },
        });
      } else {
        await createCriteria.mutateAsync({
          checkId: checkIdNum,
          payload: {
            isActive: criteriaData.isActive,
            rules: rulesPayload,
          },
        });
      }
      await refetchCriteria();
      setIsEditingCriteria(false);
    } catch (error) {
      setSaveError(getErrorMessage(error));
    }
  };

  const handleDeleteCriteria = async () => {
    if (!criteria?.id) {
      return;
    }
    try {
      setDeleteError(null);
      await deleteCriteria.mutateAsync({ checkId: checkIdNum, criteriaId: criteria.id });
      await refetchCriteria();
      setDeleteOpen(false);
      setIsEditingCriteria(false);
    } catch (error) {
      setDeleteError(getErrorMessage(error));
    }
  };

  if (checkLoading) {
    return (
      <Stack spacing={2}>
        <BackButton fallbackTo={ROUTES.monitoringChecks} />
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 240 }}>
          <CircularProgress />
        </Box>
      </Stack>
    );
  }

  const sortedRules = [...(criteria?.rules ?? [])].sort((left, right) => left.priority - right.priority);

  return (
    <Stack spacing={2}>
      <Stack spacing={0.75}>
        <BackButton fallbackTo={ROUTES.monitoringChecks} />
        <Box>
          <Typography component="h1" sx={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.3 }}>
            {check?.name ?? 'پایش'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            معیار سلامت
          </Typography>
        </Box>
      </Stack>

      {saveError ? <Alert severity="error">{saveError}</Alert> : null}

      {check ? <CheckSqlSourceCard check={check} /> : null}

      {criteriaLoading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 180 }}>
          <CircularProgress />
        </Box>
      ) : isEditingCriteria ? (
        <CriteriaRuleEditor
          criteria={criteria ?? undefined}
          checkId={checkIdNum}
          onSave={handleSaveCriteria}
          onCancel={() => {
            setSaveError(null);
            setIsEditingCriteria(false);
          }}
          isLoading={createCriteria.isPending || updateCriteria.isPending}
        />
      ) : criteria ? (
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="h6">قوانین معیار</Typography>
                  <Chip size="small" label={`${sortedRules.length} قانون`} variant="outlined" />
                  <Chip
                    size="small"
                    label={criteria.isActive ? 'فعال' : 'غیرفعال'}
                    color={criteria.isActive ? 'info' : 'default'}
                  />
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<EditOutlinedIcon />}
                    onClick={() => setIsEditingCriteria(true)}
                  >
                    ویرایش
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => {
                      setDeleteError(null);
                      setDeleteOpen(true);
                    }}
                  >
                    حذف
                  </Button>
                </Stack>
              </Stack>

              {!criteria.isActive ? (
                <Alert severity="warning" variant="outlined">
                  این معیار خاموش است و در محاسبه سلامت استفاده نمی‌شود.
                </Alert>
              ) : null}

              {sortedRules.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  قانونی برای این معیار ثبت نشده است.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {sortedRules.map((rule, index) => (
                    <RuleSummary key={rule.id ?? `${rule.priority}-${index}`} rule={rule} />
                  ))}
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            px: 2,
            py: 5,
            textAlign: 'center',
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            معیار سلامت تعریف نشده
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
            تا وقتی قانونی نباشد، سلامت این پایش نامشخص می‌ماند.
          </Typography>
          <Button variant="contained" startIcon={<EditOutlinedIcon />} onClick={() => setIsEditingCriteria(true)}>
            تنظیم معیارها
          </Button>
        </Box>
      )}

      {Number.isFinite(checkIdNum) && checkIdNum > 0 ? (
        <AlertPolicyPanel owner={{ type: 'check', checkId: checkIdNum }} />
      ) : null}

      <ConfirmDeleteDialog
        open={deleteOpen}
        title="حذف معیار سلامت"
        message="همه قانون‌های این معیار حذف می‌شوند و سلامت پایش نامشخص می‌ماند."
        isDeleting={deleteCriteria.isPending}
        error={deleteError}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          void handleDeleteCriteria();
        }}
      />
    </Stack>
  );
}
