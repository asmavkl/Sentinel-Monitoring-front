import { Alert, Box, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material';
import { getErrorMessage } from '@/api/apiUtils';
import { useDatabaseHealthQuery } from '@/features/database-health-queries/hooks';
import { getResultTypeLabel } from '@/features/check-management/utils/checkLabels';
import { getSqlConfiguration } from '@/features/check-management/utils/sqlCheckPayload';
import type { CheckDefinitionDto } from '@/types/checkManagement';
import { CheckType } from '@/types/enums';

interface CheckSqlSourceCardProps {
  check: CheckDefinitionDto;
}

export function CheckSqlSourceCard({ check }: CheckSqlSourceCardProps) {
  const sql = getSqlConfiguration(check);
  const healthQueryId = sql?.healthQueryId ?? 0;
  const healthQuery = useDatabaseHealthQuery(check.checkType === CheckType.SqlQuery ? healthQueryId : 0);

  if (check.checkType !== CheckType.SqlQuery || !sql) {
    return null;
  }

  if (healthQueryId > 0) {
    return (
      <Card>
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="h6">کوئری سلامت</Typography>
            {healthQuery.isLoading ? (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <CircularProgress size={18} />
                <Typography variant="body2" color="text.secondary">
                  در حال بارگذاری کوئری‌های سلامت دیتابیس...
                </Typography>
              </Stack>
            ) : null}
            {healthQuery.isError ? <Alert severity="error">{getErrorMessage(healthQuery.error)}</Alert> : null}
            {healthQuery.data ? (
              <>
                <Typography variant="body2">
                  {healthQuery.data.displayName} ({healthQuery.data.name})
                </Typography>
                <Box dir="ltr">
                  <Typography
                    component="pre"
                    variant="body2"
                    sx={{
                      m: 0,
                      p: 1.5,
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'monospace',
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                    }}
                  >
                    {healthQuery.data.query}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  متن از کاتالوگ خوانده می‌شود. نتیجه Scalar است.
                </Typography>
              </>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="h6">SQL سفارشی</Typography>
          <Typography variant="body2" color="text.secondary">
            Result Type: {getResultTypeLabel(sql.resultType)}
          </Typography>
          <Box dir="ltr">
            <Typography
              component="pre"
              variant="body2"
              sx={{
                m: 0,
                p: 1.5,
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                bgcolor: 'action.hover',
                borderRadius: 1,
              }}
            >
              {sql.query?.trim() ? sql.query : '—'}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
