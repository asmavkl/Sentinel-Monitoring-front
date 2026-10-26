import CloseIcon from '@mui/icons-material/Close';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Popover,
  Tooltip,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from '@/api/apiUtils';
import { BackButton } from '@/components/common';
import { buildDashboardRoute } from '@/routes/paths';
import { dashboardQueryKeys } from '@/features/dashboard/hooks/queryKeys';
import { invalidateDashboardOwner } from '@/features/dashboard/hooks/invalidateDashboardOwner';
import type { ServerMetricDefinitionDto } from '@/types/monitoredServers';
import type {
  ComponentStatusDto,
  DashboardLayoutDto,
  DashboardSectionDto,
  WidgetDto,
} from '@/types/dashboard';
import type { WidgetType } from '@/types/widgets';
import { useDashboardStore } from '@/store/dashboardStore';
import { layout as layoutTokens } from '@/theme/spacing';
import { parseWidgetLayout } from '@/utils/widgetLayout';
import { DashboardToolbar } from '../components/DashboardToolbar';
import { DeleteWidgetDialog } from '../components/DeleteWidgetDialog';
import { SectionCanvas } from '../components/SectionCanvas';
import {
  CreateSectionDialog,
  DeleteSectionDialog,
  SectionList,
  type SectionFormValues,
} from '../components/sections';
import { WidgetLibrary } from '../components/WidgetLibrary';
import { WidgetPropertiesPanel } from '../components/WidgetPropertiesPanel';
import {
  useCreateSection,
  useCreateWidget,
  useDeleteSection,
  useDeleteWidget,
  useUpdateSection,
  useUpdateWidget,
} from '../hooks';
import { useQuery } from '@tanstack/react-query';
import { checkManagementApi } from '@/api/checkManagementApi';

function useApplicationChecks(applicationId: number, enabled = true) {
  return useQuery({
    queryKey: dashboardQueryKeys.applicationChecks(applicationId),
    queryFn: () => checkManagementApi.getApplicationChecks(applicationId),
    enabled: enabled && applicationId > 0,
  });
}
import { getAvailableChecks } from '../utils/checkOptions';
import {
  createDraftWidget,
  duplicateWidget,
  ensureSectionForWidget,
  getNewDraftSections,
  getNewDraftWidgets,
  isDraftId,
  isPersistedSectionId,
  withDisplayOrderForNewSection,
} from '../utils/designerDraft';
import {
  cloneSections,
  getChangedSections,
  getChangedWidgetsAcrossSections,
  getNextSectionDisplayOrder,
  moveWidgetToSection,
  replaceSectionWidgets,
  toCreateSectionRequest,
  toUpdateSectionRequest,
  updateWidgetInSections,
} from '../utils/sectionDraft';
import {
  multiSeriesChartSourceError,
  toCreateRequest,
  toDataSourceRequests,
  toUpdateRequest,
} from '../utils/widgetDraft';

interface DashboardDesignerPageProps {
  applicationId: number;
  layout: DashboardLayoutDto;
  components: ComponentStatusDto[];
  applicationName?: string;
  onExit?: () => void;
  serverId?: number;
  serverMetrics?: ServerMetricDefinitionDto[];
  serverName?: string;
  isServerMode?: boolean;
  exitPath?: string;
}

export function DashboardDesignerPage({
  applicationId,
  layout,
  components,
  applicationName,
  onExit,
  serverId,
  serverMetrics,
  serverName,
  isServerMode,
  exitPath,
}: DashboardDesignerPageProps) {
  const serverMode = isServerMode ?? (serverId != null);
  const ownerId = serverId ?? applicationId;
  const ownerScope = serverMode ? 'server' : 'application';
  const selectedWidgetId = useDashboardStore((state) => state.selectedWidgetId);
  const setSelectedWidgetId = useDashboardStore((state) => state.setSelectedWidgetId);
  const selectedSectionId = useDashboardStore((state) => state.selectedSectionId);
  const setSelectedSectionId = useDashboardStore((state) => state.setSelectedSectionId);
  const setPropertiesTab = useDashboardStore((state) => state.setPropertiesTab);
  const exitEditMode = useDashboardStore((state) => state.exitEditMode);
  const queryClient = useQueryClient();

  const [baselineSections, setBaselineSections] = useState<DashboardSectionDto[]>(() =>
    cloneSections(layout.sections ?? []),
  );
  const [draftSections, setDraftSections] = useState<DashboardSectionDto[]>(() =>
    cloneSections(layout.sections ?? []),
  );
  const [past, setPast] = useState<DashboardSectionDto[][]>([]);
  const [future, setFuture] = useState<DashboardSectionDto[][]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [createSectionOpen, setCreateSectionOpen] = useState(false);
  const [deleteSectionId, setDeleteSectionId] = useState<number | null>(null);
  const [deleteWidgetId, setDeleteWidgetId] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [libraryAnchor, setLibraryAnchor] = useState<HTMLElement | null>(null);
  const [sectionsAnchor, setSectionsAnchor] = useState<HTMLElement | null>(null);

  const dashboardId = layout.dashboardId;
  const createSection = useCreateSection(ownerId, dashboardId, ownerScope);
  const updateSection = useUpdateSection(ownerId, dashboardId, ownerScope);
  const deleteSection = useDeleteSection(ownerId, dashboardId, ownerScope);
  const createWidget = useCreateWidget(ownerId, ownerScope);
  const updateWidget = useUpdateWidget(ownerId, ownerScope);
  const deleteWidget = useDeleteWidget(ownerId, ownerScope);

  const { data: applicationChecks } = useApplicationChecks(applicationId, !serverMode);

  const availableChecks = useMemo(() => {
    if (applicationChecks && applicationChecks.length > 0) {
      // Map check data to CheckOption format using component data
      const componentMap = new Map(components.map(c => [c.componentId, c.name]));
      return applicationChecks.map((check) => ({
        checkId: check.id,
        name: check.name,
        componentName: componentMap.get(check.applicationComponentId) ?? '—',
        componentId: check.applicationComponentId,
        applicationId: applicationId,
        checkType: check.checkType,
      }));
    }
    return getAvailableChecks(components);
  }, [applicationChecks, components, applicationId]);
  const changedSections = useMemo(
    () => getChangedSections(baselineSections, draftSections),
    [baselineSections, draftSections],
  );
  const changedWidgets = useMemo(
    () => getChangedWidgetsAcrossSections(baselineSections, draftSections),
    [baselineSections, draftSections],
  );
  const newDraftWidgets = useMemo(
    () => getNewDraftWidgets(baselineSections, draftSections),
    [baselineSections, draftSections],
  );
  const newDraftSections = useMemo(
    () => getNewDraftSections(baselineSections, draftSections),
    [baselineSections, draftSections],
  );

  const selectedSection =
    draftSections.find((section) => section.id === selectedSectionId) ?? null;
  const selectedWidget =
    draftSections
      .flatMap((section) => section.widgets)
      .find((widget) => widget.id === selectedWidgetId) ?? null;
  const deleteSectionTarget =
    draftSections.find((section) => section.id === deleteSectionId) ?? null;
  const deleteWidgetTarget =
    draftSections
      .flatMap((section) => section.widgets)
      .find((widget) => widget.id === deleteWidgetId) ?? null;

  const isSaving =
    createSection.isPending ||
    updateSection.isPending ||
    deleteSection.isPending ||
    createWidget.isPending ||
    updateWidget.isPending ||
    deleteWidget.isPending;
  const isDirty =
    changedSections.length > 0 ||
    changedWidgets.length > 0 ||
    newDraftWidgets.length > 0 ||
    newDraftSections.length > 0;
  const dashboardTitle = applicationName ?? layout.title ?? layout.name ?? 'داشبورد';

  const invalidateDashboard = () => {
    invalidateDashboardOwner(queryClient, ownerId, ownerScope);
    void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.sections(dashboardId) });
  };

  const commitSections = useCallback(
    (updater: (current: DashboardSectionDto[]) => DashboardSectionDto[]) => {
      setDraftSections((current) => {
        const next = updater(current);
        setPast((history) => [...history, cloneSections(current)]);
        setFuture([]);
        return next;
      });
    },
    [],
  );

  const handleUndo = () => {
    setPast((history) => {
      if (history.length === 0) {
        return history;
      }

      const previous = history[history.length - 1];
      setFuture((nextFuture) => [cloneSections(draftSections), ...nextFuture]);
      setDraftSections(cloneSections(previous));
      return history.slice(0, -1);
    });
  };

  const handleRedo = () => {
    setFuture((history) => {
      if (history.length === 0) {
        return history;
      }

      const [next, ...rest] = history;
      setPast((prev) => [...prev, cloneSections(draftSections)]);
      setDraftSections(cloneSections(next));
      return rest;
    });
  };

  const handleCancel = () => {
    setDraftSections(cloneSections(baselineSections));
    setPast([]);
    setFuture([]);
    setPreviewMode(false);
    setSaveError(null);
    setSelectedWidgetId(null);
    invalidateDashboard();
    exitEditMode();
    onExit?.();
  };

  const handleSave = async () => {
    setSaveError(null);

    const invalidWidget = [...newDraftWidgets, ...changedWidgets].find(
      (widget) => multiSeriesChartSourceError(widget) != null,
    );
    if (invalidWidget) {
      setSaveError(multiSeriesChartSourceError(invalidWidget));
      setSelectedWidgetId(invalidWidget.id);
      setPropertiesTab(1);
      setPropertiesOpen(true);
      return;
    }

    try {
      let workingSections = cloneSections(draftSections);
      const sectionIdMap = new Map<number, number>();

      for (const section of getNewDraftSections(baselineSections, workingSections)) {
        const created = await createSection.mutateAsync(
          toCreateSectionRequest({
            title: section.title,
            description: section.description,
            color: section.color,
            displayOrder: section.displayOrder,
            isVisible: section.isVisible,
          }),
        );

        sectionIdMap.set(section.id, created.id);
        workingSections = workingSections.map((item) =>
          item.id === section.id
            ? {
              ...item,
              id: created.id,
              widgets: item.widgets.map((widget) => ({
                ...widget,
                sectionId: created.id,
              })),
            }
            : item,
        );
      }

      for (const section of getChangedSections(baselineSections, workingSections)) {
        if (!isPersistedSectionId(section.id)) {
          continue;
        }

        await updateSection.mutateAsync({
          sectionId: section.id,
          payload: toUpdateSectionRequest(section),
        });
      }

      const widgetsToCreate = getNewDraftWidgets(baselineSections, workingSections);
      const widgetIdMap = new Map<number, number>();

      for (const widget of widgetsToCreate) {
        const sectionId =
          widget.sectionId === null || widget.sectionId === undefined
            ? null
            : sectionIdMap.get(widget.sectionId) ?? widget.sectionId;
        const created = await createWidget.mutateAsync(
          toCreateRequest({
            title: widget.title,
            description: widget.description || undefined,
            widgetType: widget.widgetType,
            dashboardSectionId: sectionId != null && sectionId > 0 ? sectionId : undefined,
            configuration: widget.configuration,
            dataSources: toDataSourceRequests(widget.dataSources, { server: serverMode }),
            server: serverMode,
            layout: parseWidgetLayout(widget.layout),
            displayOrder: widget.displayOrder,
          }),
        );

        widgetIdMap.set(widget.id, created.id);
        workingSections = updateWidgetInSections(workingSections, widget.id, {
          id: created.id,
          sectionId: created.sectionId ?? sectionId,
          layout: parseWidgetLayout(created.layout ?? widget.layout),
          configuration: created.configuration ?? widget.configuration,
          dataSources: created.dataSources ?? widget.dataSources,
        });
      }

      for (const widget of getChangedWidgetsAcrossSections(baselineSections, workingSections)) {
        if (isDraftId(widget.id)) {
          continue;
        }

        const originalWidget = baselineSections
          .flatMap((s) => s.widgets)
          .find((w) => w.id === widget.id);

        await updateWidget.mutateAsync({
          widgetId: widget.id,
          payload: toUpdateRequest(widget, originalWidget, { server: serverMode }),
        });
      }

      setDraftSections(workingSections);
      setBaselineSections(cloneSections(workingSections));
      setPast([]);
      setFuture([]);

      if (selectedWidgetId != null && widgetIdMap.has(selectedWidgetId)) {
        setSelectedWidgetId(widgetIdMap.get(selectedWidgetId) ?? null);
      }
      if (selectedSectionId != null && sectionIdMap.has(selectedSectionId)) {
        setSelectedSectionId(sectionIdMap.get(selectedSectionId) ?? null);
      }

      invalidateDashboard();
    } catch (error) {
      setSaveError(getErrorMessage(error));
    }
  };

  const handleCreateSection = (values: SectionFormValues) => {
    setSaveError(null);

    commitSections((current) => {
      const localSection = withDisplayOrderForNewSection(current, {
        id: -Date.now(),
        title: values.title,
        description: values.description ?? null,
        color: values.color,
        displayOrder: values.displayOrder ?? getNextSectionDisplayOrder(current),
        isVisible: values.isVisible,
        widgets: [],
      });

      setSelectedSectionId(localSection.id);
      setSelectedWidgetId(null);
      return [...current, localSection];
    });
    setCreateSectionOpen(false);
  };

  const handleDeleteSection = async () => {
    if (deleteSectionId == null) {
      return;
    }

    setSaveError(null);

    try {
      if (isPersistedSectionId(deleteSectionId)) {
        await deleteSection.mutateAsync(deleteSectionId);
        setBaselineSections((current) =>
          current.filter((section) => section.id !== deleteSectionId),
        );
      }

      commitSections((current) => current.filter((section) => section.id !== deleteSectionId));

      if (selectedSectionId === deleteSectionId) {
        setSelectedSectionId(null);
      }
      setSelectedWidgetId(null);
      setDeleteSectionId(null);
    } catch (error) {
      setSaveError(getErrorMessage(error));
    }
  };

  const addWidgetDraft = (widgetType: WidgetType) => {
    setSaveError(null);
    setPreviewMode(false);

    const ensured = ensureSectionForWidget(draftSections, selectedSectionId);
    const sectionId = ensured.sectionId;
    const sectionWidgets =
      ensured.sections.find((section) => section.id === sectionId)?.widgets ?? [];
    const draftWidget = createDraftWidget({
      widgetType,
      sectionId,
      existingWidgets: sectionWidgets,
    });

    setPast((history) => [...history, cloneSections(draftSections)]);
    setFuture([]);
    setDraftSections(
      replaceSectionWidgets(ensured.sections, sectionId, [...sectionWidgets, draftWidget]),
    );
    setSelectedSectionId(sectionId);
    setSelectedWidgetId(draftWidget.id);
    setPropertiesTab(0);
    setPropertiesOpen(true);
    setLibraryAnchor(null);
  };

  const handleDeleteWidget = async () => {
    if (deleteWidgetId == null) {
      return;
    }

    setSaveError(null);

    try {
      if (!isDraftId(deleteWidgetId)) {
        await deleteWidget.mutateAsync(deleteWidgetId);
        setBaselineSections((current) =>
          current.map((section) => ({
            ...section,
            widgets: section.widgets.filter((widget) => widget.id !== deleteWidgetId),
          })),
        );
      }

      commitSections((current) =>
        current.map((section) => ({
          ...section,
          widgets: section.widgets.filter((widget) => widget.id !== deleteWidgetId),
        })),
      );

      if (selectedWidgetId === deleteWidgetId) {
        setSelectedWidgetId(null);
      }
      setDeleteWidgetId(null);
    } catch (error) {
      setSaveError(getErrorMessage(error));
    }
  };

  const requestDeleteWidget = useCallback(
    (widgetId: number) => {
      if (isDraftId(widgetId)) {
        commitSections((current) =>
          current.map((section) => ({
            ...section,
            widgets: section.widgets.filter((widget) => widget.id !== widgetId),
          })),
        );
        if (selectedWidgetId === widgetId) {
          setSelectedWidgetId(null);
        }
        return;
      }

      setDeleteWidgetId(widgetId);
    },
    [commitSections, selectedWidgetId, setSelectedWidgetId],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' || event.repeat || previewMode || isSaving) {
        return;
      }
      if (selectedWidgetId == null || deleteWidgetId != null || deleteSectionId != null) {
        return;
      }

      const target = event.target;
      if (target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable="true"]')) {
        return;
      }

      event.preventDefault();
      requestDeleteWidget(selectedWidgetId);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    deleteSectionId,
    deleteWidgetId,
    isSaving,
    previewMode,
    requestDeleteWidget,
    selectedWidgetId,
  ]);

  const handleDuplicateWidget = (widgetId: number, sectionId: number) => {
    commitSections((current) => {
      const section = current.find((item) => item.id === sectionId);
      const source = section?.widgets.find((widget) => widget.id === widgetId);
      if (!section || !source) {
        return current;
      }

      const copy = duplicateWidget(source, section.widgets);
      setSelectedWidgetId(copy.id);
      setSelectedSectionId(sectionId);
      setPropertiesTab(0);
      setPropertiesOpen(true);
      return replaceSectionWidgets(current, sectionId, [...section.widgets, copy]);
    });
  };

  const updateSelectedSection = (patch: Partial<DashboardSectionDto>) => {
    if (!selectedSection) {
      return;
    }

    commitSections((current) =>
      current.map((section) =>
        section.id === selectedSection.id ? { ...section, ...patch } : section,
      ),
    );
  };

  const updateSelectedWidget = (patch: Partial<WidgetDto>) => {
    if (!selectedWidget) {
      return;
    }

    commitSections((current) => updateWidgetInSections(current, selectedWidget.id, patch));
  };

  const moveSectionOrder = (sectionId: number, direction: 'up' | 'down') => {
    commitSections((current) => {
      const sorted = [...current].sort((left, right) => left.displayOrder - right.displayOrder);
      const index = sorted.findIndex((section) => section.id === sectionId);
      if (index < 0) {
        return current;
      }

      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= sorted.length) {
        return current;
      }

      const currentOrder = sorted[index].displayOrder;
      const swapOrder = sorted[swapIndex].displayOrder;

      return current.map((section) => {
        if (section.id === sorted[index].id) {
          return { ...section, displayOrder: swapOrder };
        }
        if (section.id === sorted[swapIndex].id) {
          return { ...section, displayOrder: currentOrder };
        }
        return section;
      });
    });
  };

  const headerButtonSx = {
    color: 'inherit',
    borderColor: 'currentColor',
    '&:hover': { borderColor: 'currentColor', bgcolor: 'rgba(255,255,255,0.08)' },
  } as const;

  const openWidgetProperties = (widgetId: number, sectionId: number) => {
    setSelectedWidgetId(widgetId);
    setSelectedSectionId(sectionId);
    setPropertiesTab(0);
    setPropertiesOpen(true);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: `calc(100vh - ${layoutTokens.headerHeight}px)`,
        mx: -1.5,
        mt: -1.5,
        mb: -1.5,
        bgcolor: 'background.default',
        minWidth: 0,
      }}
    >
      <Box sx={{ px: 1.5, pt: 1.5, pb: 1, flexShrink: 0 }}>
        <BackButton fallbackTo={exitPath ?? buildDashboardRoute(applicationId)} sx={{ mb: 0.75 }} />
        <DashboardToolbar
          dashboardName={dashboardTitle}
          subtitle="طراحی داشبورد"
          isEditMode
          canEdit
          isSaving={isSaving}
          isDirty={isDirty}
          canUndo={past.length > 0}
          canRedo={future.length > 0}
          previewMode={previewMode}
          onSave={() => void handleSave()}
          onCancel={handleCancel}
          onAddSection={() => setCreateSectionOpen(true)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onTogglePreview={() => setPreviewMode((value) => !value)}
          leadingActions={
            <>
              <Button
                variant="outlined"
                size="small"
                disabled={isSaving || previewMode}
                onClick={(event) => setLibraryAnchor(event.currentTarget)}
                aria-label="کتابخانه ویجت"
                sx={headerButtonSx}
              >
                کتابخانه ویجت
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={isSaving || previewMode}
                onClick={(event) => setSectionsAnchor(event.currentTarget)}
                aria-label="بخش‌ها"
                sx={headerButtonSx}
              >
                بخش‌ها
              </Button>
            </>
          }
          cornerAction={
            <Tooltip title="ویژگی‌ها">
              <span>
                <IconButton
                  size="small"
                  disabled={isSaving || previewMode}
                  onClick={() => setPropertiesOpen(true)}
                  aria-label="ویژگی‌ها"
                  sx={{ color: 'inherit' }}
                >
                  <SettingsOutlinedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          }
        />

        {saveError ? <Alert severity="error" sx={{ mt: 1 }}>{saveError}</Alert> : null}
      </Box>

      <Box
        sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 1.5, pb: 1.5 }}
        onClick={(event) => {
          // Close popovers when clicking on empty space
          if (event.target === event.currentTarget) {
            setLibraryAnchor(null);
            setSectionsAnchor(null);
          }
        }}
      >
        <SectionCanvas
          sections={draftSections}
          selectedSectionId={selectedSectionId}
          selectedWidgetId={selectedWidgetId}
          disabled={isSaving}
          previewMode={previewMode}
          onSelectSection={(sectionId) => {
            setSelectedSectionId(sectionId);
            setSelectedWidgetId(null);
          }}
          onEditSection={(sectionId) => {
            setSelectedSectionId(sectionId);
            setSelectedWidgetId(null);
            setPropertiesOpen(true);
          }}
          onDeleteSection={setDeleteSectionId}
          onToggleSectionVisibility={(sectionId) => {
            commitSections((current) =>
              current.map((section) =>
                section.id === sectionId
                  ? { ...section, isVisible: !section.isVisible }
                  : section,
              ),
            );
          }}
          onMoveSection={moveSectionOrder}
          onSectionWidgetsChange={(sectionId, widgets) => {
            commitSections((current) => replaceSectionWidgets(current, sectionId, widgets));
          }}
          onSelectWidget={(widgetId, sectionId) => {
            setSelectedWidgetId(widgetId);
            setSelectedSectionId(sectionId);
            setPropertiesTab(0);
          }}
          onEditWidget={openWidgetProperties}
          onDeleteWidget={requestDeleteWidget}
          onDuplicateWidget={handleDuplicateWidget}
          onMoveWidgetToSection={(widgetId, targetSectionId) => {
            commitSections((current) =>
              moveWidgetToSection(current, widgetId, targetSectionId),
            );
            setSelectedSectionId(targetSectionId);
            setSelectedWidgetId(widgetId);
          }}
        />
      </Box>

      <Popover
        open={Boolean(libraryAnchor)}
        anchorEl={libraryAnchor}
        onClose={() => setLibraryAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        transitionDuration={0}
        hideBackdrop
        disableScrollLock
        disableAutoFocus
        disableEnforceFocus
      >
        <ClickAwayListener onClickAway={() => setLibraryAnchor(null)}>
          <Box sx={{ width: 300, maxHeight: 480, overflow: 'auto' }}>
            <WidgetLibrary
              disabled={isSaving || previewMode}
              excludedTypes={serverMode ? ['Table'] : []}
              onSelect={addWidgetDraft}
            />
          </Box>
        </ClickAwayListener>
      </Popover>

      <Popover
        open={Boolean(sectionsAnchor)}
        anchorEl={sectionsAnchor}
        onClose={() => setSectionsAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        transitionDuration={0}
        hideBackdrop
        disableScrollLock
        disableAutoFocus
        disableEnforceFocus
      >
        <ClickAwayListener onClickAway={() => setSectionsAnchor(null)}>
          <Box sx={{ width: 320, p: 1.5 }}>
            <SectionList
              sections={draftSections}
              selectedSectionId={selectedSectionId}
              disabled={isSaving || previewMode}
              onSelect={(sectionId) => {
                setSelectedSectionId(sectionId);
                setSelectedWidgetId(null);
              }}
              onAddSection={() => {
                setSectionsAnchor(null);
                setCreateSectionOpen(true);
              }}
            />
          </Box>
        </ClickAwayListener>
      </Popover>

      <Dialog
        open={propertiesOpen}
        onClose={() => setPropertiesOpen(false)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="widget-properties-dialog-title"
        transitionDuration={0}
      >
        <DialogTitle
          id="widget-properties-dialog-title"
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}
        >
          ویژگی‌ها
          <IconButton aria-label="بستن ویژگی‌ها" onClick={() => setPropertiesOpen(false)} edge="end">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <WidgetPropertiesPanel
            widget={previewMode ? null : selectedWidget}
            section={previewMode || selectedWidget ? null : selectedSection}
            sections={draftSections}
            applicationName={applicationName ?? layout.name}
            serverName={serverName}
            availableChecks={availableChecks}
            components={components}
            serverMetrics={serverMode ? (serverMetrics ?? []) : undefined}
            isServerMode={serverMode}
            onWidgetChange={updateSelectedWidget}
            onSectionChange={updateSelectedSection}
          />
        </DialogContent>
      </Dialog>

      <CreateSectionDialog
        open={createSectionOpen}
        defaultDisplayOrder={getNextSectionDisplayOrder(draftSections)}
        isSubmitting={false}
        onClose={() => setCreateSectionOpen(false)}
        onSubmit={handleCreateSection}
      />

      <DeleteSectionDialog
        open={deleteSectionId != null}
        sectionTitle={deleteSectionTarget?.title}
        isDeleting={deleteSection.isPending}
        onCancel={() => setDeleteSectionId(null)}
        onConfirm={() => void handleDeleteSection()}
      />

      <DeleteWidgetDialog
        open={deleteWidgetId != null}
        widgetTitle={deleteWidgetTarget?.title}
        isDeleting={deleteWidget.isPending}
        onCancel={() => setDeleteWidgetId(null)}
        onConfirm={() => void handleDeleteWidget()}
      />
    </Box>
  );
}
