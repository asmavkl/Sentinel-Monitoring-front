import AddIcon from '@mui/icons-material/Add';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { getErrorMessage } from '@/api/apiUtils';
import { DashboardError, DashboardLoading } from '@/components/dashboard';
import {
  MonitoringEmptyState,
  MonitoringPageContainer,
  MonitoringSectionHeader,
  MonitoringTableCard,
  MonitoringToolbar,
} from '@/components/monitoring/layout';
import { getCredentialTypeLabel } from '@/features/database-credentials/utils/credentialType';
import { CredentialType, DatabaseHealthQueryCategory } from '@/types/enums';
import type { DatabaseHealthQueryDto, DatabaseHealthQueryListFilters } from '@/types/databaseHealthQueries';
import { HealthQueryFormDialog, HealthQueryTable, type HealthQueryDialogMode } from '../components';
import {
  useActivateDatabaseHealthQuery,
  useCreateDatabaseHealthQuery,
  useDatabaseHealthQueries,
  useDeactivateDatabaseHealthQuery,
  useUpdateDatabaseHealthQuery,
} from '../hooks';
import {
  toCreateHealthQueryPayload,
  toUpdateHealthQueryPayload,
  type HealthQueryFormValues,
} from '../utils/formValidation';
import {
  ADD_HEALTH_QUERY_LABEL,
  DEACTIVATE_HEALTH_QUERY_MESSAGE,
  DEACTIVATE_HEALTH_QUERY_TITLE,
  HEALTH_QUERIES_LABEL,
  HEALTH_QUERY_UPDATED_NOTICE,
  getHealthQueryCategoryLabel,
} from '../utils/labels';

const RELATIONAL_TYPES = [
  CredentialType.SqlServer,
  CredentialType.PostgreSql,
  CredentialType.MySql,
  CredentialType.Oracle,
] as const;

const CATEGORIES = [
  DatabaseHealthQueryCategory.Connection,
  DatabaseHealthQueryCategory.Availability,
  DatabaseHealthQueryCategory.Performance,
  DatabaseHealthQueryCategory.Capacity,
  DatabaseHealthQueryCategory.Storage,
] as const;

export function DatabaseHealthQueriesPage() {
  // TODO: Restrict catalog menu and write actions to Admin when role checks are enabled.
  const canWrite = true;
  const [filters, setFilters] = useState<DatabaseHealthQueryListFilters>({});
  const [searchText, setSearchText] = useState('');
  const queriesQuery = useDatabaseHealthQueries({ ...filters, search: searchText });
  const createQuery = useCreateDatabaseHealthQuery();
  const updateQuery = useUpdateDatabaseHealthQuery();
  const activateQuery = useActivateDatabaseHealthQuery();
  const deactivateQuery = useDeactivateDatabaseHealthQuery();

  const [formOpen, setFormOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<HealthQueryDialogMode>('create');
  const [selected, setSelected] = useState<DatabaseHealthQueryDto | null>(null);
  const [deactivating, setDeactivating] = useState<DatabaseHealthQueryDto | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const queries = queriesQuery.data ?? [];
  const mutationError = createQuery.error ?? updateQuery.error;
  const isSaving = createQuery.isPending || updateQuery.isPending;

  const openCreate = () => {
    setSelected(null);
    setDialogMode('create');
    setFormOpen(true);
    setNotice(null);
    createQuery.reset();
    updateQuery.reset();
  };

  const openEdit = (query: DatabaseHealthQueryDto) => {
    setSelected(query);
    setDialogMode('edit');
    setFormOpen(true);
    setNotice(null);
    createQuery.reset();
    updateQuery.reset();
  };

  const handleSubmit = async (values: HealthQueryFormValues) => {
    try {
      if (dialogMode === 'edit' && selected) {
        await updateQuery.mutateAsync({
          id: selected.id,
          payload: toUpdateHealthQueryPayload(values),
        });
        setNotice(HEALTH_QUERY_UPDATED_NOTICE);
      } else {
        await createQuery.mutateAsync(toCreateHealthQueryPayload(values));
        setNotice(null);
      }

      setFormOpen(false);
      setSelected(null);
    } catch {
      // Shown via mutation error in the dialog.
    }
  };

  const addButton = canWrite ? (
    <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
      {ADD_HEALTH_QUERY_LABEL}
    </Button>
  ) : null;

  const filterBar = (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
      <TextField
        label="جستجو"
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        fullWidth
        slotProps={{ htmlInput: { 'aria-label': 'جستجو' } }}
      />
      <FormControl fullWidth>
        <InputLabel id="health-query-filter-type-label">نوع پایگاه داده</InputLabel>
        <Select
          labelId="health-query-filter-type-label"
          label="نوع پایگاه داده"
          value={filters.databaseType ?? ''}
          onChange={(event) => {
            const value = String(event.target.value);
            setFilters((current) => ({
              ...current,
              databaseType: value === '' ? undefined : (Number(value) as CredentialType),
            }));
          }}
          inputProps={{ 'aria-label': 'فیلتر نوع دیتابیس' }}
        >
          <MenuItem value="">همه</MenuItem>
          {RELATIONAL_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {getCredentialTypeLabel(type)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel id="health-query-filter-category-label">دسته‌بندی</InputLabel>
        <Select
          labelId="health-query-filter-category-label"
          label="دسته‌بندی"
          value={filters.category ?? ''}
          onChange={(event) => {
            const value = String(event.target.value);
            setFilters((current) => ({
              ...current,
              category: value === '' ? undefined : (Number(value) as DatabaseHealthQueryCategory),
            }));
          }}
          inputProps={{ 'aria-label': 'فیلتر دسته‌بندی' }}
        >
          <MenuItem value="">همه</MenuItem>
          {CATEGORIES.map((category) => (
            <MenuItem key={category} value={category}>
              {getHealthQueryCategoryLabel(category)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel id="health-query-filter-status-label">وضعیت</InputLabel>
        <Select
          labelId="health-query-filter-status-label"
          label="وضعیت"
          value={filters.isActive == null ? '' : filters.isActive ? 'active' : 'inactive'}
          onChange={(event) => {
            const value = String(event.target.value);
            setFilters((current) => ({
              ...current,
              isActive: value === '' ? undefined : value === 'active',
            }));
          }}
          inputProps={{ 'aria-label': 'فیلتر وضعیت' }}
        >
          <MenuItem value="">همه</MenuItem>
          <MenuItem value="active">فعال</MenuItem>
          <MenuItem value="inactive">غیرفعال</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );

  const dialogs = (
    <>
      <HealthQueryFormDialog
        open={formOpen}
        mode={dialogMode}
        healthQuery={selected}
        isSubmitting={isSaving}
        submitError={mutationError ? getErrorMessage(mutationError) : null}
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        onSubmit={(values) => {
          void handleSubmit(values);
        }}
      />
      <Dialog open={Boolean(deactivating)} onClose={() => setDeactivating(null)}>
        <DialogTitle>{DEACTIVATE_HEALTH_QUERY_TITLE}</DialogTitle>
        <DialogContent>
          <DialogContentText>{DEACTIVATE_HEALTH_QUERY_MESSAGE}</DialogContentText>
          {deactivateQuery.error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {getErrorMessage(deactivateQuery.error)}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeactivating(null)} disabled={deactivateQuery.isPending}>
            انصراف
          </Button>
          <Button
            color="warning"
            variant="contained"
            disabled={deactivateQuery.isPending}
            onClick={() => {
              if (!deactivating) {
                return;
              }

              void deactivateQuery.mutateAsync(deactivating.id).then(
                () => {
                  setDeactivating(null);
                },
                () => undefined,
              );
            }}
          >
            {deactivateQuery.isPending ? 'در حال غیرفعال‌سازی...' : 'غیرفعال کردن'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  if (queriesQuery.isLoading) {
    return (
      <MonitoringPageContainer>
        <MonitoringSectionHeader title="مدیریت پایش" />
        <MonitoringToolbar title={HEALTH_QUERIES_LABEL} actions={addButton} />
        {filterBar}
        <DashboardLoading message="در حال بارگذاری کوئری‌های سلامت..." />
        {dialogs}
      </MonitoringPageContainer>
    );
  }

  if (queriesQuery.isError) {
    return (
      <MonitoringPageContainer>
        <MonitoringSectionHeader title="مدیریت پایش" />
        <MonitoringToolbar title={HEALTH_QUERIES_LABEL} actions={addButton} />
        {filterBar}
        <DashboardError
          error={queriesQuery.error}
          title="امکان بارگذاری کوئری‌های سلامت وجود ندارد"
          onRetry={() => {
            void queriesQuery.refetch();
          }}
        />
        {dialogs}
      </MonitoringPageContainer>
    );
  }

  return (
    <MonitoringPageContainer>
      <MonitoringSectionHeader title="مدیریت پایش" />
      <MonitoringToolbar title={HEALTH_QUERIES_LABEL} actions={addButton} />
      {filterBar}
      {notice ? <Alert severity="info">{notice}</Alert> : null}
      {activateQuery.error ? <Alert severity="error">{getErrorMessage(activateQuery.error)}</Alert> : null}

      {queries.length === 0 ? (
        <MonitoringEmptyState
          title="کوئری سلامت دیتابیسی یافت نشد"
          description="با فیلترهای دیگر جستجو کنید یا یک کوئری سلامت جدید بسازید."
          action={
            canWrite ? (
              <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ mt: 1 }}>
                {ADD_HEALTH_QUERY_LABEL}
              </Button>
            ) : null
          }
        />
      ) : (
        <MonitoringTableCard>
          <HealthQueryTable
            queries={queries}
            canWrite={canWrite}
            togglingId={
              deactivateQuery.isPending
                ? deactivateQuery.variables
                : activateQuery.isPending
                  ? activateQuery.variables
                  : null
            }
            onEdit={openEdit}
            onToggleActive={(query) => {
              setNotice(null);
              activateQuery.reset();
              deactivateQuery.reset();
              if (query.isActive) {
                setDeactivating(query);
                return;
              }

              void activateQuery.mutateAsync(query.id);
            }}
          />
        </MonitoringTableCard>
      )}
      {dialogs}
    </MonitoringPageContainer>
  );
}
