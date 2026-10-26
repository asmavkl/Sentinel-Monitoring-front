import AddIcon from '@mui/icons-material/Add';
import { Alert, Button } from '@mui/material';
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
import { useDatabaseCredentials } from '@/features/database-credentials/hooks';
import { useUserRoleSimple } from '@/features/auth/hooks/useUserRoleSimple';
import { canWriteMonitoring } from '@/auth';
import { ConfirmDeleteDialog } from '@/features/monitoring-management/components';
import { buildMonitoringServerRoute } from '@/routes/paths';
import type { MonitoredServerDto, MonitoredServerStatusDto } from '@/types/monitoredServers';
import { ServerFormDialog, type ServerDialogMode } from '../components/ServerFormDialog';
import { ServerTable } from '../components/ServerTable';
import {
  useActivateMonitoredServer,
  useCreateMonitoredServer,
  useDeactivateMonitoredServer,
  useDeleteMonitoredServer,
  useMonitoredServerStatuses,
  useMonitoredServers,
  useUpdateMonitoredServer,
} from '../hooks';
import {
  ADD_SERVER_LABEL,
  EMPTY_SERVERS_DESCRIPTION,
  EMPTY_SERVERS_TITLE,
  SERVERS_LABEL,
  SERVERS_LOAD_ERROR_TITLE,
  SERVERS_LOADING_MESSAGE,
} from '../utils/labels';
import type { toServerRequest } from '../utils/formValidation';

export function MonitoredServersPage() {
  const { data: role } = useUserRoleSimple();
  const canWrite = canWriteMonitoring(role);
  const navigate = useNavigate();
  const serversQuery = useMonitoredServers();
  const credentialsQuery = useDatabaseCredentials();
  const createServer = useCreateMonitoredServer();
  const updateServer = useUpdateMonitoredServer();
  const activateServer = useActivateMonitoredServer();
  const deactivateServer = useDeactivateMonitoredServer();
  const deleteServer = useDeleteMonitoredServer();

  const servers = useMemo(() => serversQuery.data ?? [], [serversQuery.data]);
  const statusQueries = useMonitoredServerStatuses(servers.map((server) => server.id));

  const [formOpen, setFormOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<ServerDialogMode>('create');
  const [selected, setSelected] = useState<MonitoredServerDto | null>(null);
  const [deleting, setDeleting] = useState<MonitoredServerDto | null>(null);

  const credentialsById = useMemo(
    () => new Map((credentialsQuery.data ?? []).map((credential) => [credential.id, credential])),
    [credentialsQuery.data],
  );
  const statusById = useMemo(() => {
    const map = new Map<number, MonitoredServerStatusDto | undefined>();
    servers.forEach((server, index) => {
      map.set(server.id, statusQueries[index]?.data);
    });
    return map;
  }, [servers, statusQueries]);

  const mutationError = createServer.error ?? updateServer.error;
  const isSaving = createServer.isPending || updateServer.isPending;

  const openCreate = () => {
    setSelected(null);
    setDialogMode('create');
    setFormOpen(true);
    createServer.reset();
    updateServer.reset();
  };

  const handleSubmit = async (values: ReturnType<typeof toServerRequest>) => {
    try {
      if (dialogMode === 'edit' && selected) {
        await updateServer.mutateAsync({ id: selected.id, payload: values });
      } else {
        await createServer.mutateAsync(values);
      }
      setFormOpen(false);
      setSelected(null);
    } catch {
      // Shown from the mutation error.
    }
  };

  const addButton = canWrite ? (
    <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
      {ADD_SERVER_LABEL}
    </Button>
  ) : null;

  const dialog = (
    <ServerFormDialog
      open={formOpen}
      mode={dialogMode}
      server={selected}
      credentials={credentialsQuery.data ?? []}
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
  );

  if (serversQuery.isLoading) {
    return (
      <MonitoringPageContainer>
        <MonitoringSectionHeader title="مدیریت پایش" />
        <MonitoringToolbar title={SERVERS_LABEL} actions={addButton} />
        <DashboardLoading message={SERVERS_LOADING_MESSAGE} />
        {dialog}
      </MonitoringPageContainer>
    );
  }

  if (serversQuery.isError) {
    return (
      <MonitoringPageContainer>
        <MonitoringSectionHeader title="مدیریت پایش" />
        <MonitoringToolbar title={SERVERS_LABEL} actions={addButton} />
        <DashboardError
          error={serversQuery.error}
          title={SERVERS_LOAD_ERROR_TITLE}
          onRetry={() => {
            void serversQuery.refetch();
          }}
        />
        {dialog}
      </MonitoringPageContainer>
    );
  }

  return (
    <MonitoringPageContainer>
      <MonitoringSectionHeader title="مدیریت پایش" />
      <MonitoringToolbar title={SERVERS_LABEL} actions={addButton} />

      {deactivateServer.error || activateServer.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getErrorMessage(deactivateServer.error ?? activateServer.error)}
        </Alert>
      ) : null}

      {servers.length === 0 ? (
        <MonitoringEmptyState
          title={EMPTY_SERVERS_TITLE}
          description={EMPTY_SERVERS_DESCRIPTION}
          action={
            canWrite ? (
              <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ mt: 1 }}>
                {ADD_SERVER_LABEL}
              </Button>
            ) : null
          }
        />
      ) : (
        <MonitoringTableCard>
          <ServerTable
            servers={servers}
            credentialsById={credentialsById}
            statusById={statusById}
            canWrite={canWrite}
            togglingId={
              deactivateServer.isPending
                ? deactivateServer.variables
                : activateServer.isPending
                  ? activateServer.variables
                  : null
            }
            onView={(server) => navigate(buildMonitoringServerRoute(server.id))}
            onEdit={(server) => {
              setSelected(server);
              setDialogMode('edit');
              setFormOpen(true);
              createServer.reset();
              updateServer.reset();
            }}
            onDelete={(server) => {
              deleteServer.reset();
              setDeleting(server);
            }}
            onToggleActive={(server) => {
              activateServer.reset();
              deactivateServer.reset();
              if (server.isActive) {
                void deactivateServer.mutateAsync(server.id);
                return;
              }
              void activateServer.mutateAsync(server.id);
            }}
          />
        </MonitoringTableCard>
      )}

      {dialog}

      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        title="حذف سرور"
        message={
          deleting
            ? `سرور «${deleting.name}» حذف شود؟ اگر این سرور مقدار متریک جمع کرده باشد، حذف ممکن است رد شود.`
            : 'این سرور حذف شود؟'
        }
        isDeleting={deleteServer.isPending}
        error={deleteServer.error ? getErrorMessage(deleteServer.error) : null}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) {
            return;
          }

          void deleteServer.mutateAsync(deleting.id).then(
            () => {
              setDeleting(null);
            },
            () => {
              // Keep the row. The dialog shows the API message.
            },
          );
        }}
      />
    </MonitoringPageContainer>
  );
}
