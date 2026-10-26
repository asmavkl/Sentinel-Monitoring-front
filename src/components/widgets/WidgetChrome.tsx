import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import {
  alpha,
  Box,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DashboardSectionDto, WidgetDto } from '@/types/dashboard';
import { formatRelativeTime } from '@/utils/formatRelativeTime';
import { isDraftId } from '@/features/dashboard-designer/utils/designerDraft';
import { buildCheckRoute } from '@/routes/paths';
import { getPrimaryCheckId, getPrimaryDataSource, getServerMetricSources, isServerDataSource } from '@/utils/widgetDataSource';
import { WidgetDetailDialog } from './WidgetDetailDialog';
import { useUserRoleSimple } from '@/features/auth/hooks/useUserRoleSimple';
import { canWriteMonitoring } from '@/auth';
import { ApplicationHealthStatus } from '@/types/enums';
import { getHealthStatusColor } from '@/utils/healthStatus';

export type WidgetChromeMode = 'view' | 'edit';

interface WidgetChromeProps {
  widget: WidgetDto;
  mode: WidgetChromeMode;
  selected?: boolean;
  previewMode?: boolean;
  lastUpdatedAt?: string | number | Date | null;
  isRefreshing?: boolean;
  sections?: DashboardSectionDto[];
  currentSectionId?: number | null;
  children: ReactNode;
  onSelect?: (widgetId: number) => void;
  onRefresh?: (widget: WidgetDto) => void | Promise<void>;
  onExpand?: (widget: WidgetDto) => void;
  onEdit?: (widgetId: number) => void;
  onDelete?: (widgetId: number) => void;
  onDuplicate?: (widgetId: number) => void;
  onMoveWidgetToSection?: (widgetId: number, targetSectionId: number) => void;
  onConfigureServerMetric?: (metricDefinitionId: number) => void;
  onConfigureServerAlert?: (metricDefinitionId: number) => void;
  onOpenServerMetricDetails?: (metricDefinitionId: number) => void;
}

export function WidgetChrome({
  widget,
  mode,
  selected = false,
  previewMode = false,
  lastUpdatedAt,
  isRefreshing = false,
  sections = [],
  currentSectionId = null,
  children,
  onSelect,
  onRefresh,
  onExpand,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveWidgetToSection,
  onConfigureServerMetric,
  onConfigureServerAlert,
  onOpenServerMetricDetails,
}: WidgetChromeProps) {
  const navigate = useNavigate();
  const { data: role } = useUserRoleSimple();
  const canWrite = canWriteMonitoring(role);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [moveMenuAnchor, setMoveMenuAnchor] = useState<HTMLElement | null>(null);
  const [criteriaMenuAnchor, setCriteriaMenuAnchor] = useState<HTMLElement | null>(null);
  const [alertMenuAnchor, setAlertMenuAnchor] = useState<HTMLElement | null>(null);
  const [detailMenuAnchor, setDetailMenuAnchor] = useState<HTMLElement | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const isEdit = mode === 'edit' && !previewMode;
  const otherSections = sections.filter((section) => section.id !== currentSectionId);
  const relativeLabel = formatRelativeTime(lastUpdatedAt);

  // Get health status for header color
  const primarySource = getPrimaryDataSource(widget.dataSources ?? []);
  const serverSource = isServerDataSource(primarySource) ? primarySource : null;
  const healthStatus = serverSource
    ? (serverSource.healthStatus ?? ApplicationHealthStatus.Unknown)
    : (primarySource?.status?.healthStatus ?? ApplicationHealthStatus.Unknown);
  const statusColor = getHealthStatusColor(healthStatus);

  // Enable detail dialog for StatusCard, NumberCard, and DatasetChartWidget
  const canShowDetailDialog =
    mode === 'view' && (widget.widgetType === 'StatusCard' || widget.widgetType === 'NumberCard' || widget.widgetType === 'Chart');
  const criteriaCheckId = getPrimaryCheckId(widget.dataSources ?? []);
  const serverMetrics = getServerMetricSources(widget.dataSources ?? []);

  const closeMenu = () => {
    setMenuAnchor(null);
    setMoveMenuAnchor(null);
  };

  return (
    <Paper
      elevation={0}
      variant="outlined"
      data-testid={`widget-chrome-${widget.id}`}
      data-chrome-mode={mode}
      data-selected={selected}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 2,
        borderColor: 'transparent',
        borderWidth: selected ? 2 : 1,
        boxShadow: selected ? 4 : 3,
        bgcolor: 'background.paper',
        transition: 'all 0.2s ease',
        '&:hover': isEdit ? {
          borderColor: 'primary.light',
          boxShadow: 2,
        } : undefined,
      }}
      onClick={(event) => {
        if (!isEdit) {
          return;
        }
        event.stopPropagation();
        onSelect?.(widget.id);
      }}
      onDoubleClick={(event) => {
        if (!isEdit) {
          return;
        }
        event.stopPropagation();
        event.preventDefault();
        onEdit?.(widget.id);
      }}
    >
      <Box
        className={isEdit ? 'widget-drag-handle' : undefined}
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          gap: 0.75,
          px: 1,
          py: 0.75,
          minHeight: 44,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: (theme) =>
            selected && isEdit
              ? theme.palette.primary.main
              : alpha(statusColor, 0.08),
          color: selected && isEdit ? 'primary.contrastText' : 'text.primary',
          cursor: isEdit ? 'grab' : 'default',
          '&:active': isEdit ? { cursor: 'grabbing' } : undefined,
          direction: isEdit ? 'rtl' : 'ltr',
          '&.widget-drag-handle': {
            direction: 'ltr',
          },
        }}
      >
        {isEdit ? <DragIndicatorIcon fontSize="small" sx={{ opacity: 0.7 }} /> : null}

        <Stack spacing={0} sx={{ flex: 1, minWidth: 0, textAlign: isEdit ? 'right' : 'left' }}>
          <Typography variant="caption" noWrap sx={{ fontWeight: 700, fontSize: '0.8125rem', lineHeight: 1.3 }}>
            {widget.title}
            {isDraftId(widget.id) ? ' • پیش‌نویس' : ''}
          </Typography>
          <Typography
            variant="caption"
            noWrap
            sx={{
              opacity: 0.75,
              color: selected && isEdit ? 'inherit' : 'text.secondary',
              fontSize: '0.7rem',
              lineHeight: 1.2,
            }}
          >
            {relativeLabel}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.25} className="widget-no-drag" sx={{ flexShrink: 0 }}>
          {isEdit ? (
            <>
              <Tooltip title="عملیات ویجت">
                <IconButton
                  size="small"
                  aria-label={`عملیات ویجت ${widget.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setMenuAnchor(event.currentTarget);
                  }}
                  onDoubleClick={(event) => event.stopPropagation()}
                  sx={{ color: 'inherit' }}
                >
                  <MoreVertIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
              <Tooltip title="ویژگی‌ها">
                <IconButton
                  size="small"
                  aria-label={`ویژگی‌های ${widget.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelect?.(widget.id);
                    onEdit?.(widget.id);
                  }}
                  onDoubleClick={(event) => event.stopPropagation()}
                  sx={{ color: 'inherit' }}
                >
                  <SettingsOutlinedIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </>
          ) : null}
          {mode === 'view' ? (
            <>
              <Tooltip title="بررسی مجدد ویجت">
                <span>
                  <IconButton
                    size="small"
                    aria-label={`بررسی مجدد ویجت ${widget.title}`}
                    disabled={isRefreshing || !onRefresh}
                    onClick={(event) => {
                      event.stopPropagation();
                      void onRefresh?.(widget);
                    }}
                  >
                    {isRefreshing ? <CircularProgress size={16} /> : <RefreshIcon fontSize="inherit" />}
                  </IconButton>
                </span>
              </Tooltip>
              {criteriaCheckId && canWrite ? (
                <Tooltip title="اعلان ایمیل">
                  <IconButton
                    size="small"
                    aria-label={`اعلان ایمیل ${widget.title}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`${buildCheckRoute(criteriaCheckId)}#alert-policy`);
                    }}
                  >
                    <MailOutlinedIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              ) : null}
              {criteriaCheckId && canWrite ? (
                <Tooltip title="تنظیم معیار سلامت">
                  <IconButton
                    size="small"
                    aria-label={`تنظیم معیار سلامت ${widget.title}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(buildCheckRoute(criteriaCheckId));
                    }}
                  >
                    <RuleOutlinedIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              ) : null}
              {serverMetrics.length > 0 && onConfigureServerAlert && canWrite ? (
                <Tooltip title="اعلان ایمیل">
                  <IconButton
                    size="small"
                    aria-label={`اعلان ایمیل ${widget.title}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (serverMetrics.length === 1) {
                        onConfigureServerAlert(serverMetrics[0].id);
                        return;
                      }
                      setAlertMenuAnchor(event.currentTarget);
                    }}
                  >
                    <MailOutlinedIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              ) : null}
              {serverMetrics.length > 0 && onConfigureServerMetric && canWrite ? (
                <Tooltip title="تنظیم معیار سلامت">
                  <IconButton
                    size="small"
                    aria-label={`تنظیم معیار سلامت ${widget.title}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (serverMetrics.length === 1) {
                        onConfigureServerMetric(serverMetrics[0].id);
                        return;
                      }
                      setCriteriaMenuAnchor(event.currentTarget);
                    }}
                  >
                    <RuleOutlinedIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              ) : null}
              {serverMetrics.length > 0 && onOpenServerMetricDetails ? (
                <Tooltip title="جزئیات ویجت">
                  <IconButton
                    size="small"
                    aria-label={`باز کردن جزئیات ${widget.title}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (serverMetrics.length === 1) {
                        onOpenServerMetricDetails(serverMetrics[0].id);
                        return;
                      }
                      setDetailMenuAnchor(event.currentTarget);
                    }}
                  >
                    <OpenInNewIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              ) : canShowDetailDialog ? (
                <Tooltip title="جزئیات ویجت">
                  <span>
                    <IconButton
                      size="small"
                      aria-label={`باز کردن جزئیات ${widget.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setDetailDialogOpen(true);
                      }}
                    >
                      <OpenInNewIcon fontSize="inherit" />
                    </IconButton>
                  </span>
                </Tooltip>
              ) : onExpand ? (
                <Tooltip title="جزئیات شاخص">
                  <span>
                    <IconButton
                      size="small"
                      aria-label={`باز کردن جزئیات ${widget.title}`}
                      disabled={!onExpand}
                      onClick={(event) => {
                        event.stopPropagation();
                        onExpand?.(widget);
                      }}
                    >
                      <OpenInNewIcon fontSize="inherit" />
                    </IconButton>
                  </span>
                </Tooltip>
              ) : null}
            </>
          ) : null}
        </Stack>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', direction: 'rtl' }}>{children}</Box>

      {isEdit ? (
        <>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
            <MenuItem
              onClick={() => {
                onEdit?.(widget.id);
                closeMenu();
              }}
            >
              ویرایش
            </MenuItem>
            <MenuItem
              onClick={() => {
                onDuplicate?.(widget.id);
                closeMenu();
              }}
            >
              تکثیر
            </MenuItem>
            {otherSections.length > 0 && onMoveWidgetToSection ? (
              <MenuItem
                onClick={(event) => {
                  setMoveMenuAnchor(event.currentTarget);
                }}
              >
                انتقال به بخش
              </MenuItem>
            ) : null}
            <MenuItem
              onClick={() => {
                onDelete?.(widget.id);
                closeMenu();
              }}
            >
              حذف
            </MenuItem>
          </Menu>

          <Menu
            anchorEl={moveMenuAnchor}
            open={Boolean(moveMenuAnchor)}
            onClose={() => setMoveMenuAnchor(null)}
          >
            {otherSections.map((section) => (
              <MenuItem
                key={section.id}
                onClick={() => {
                  onMoveWidgetToSection?.(widget.id, section.id);
                  closeMenu();
                }}
              >
                {section.title}
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : null}

      <Menu
        anchorEl={criteriaMenuAnchor}
        open={criteriaMenuAnchor != null}
        onClose={() => setCriteriaMenuAnchor(null)}
      >
        {serverMetrics.map((metric) => (
          <MenuItem
            key={metric.id}
            onClick={() => {
              onConfigureServerMetric?.(metric.id);
              setCriteriaMenuAnchor(null);
            }}
          >
            {metric.label}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={alertMenuAnchor}
        open={alertMenuAnchor != null}
        onClose={() => setAlertMenuAnchor(null)}
      >
        {serverMetrics.map((metric) => (
          <MenuItem
            key={metric.id}
            onClick={() => {
              onConfigureServerAlert?.(metric.id);
              setAlertMenuAnchor(null);
            }}
          >
            {metric.label}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={detailMenuAnchor}
        open={detailMenuAnchor != null}
        onClose={() => setDetailMenuAnchor(null)}
      >
        {serverMetrics.map((metric) => (
          <MenuItem
            key={metric.id}
            onClick={() => {
              onOpenServerMetricDetails?.(metric.id);
              setDetailMenuAnchor(null);
            }}
          >
            {metric.label}
          </MenuItem>
        ))}
      </Menu>

      <WidgetDetailDialog
        open={detailDialogOpen}
        widget={widget}
        onClose={() => setDetailDialogOpen(false)}
      />
    </Paper>
  );
}
