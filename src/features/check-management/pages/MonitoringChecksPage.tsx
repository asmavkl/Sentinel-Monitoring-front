import AddIcon from '@mui/icons-material/Add';
import { Alert, Button, TablePagination, TextField } from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '@/api/apiUtils';
import { DashboardError, DashboardLoading } from '@/components/dashboard';
import {
  MonitoringEmptyState,
  MonitoringPageContainer,
  MonitoringSectionHeader,
  MonitoringTableCard,
  MonitoringToolbar,
} from '@/components/monitoring/layout';
import { useUserRoleSimple } from '@/features/auth/hooks/useUserRoleSimple';
import { canWriteMonitoring } from '@/auth';
import { ConfirmDeleteDialog } from '@/features/monitoring-management/components';
import { CheckTable } from '../components/CheckTable';
import { CreateCheckDialog, type CheckDialogMode } from '../components/CreateCheckDialog';
import {
  useActivateCheck,
  useChecks,
  useCreateCheck,
  useDeactivateCheck,
  useDeleteCheck,
  useUpdateCheck,
} from '../hooks';
import { filterChecks } from '../utils/checkLabels';
import { buildCheckRoute } from '@/routes/paths';
import type { CheckListItem, CreateCheckRequest } from '@/types/checkManagement';

const EMPTY_CHECKS_TITLE = 'هنوز شاخصی برای پایش تعریف نشده است';

export function MonitoringChecksPage() {
  const { data: role } = useUserRoleSimple();
  const canWrite = canWriteMonitoring(role);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const checksQuery = useChecks({ pageNumber: page + 1, pageSize: rowsPerPage });
  const createCheck = useCreateCheck();
  const updateCheck = useUpdateCheck();
  const deleteCheck = useDeleteCheck();
  const activateCheck = useActivateCheck();
  const deactivateCheck = useDeactivateCheck();

  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<CheckDialogMode>('create');
  const [selected, setSelected] = useState<CheckListItem | null>(null);
  const [deleting, setDeleting] = useState<CheckListItem | null>(null);

  const checks = checksQuery.data?.items ?? [];
  const totalCount = checksQuery.data?.totalCount ?? 0;
  const filteredChecks = useMemo(() => filterChecks(checks, search), [checks, search]);
  const mutationError = createCheck.error ?? updateCheck.error;
  const toggleError = activateCheck.error ?? deactivateCheck.error;
  const isSaving = createCheck.isPending || updateCheck.isPending;

  const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openCreate = () => {
    setSelected(null);
    setDialogMode('create');
    setDialogOpen(true);
    createCheck.reset();
    updateCheck.reset();
  };

  const openDialog = (mode: CheckDialogMode, check: CheckListItem) => {
    setSelected(check);
    setDialogMode(mode);
    setDialogOpen(true);
    createCheck.reset();
    updateCheck.reset();
  };

  const handleSubmit = async (payload: CreateCheckRequest) => {
    try {
      if (dialogMode === 'edit' && selected) {
        await updateCheck.mutateAsync({
          id: selected.id,
          payload: {
            name: payload.name,
            description: payload.description,
            intervalSeconds: payload.intervalSeconds,
            timeoutSeconds: payload.timeoutSeconds,
            retryCount: payload.retryCount,
            retryDelaySeconds: payload.retryDelaySeconds,
            isActive: payload.isActive,
            httpConfiguration: payload.httpConfiguration,
            sqlConfiguration: payload.sqlConfiguration,
            redisConfiguration: payload.redisConfiguration,
            mongoDbConfiguration: payload.mongoDbConfiguration,
          },
        });
        setDialogOpen(false);
        setSelected(null);
      } else {
        const result = await createCheck.mutateAsync(payload);
        setDialogOpen(false);
        setSelected(null);
        // Redirect to CheckDetailPage after successful creation
        if (result?.id) {
          navigate(buildCheckRoute(result.id));
        }
      }
    } catch {
      // Shown via mutation error in the dialog.
    }
  };

  const addButton = canWrite ? (
    <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
      افزودن شاخص
    </Button>
  ) : null;

  if (checksQuery.isLoading) {
    return (
      <MonitoringPageContainer>
        <MonitoringSectionHeader title="مدیریت پایش" />
        <DashboardLoading message="در حال بارگذاری شاخص‌ها..." />
      </MonitoringPageContainer>
    );
  }

  if (checksQuery.isError) {
    return (
      <MonitoringPageContainer>
        <MonitoringSectionHeader title="مدیریت پایش" />
        <DashboardError
          error={checksQuery.error}
          title="امکان بارگذاری شاخص‌ها وجود ندارد"
          onRetry={() => {
            void checksQuery.refetch();
          }}
        />
      </MonitoringPageContainer>
    );
  }

  return (
    <MonitoringPageContainer>
      <MonitoringSectionHeader title="مدیریت پایش" />
      <MonitoringToolbar
        title={
          <>
            شاخص‌ها
            {checks.length > 0 ? (
              <TextField
                size="small"
                label="جستجو"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                slotProps={{ htmlInput: { 'aria-label': 'جستجوی شاخص' } }}
                sx={{ ml: 2 }}
              />
            ) : null}
          </>
        }
        actions={addButton}
      />

      {toggleError ? (
        <Alert severity="error">{getErrorMessage(toggleError)}</Alert>
      ) : null}

      {checks.length === 0 ? (
        <MonitoringEmptyState
          title={EMPTY_CHECKS_TITLE}
          description="شاخص‌های HTTP و پایگاه داده را برای هر مولفه تعریف کنید."
          action={
            canWrite ? (
              <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ mt: 1 }}>
                افزودن شاخص
              </Button>
            ) : null
          }
        />
      ) : filteredChecks.length === 0 ? (
        <MonitoringEmptyState title="شاخصی با این فیلتر یافت نشد" />
      ) : (
        <MonitoringTableCard>
          <CheckTable
            checks={filteredChecks}
            canWrite={canWrite}
            onView={(item) => openDialog('view', item)}
            onEdit={(item) => openDialog('edit', item)}
            onDelete={(item) => {
              deleteCheck.reset();
              setDeleting(item);
            }}
            onToggleActive={(item) => {
              activateCheck.reset();
              deactivateCheck.reset();
              if (item.isActive) {
                void deactivateCheck.mutateAsync(item.id);
              } else {
                void activateCheck.mutateAsync(item.id);
              }
            }}
            onConfigureCriteria={(item) => {
              navigate(buildCheckRoute(item.id));
            }}
            onConfigureAlert={(item) => {
              navigate(`${buildCheckRoute(item.id)}#alert-policy`);
            }}
          />
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50]}
            labelRowsPerPage="تعداد در هر صفحه:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} از ${count !== -1 ? count : `بیش از ${to}`}`}
          />
        </MonitoringTableCard>
      )}

      <CreateCheckDialog
        open={dialogOpen}
        mode={dialogMode}
        check={selected}
        isSubmitting={isSaving}
        submitError={mutationError ? getErrorMessage(mutationError) : null}
        onClose={() => {
          setDialogOpen(false);
          setSelected(null);
        }}
        onSubmit={(payload) => {
          void handleSubmit(payload);
        }}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        title="حذف شاخص"
        message={
          deleting
            ? `شاخص «${deleting.name}» حذف شود؟ این عملیات قابل بازگشت نیست.`
            : 'این شاخص حذف شود؟'
        }
        isDeleting={deleteCheck.isPending}
        error={deleteCheck.error ? getErrorMessage(deleteCheck.error) : null}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) {
            return;
          }

          void deleteCheck.mutateAsync(deleting.id).then(() => {
            setDeleting(null);
          });
        }}
      />
    </MonitoringPageContainer>
  );
}
