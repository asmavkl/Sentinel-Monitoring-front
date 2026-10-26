import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useState } from 'react';
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
import { ApplicationFormDialog, type ApplicationFormValues } from '../components/ApplicationFormDialog';
import { ApplicationTable } from '../components/ApplicationTable';
import { ComponentFormDialog, type ComponentFormValues } from '../components/ComponentFormDialog';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import {
  useApplicationComponents,
  useCreateApplicationComponent,
  useCreateMonitoringApplication,
  useDeleteMonitoringApplication,
  useMonitoringApplications,
  useUpdateMonitoringApplication,
} from '../hooks';
import { buildComponentCode } from '../utils/formValidation';
import { buildMonitoringApplicationRoute } from '@/routes/paths';
import type { MonitoringApplicationListItem } from '@/types/monitoringManagement';

const EMPTY_APPLICATIONS_TITLE = 'هیچ سامانه‌ای برای پایش تعریف نشده است';

export function MonitoringApplicationsPage() {
  const navigate = useNavigate();
  const { data: role } = useUserRoleSimple();
  const canWrite = canWriteMonitoring(role);
  const applicationsQuery = useMonitoringApplications();
  const createApplication = useCreateMonitoringApplication();
  const updateApplication = useUpdateMonitoringApplication();
  const deleteApplication = useDeleteMonitoringApplication();
  const createComponent = useCreateApplicationComponent();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MonitoringApplicationListItem | null>(null);
  const [deleting, setDeleting] = useState<MonitoringApplicationListItem | null>(null);
  const [componentTarget, setComponentTarget] = useState<MonitoringApplicationListItem | null>(null);
  const componentsQuery = useApplicationComponents(componentTarget?.id ?? 0);

  const applications = applicationsQuery.data ?? [];
  const mutationError = createApplication.error ?? updateApplication.error;
  const isSaving = createApplication.isPending || updateApplication.isPending;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
    createApplication.reset();
    updateApplication.reset();
  };

  const openEdit = (application: MonitoringApplicationListItem) => {
    setEditing(application);
    setFormOpen(true);
    createApplication.reset();
    updateApplication.reset();
  };

  const handleSubmit = async (values: ApplicationFormValues) => {
    try {
      if (editing) {
        await updateApplication.mutateAsync({
          id: editing.id,
          payload: {
            name: values.name,
            description: values.description || null,
            baseUrl: values.baseUrl || null,
            isActive: values.isActive,
            priority: values.priority,
          },
        });
      } else {
        await createApplication.mutateAsync({
          name: values.name,
          code: values.code,
          description: values.description || null,
          baseUrl: values.baseUrl || null,
          isActive: values.isActive,
          priority: values.priority,
          dashboardTemplateId: values.dashboardTemplateId,
        });
      }
      setFormOpen(false);
      setEditing(null);
    } catch {
      // Error is shown in the dialog via mutation state.
    }
  };

  const openAddComponent = (application: MonitoringApplicationListItem) => {
    setComponentTarget(application);
    createComponent.reset();
  };

  const handleCreateComponent = async (values: ComponentFormValues) => {
    if (!componentTarget) {
      return;
    }

    let components = componentsQuery.data;
    if (!components) {
      const result = await componentsQuery.refetch();
      components = result.data ?? [];
    }

    try {
      await createComponent.mutateAsync({
        applicationId: componentTarget.id,
        name: values.name,
        code: buildComponentCode(
          values.name,
          components.map((item) => item.code),
        ),
        description: values.description || null,
        isActive: values.isActive,
      });
      setComponentTarget(null);
    } catch {
      // Error is shown in the dialog via mutation state.
    }
  };

  const addButton = canWrite ? (
    <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
      افزودن سامانه
    </Button>
  ) : null;

  if (applicationsQuery.isLoading) {
    return (
      <MonitoringPageContainer>
        <MonitoringSectionHeader title="مدیریت پایش" />
        <DashboardLoading message="در حال بارگذاری سامانه ها..." />
      </MonitoringPageContainer>
    );
  }

  if (applicationsQuery.isError) {
    return (
      <MonitoringPageContainer>
        <MonitoringSectionHeader title="مدیریت پایش" />
        <DashboardError
          error={applicationsQuery.error}
          title="امکان بارگذاری سامانه ها وجود ندارد"
          onRetry={() => {
            void applicationsQuery.refetch();
          }}
        />
      </MonitoringPageContainer>
    );
  }

  return (
    <MonitoringPageContainer>
      <MonitoringSectionHeader title="مدیریت پایش" />
      <MonitoringToolbar title="سامانه‌ها" actions={addButton} />

      {applications.length === 0 ? (
        <MonitoringEmptyState
          title={EMPTY_APPLICATIONS_TITLE}
          description="سامانه های تحت پایش را از این بخش تعریف کنید."
          action={
            canWrite ? (
              <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ mt: 1 }}>
                افزودن سامانه
              </Button>
            ) : null
          }
        />
      ) : (
        <MonitoringTableCard>
          <ApplicationTable
            applications={applications}
            canWrite={canWrite}
            onView={(application) => navigate(buildMonitoringApplicationRoute(application.id))}
            onAddComponent={openAddComponent}
            onEdit={openEdit}
            onDelete={(application) => {
              deleteApplication.reset();
              setDeleting(application);
            }}
          />
        </MonitoringTableCard>
      )}

      <ApplicationFormDialog
        open={formOpen}
        application={editing}
        existingCodes={applications.map((item) => item.code)}
        isSubmitting={isSaving}
        submitError={mutationError ? getErrorMessage(mutationError) : null}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={(values) => {
          void handleSubmit(values);
        }}
      />

      <ComponentFormDialog
        open={Boolean(componentTarget)}
        existingNames={(componentsQuery.data ?? []).map((item) => item.name)}
        isSubmitting={createComponent.isPending}
        submitError={createComponent.error ? getErrorMessage(createComponent.error) : null}
        onClose={() => setComponentTarget(null)}
        onSubmit={(values) => {
          void handleCreateComponent(values);
        }}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        title="حذف سامانه"
        message={
          deleting
            ? `سامانه «${deleting.name}» حذف شود؟ این عملیات قابل بازگشت نیست.`
            : 'این سامانه حذف شود؟'
        }
        isDeleting={deleteApplication.isPending}
        error={deleteApplication.error ? getErrorMessage(deleteApplication.error) : null}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) {
            return;
          }

          void deleteApplication.mutateAsync(deleting.id).then(() => {
            setDeleting(null);
          });
        }}
      />
    </MonitoringPageContainer>
  );
}
