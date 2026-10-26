import { Alert, Box } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import GridLayout, { noCompactor, useContainerWidth } from 'react-grid-layout';
import type { Layout, LayoutItem } from 'react-grid-layout';
import { EmptyState } from '@/components/common';
import type { DashboardSectionDto, WidgetDto } from '@/types/dashboard';
import {
  fromGridLayoutPosition,
  getWidgetGridConstraints,
  GRID_COLUMNS,
  ROW_HEIGHT_PX,
  toGridLayoutPosition,
} from '@/utils/widgetLayout';
import { getPrimaryCheckId, getWidgetLastUpdatedAt } from '@/utils/widgetDataSource';
import { getErrorMessage } from '@/api/apiUtils';
import { WidgetChrome, type WidgetChromeMode } from './WidgetChrome';
import { WidgetRenderer } from './WidgetRenderer';
import { useWidgetRefresh } from './useWidgetRefresh';
import { useRunCheck } from '@/features/check-management/hooks/useCheckManagement';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export interface WidgetGridProps {
  mode: WidgetChromeMode;
  widgets: WidgetDto[];
  selectedWidgetId?: number | null;
  sections?: DashboardSectionDto[];
  currentSectionId?: number | null;
  emptyDescription?: string;
  previewMode?: boolean;
  onWidgetsChange?: (widgets: WidgetDto[]) => void;
  onSelectWidget?: (widgetId: number) => void;
  onEditWidget?: (widgetId: number) => void;
  onDeleteWidget?: (widgetId: number) => void;
  onDuplicateWidget?: (widgetId: number) => void;
  onMoveWidgetToSection?: (widgetId: number, targetSectionId: number) => void;
  onWidgetExpand?: (widget: WidgetDto) => void;
  onConfigureServerMetric?: (metricDefinitionId: number) => void;
  onConfigureServerAlert?: (metricDefinitionId: number) => void;
  onOpenServerMetricDetails?: (metricDefinitionId: number) => void;
}

function constrainGridItem(
  item: { i: string; x: number; y: number; w: number; h: number },
  widgets: WidgetDto[],
  isEditable: boolean,
): LayoutItem & { minW: number; minH: number; maxW: number; static: boolean } {
  const widget = widgets.find((entry) => String(entry.id) === item.i);
  const constraints = getWidgetGridConstraints(widget?.widgetType);
  const minW = isEditable ? constraints.minWidth : 1;
  const minH = isEditable ? constraints.minHeight : 1;
  let width = Math.max(minW, item.w);
  let x = Math.max(0, item.x);
  if (x + width > GRID_COLUMNS) {
    x = Math.max(0, GRID_COLUMNS - width);
  }
  width = Math.min(GRID_COLUMNS - x, width);

  return {
    ...item,
    x,
    y: Math.max(0, item.y),
    w: width,
    h: Math.max(minH, item.h),
    minW,
    minH,
    maxW: GRID_COLUMNS,
    static: !isEditable,
  };
}

function toEditableLayout(
  widgets: WidgetDto[],
  isEditable: boolean,
  isRtl: boolean,
): Array<LayoutItem & { minW: number; minH: number; maxW: number; static: boolean }> {
  return widgets.map((widget) => {
    const position = toGridLayoutPosition(widget.id, widget.layout, isRtl);
    return constrainGridItem(position, widgets, isEditable);
  });
}

function sameGridLayout(
  left: Array<{ i: string; x: number; y: number; w: number; h: number; static?: boolean }>,
  right: Array<{ i: string; x: number; y: number; w: number; h: number; static?: boolean }>,
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((item, index) => {
    const other = right[index];
    return (
      item.i === other.i &&
      item.x === other.x &&
      item.y === other.y &&
      item.w === other.w &&
      item.h === other.h &&
      Boolean(item.static) === Boolean(other.static)
    );
  });
}

export function WidgetGrid({
  mode,
  widgets,
  selectedWidgetId = null,
  sections = [],
  currentSectionId = null,
  emptyDescription = 'ویجتی در این بخش تعریف نشده است.',
  previewMode = false,
  onWidgetsChange,
  onSelectWidget,
  onEditWidget,
  onDeleteWidget,
  onDuplicateWidget,
  onMoveWidgetToSection,
  onWidgetExpand,
  onConfigureServerMetric,
  onConfigureServerAlert,
  onOpenServerMetricDetails,
}: WidgetGridProps) {
  const refreshWidget = useWidgetRefresh();
  const runCheck = useRunCheck();
  const [refreshingIds, setRefreshingIds] = useState<Set<number>>(new Set());
  const [refreshMessage, setRefreshMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [runningCheckId, setRunningCheckId] = useState<number | null>(null);
  const [, forceUpdate] = useState(0);
  const interactingRef = useRef(false);
  const { width, containerRef, mounted, measureWidth } = useContainerWidth({
    measureBeforeMount: true,
    initialWidth: 0,
  });
  const isEditable = mode === 'edit' && !previewMode;
  const isRtl = false;

  const layoutFromProps = useMemo(
    () => toEditableLayout(widgets, isEditable, isRtl),
    [isEditable, widgets, isRtl],
  );
  const rowStride = ROW_HEIGHT_PX + 8;
  const columnWidth = width > 0 ? (width - 8 * (GRID_COLUMNS - 1)) / GRID_COLUMNS : 0;
  const [layout, setLayout] = useState(layoutFromProps);

  useEffect(() => {
    if (interactingRef.current) {
      return;
    }
    setLayout((prev) => (sameGridLayout(prev, layoutFromProps) ? prev : layoutFromProps));
  }, [layoutFromProps]);

  // An empty section mounts this grid before any widget exists. The width hook
  // only measures while its container is in the document, so keep the host
  // mounted and measure again when the first widget arrives.
  useEffect(() => {
    measureWidth();
  }, [measureWidth, widgets.length]);

  // Force re-render every second to update relative time labels
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const applyLayout = (nextLayout: Layout) => {
    if (!onWidgetsChange) {
      return;
    }

    const boundedLayout = nextLayout.map((item) => constrainGridItem(item, widgets, isEditable));

    const nextById = new Map(boundedLayout.map((item) => [item.i, item]));
    let changed = false;

    const nextWidgets = widgets.map((widget) => {
      const item = nextById.get(String(widget.id));
      if (!item) {
        return widget;
      }

      const next = fromGridLayoutPosition(item, isRtl);
      if (
        next.x === widget.layout?.x &&
        next.y === widget.layout?.y &&
        next.width === widget.layout?.width &&
        next.height === widget.layout?.height
      ) {
        return widget;
      }

      changed = true;
      return { ...widget, layout: next };
    });

    if (changed) {
      onWidgetsChange(nextWidgets);
    }
  };

  const beginInteraction = () => {
    interactingRef.current = true;
  };

  const endInteraction = (nextLayout: Layout) => {
    const boundedLayout = nextLayout.map((item) => constrainGridItem(item, widgets, isEditable));
    setLayout(boundedLayout);
    applyLayout(boundedLayout);
    interactingRef.current = false;
  };

  const handleRefresh = async (widget: WidgetDto) => {
    const checkId = getPrimaryCheckId(widget.dataSources ?? []);

    // Prevent duplicate execution for the same checkId
    if (checkId != null && runningCheckId === checkId) {
      return;
    }

    setRefreshingIds((prev) => new Set(prev).add(widget.id));
    setRefreshMessage(null);

    if (checkId != null && checkId > 0) {
      setRunningCheckId(checkId);
    }

    try {
      if (checkId != null && checkId > 0) {
        // Widget has a check - use manual execution
        await runCheck.mutateAsync(checkId);
        setRefreshMessage({ type: 'success', text: 'درخواست اجرای بررسی ثبت شد.' });

        // After successful request, refresh widget data to invalidate queries
        await refreshWidget(widget);
      } else {
        // Widget has no check - use existing refresh behavior
        await refreshWidget(widget);
      }
    } catch (error) {
      setRefreshMessage({ type: 'error', text: getErrorMessage(error) });
    } finally {
      setRefreshingIds((prev) => {
        const next = new Set(prev);
        next.delete(widget.id);
        return next;
      });
      setRunningCheckId(null);
    }
  };

  const showGrid = widgets.length > 0 && mounted && width > 0;

  return (
    <>
      {refreshMessage ? (
        <Alert
          severity={refreshMessage.type}
          sx={{ mb: 2 }}
          onClose={() => setRefreshMessage(null)}
        >
          {refreshMessage.text}
        </Alert>
      ) : null}
      <Box
        ref={containerRef}
        className={widgets.length > 0 ? 'widget-grid-host' : undefined}
        sx={
          widgets.length === 0
            ? {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              border: mode === 'edit' ? '1px dashed' : 'none',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: mode === 'edit' ? 'grey.50' : 'transparent',
              py: mode === 'edit' ? 2 : 0,
            }
            : {
              width: '100%',
              height: 'auto',
              overflow: 'visible',
              position: 'relative',
            }
        }
        data-testid="section-widget-grid"
        data-grid-mode={mode}
      >
        {widgets.length === 0 ? (
          <EmptyState title={mode === 'edit' ? 'بوم خالی است' : 'بدون ویجت'} description={emptyDescription} />
        ) : showGrid ? (
          <GridLayout
            className={mode === 'edit' ? 'layout designer-grid' : 'layout view-grid'}
            layout={layout}
            width={width}
            autoSize={true}
            compactor={noCompactor}
            style={{
              ['--grid-cell-w' as string]: `${columnWidth + 8}px`,
              ['--grid-cell-h' as string]: `${rowStride}px`,
            }}
            gridConfig={{
              cols: GRID_COLUMNS,
              rowHeight: ROW_HEIGHT_PX,
              margin: [8, 8],
              containerPadding: [0, 0],
            }}
            dragConfig={{
              enabled: isEditable,
              handle: '.widget-drag-handle',
              cancel: '.widget-no-drag',
              threshold: 0,
            }}
            resizeConfig={{
              enabled: isEditable,
              handles: ['se', 'e', 's', 'w', 'sw'],
            }}
            onDragStart={() => {
              beginInteraction();
            }}
            onDragStop={(nextLayout) => {
              endInteraction(nextLayout);
            }}
            onResizeStart={() => {
              beginInteraction();
            }}
            onResizeStop={(nextLayout) => {
              endInteraction(nextLayout);
            }}
          >
            {widgets.map((widget) => {
              const selected = selectedWidgetId === widget.id;
              const lastUpdatedAt = getWidgetLastUpdatedAt(widget.dataSources ?? []);

              // Native div: RGL injects absolute/transform styles; MUI Box/sx can wipe them mid-drag
              return (
                <div
                  key={String(widget.id)}
                  data-testid={
                    mode === 'edit' ? `designer-widget-${widget.id}` : `view-widget-${widget.id}`
                  }
                  data-grid-x={widget.layout?.x ?? 0}
                  data-grid-y={widget.layout?.y ?? 0}
                  data-grid-w={widget.layout?.width ?? 4}
                  data-grid-h={widget.layout?.height ?? 2}
                  style={{ height: '100%' }}
                >
                  <WidgetChrome
                    widget={widget}
                    mode={mode}
                    selected={selected}
                    previewMode={previewMode}
                    lastUpdatedAt={lastUpdatedAt}
                    isRefreshing={refreshingIds.has(widget.id)}
                    sections={sections}
                    currentSectionId={currentSectionId}
                    onSelect={onSelectWidget}
                    onRefresh={mode === 'view' ? handleRefresh : undefined}
                    onExpand={mode === 'view' ? onWidgetExpand : undefined}
                    onEdit={onEditWidget}
                    onDelete={onDeleteWidget}
                    onDuplicate={onDuplicateWidget}
                    onMoveWidgetToSection={onMoveWidgetToSection}
                    onConfigureServerMetric={onConfigureServerMetric}
                    onConfigureServerAlert={onConfigureServerAlert}
                    onOpenServerMetricDetails={onOpenServerMetricDetails}
                  >
                    <WidgetRenderer widget={widget} embedded />
                  </WidgetChrome>
                </div>
              );
            })}
          </GridLayout>
        ) : null}
      </Box>
    </>
  );
}
