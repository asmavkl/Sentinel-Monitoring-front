// import RedoIcon from '@mui/icons-material/Redo';
// import UndoIcon from '@mui/icons-material/Undo';
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
// import { Alert, Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
// import type { ReactNode } from 'react';
// import { StatusBadge } from '@/components/common';
// import { AutoRefreshToggle } from '@/features/dashboard/components/AutoRefreshToggle';
// import { DashboardRefreshButton } from '@/features/dashboard/components/DashboardRefreshButton';
// import { LastUpdatedLabel } from '@/features/dashboard/components/LastUpdatedLabel';
// import type { MonitoringStatus } from '@/utils/status';

// interface DashboardToolbarProps {
//   dashboardName: string;
//   subtitle?: string;
//   isEditMode: boolean;
//   canEdit?: boolean;
//   isSaving?: boolean;
//   isDirty?: boolean;
//   showRefreshControls?: boolean;
//   status?: MonitoringStatus;
//   lastUpdatedAt?: number | null;
//   isRefreshing?: boolean;
//   refreshError?: string | null;
//   canUndo?: boolean;
//   canRedo?: boolean;
//   previewMode?: boolean;
//   onEdit?: () => void;
//   onSave?: () => void;
//   onCancel?: () => void;
//   onRefresh?: () => void;
//   onAddSection?: () => void;
//   onUndo?: () => void;
//   onRedo?: () => void;
//   onTogglePreview?: () => void;
//   leadingActions?: ReactNode;
//   cornerAction?: ReactNode;
// }

// export function DashboardToolbar({
//   dashboardName,
//   subtitle,
//   isEditMode,
//   canEdit = false,
//   isSaving = false,
//   isDirty = false,
//   showRefreshControls = false,
//   status,
//   lastUpdatedAt,
//   isRefreshing = false,
//   refreshError,
//   canUndo = false,
//   canRedo = false,
//   previewMode = false,
//   onEdit,
//   onSave,
//   onCancel,
//   onRefresh,
//   onAddSection,
//   onUndo,
//   onRedo,
//   onTogglePreview,
//   leadingActions,
//   cornerAction,
// }: DashboardToolbarProps) {
//   return (
//     <Stack spacing={1}>
//       <Stack
//         direction={{ xs: 'column', sm: 'row' }}
//         spacing={1.5}
//         sx={{
//           alignItems: { xs: 'flex-start', sm: 'center' },
//           justifyContent: 'space-between',
//           bgcolor: isEditMode ? 'primary.main' : 'transparent',
//           color: isEditMode ? 'primary.contrastText' : 'inherit',
//           px: isEditMode ? 1.5 : 0,
//           py: isEditMode ? 1 : 0,
//           borderRadius: 1,
//         }}
//       >
//         <Box>
//           <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
//             <Typography
//               variant="h5"
//               sx={{ fontWeight: 700, color: 'inherit' }}
//               gutterBottom={Boolean(subtitle) && !showRefreshControls && !isEditMode}
//             >
//               {dashboardName}
//             </Typography>
//             {showRefreshControls && status ? <StatusBadge status={status} /> : null}
//           </Stack>
//           {subtitle ? (
//             <Typography
//               variant="body2"
//               sx={{ color: isEditMode ? 'primary.contrastText' : 'text.secondary', opacity: 0.9 }}
//             >
//               {subtitle}
//             </Typography>
//           ) : null}
//           {showRefreshControls ? <LastUpdatedLabel updatedAt={lastUpdatedAt} /> : null}
//         </Box>

//         <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
//           {showRefreshControls ? (
//             <>
//               <AutoRefreshToggle />
//               <DashboardRefreshButton onRefresh={() => onRefresh?.()} loading={isRefreshing} />
//             </>
//           ) : null}

//           {!isEditMode && canEdit ? (
//             <Button variant="contained" onClick={onEdit}>
//               ویرایش داشبورد
//             </Button>
//           ) : null}

//           {isEditMode ? (
//             <>
//               {leadingActions}
//               <Tooltip title="بازگردانی">
//                 <span>
//                   <IconButton
//                     size="small"
//                     disabled={!canUndo || isSaving}
//                     onClick={onUndo}
//                     aria-label="بازگردانی"
//                     sx={{ color: 'inherit' }}
//                   >
//                     <UndoIcon fontSize="small" />
//                   </IconButton>
//                 </span>
//               </Tooltip>
//               <Tooltip title="انجام دوباره">
//                 <span>
//                   <IconButton
//                     size="small"
//                     disabled={!canRedo || isSaving}
//                     onClick={onRedo}
//                     aria-label="انجام دوباره"
//                     sx={{ color: 'inherit' }}
//                   >
//                     <RedoIcon fontSize="small" />
//                   </IconButton>
//                 </span>
//               </Tooltip>
//               <Tooltip title={previewMode ? 'خروج از پیش‌نمایش' : 'پیش‌نمایش'}>
//                 <IconButton
//                   size="small"
//                   disabled={isSaving}
//                   onClick={onTogglePreview}
//                   aria-label={previewMode ? 'خروج از پیش‌نمایش' : 'پیش‌نمایش'}
//                   sx={{ color: 'inherit' }}
//                 >
//                   {previewMode ? (
//                     <VisibilityOffIcon fontSize="small" />
//                   ) : (
//                     <VisibilityIcon fontSize="small" />
//                   )}
//                 </IconButton>
//               </Tooltip>
//               {onAddSection ? (
//                 <Button
//                   variant="outlined"
//                   size="small"
//                   onClick={onAddSection}
//                   aria-label="افزودن بخش"
//                   disabled={isSaving || previewMode}
//                   sx={{
//                     color: 'inherit',
//                     borderColor: 'currentColor',
//                     '&:hover': { borderColor: 'currentColor', bgcolor: 'rgba(255,255,255,0.08)' },
//                   }}
//                 >
//                   افزودن بخش
//                 </Button>
//               ) : null}
//               <Button
//                 variant="outlined"
//                 size="small"
//                 onClick={onCancel}
//                 disabled={isSaving}
//                 sx={{
//                   color: 'inherit',
//                   borderColor: 'currentColor',
//                   '&:hover': { borderColor: 'currentColor', bgcolor: 'rgba(255,255,255,0.08)' },
//                 }}
//               >
//                 انصراف
//               </Button>
//               <Button
//                 variant="contained"
//                 size="small"
//                 color="secondary"
//                 onClick={onSave}
//                 disabled={isSaving || !isDirty}
//               >
//                 {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
//               </Button>
//               {cornerAction}
//             </>
//           ) : null}
//         </Stack>
//       </Stack>

//       {showRefreshControls && refreshError ? (
//         <Alert severity="warning">{refreshError}</Alert>
//       ) : null}
//     </Stack>
//   );
// }
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';

import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';

import { StatusBadge } from '@/components/common';
import { AutoRefreshToggle } from '@/features/dashboard/components/AutoRefreshToggle';
import { DashboardRefreshButton } from '@/features/dashboard/components/DashboardRefreshButton';
import { LastUpdatedLabel } from '@/features/dashboard/components/LastUpdatedLabel';
import type { MonitoringStatus } from '@/utils/status';

interface DashboardToolbarProps {
  dashboardName: string;
  subtitle?: string;

  isEditMode: boolean;
  canEdit?: boolean;
  isSaving?: boolean;
  isDirty?: boolean;

  showRefreshControls?: boolean;
  status?: MonitoringStatus;
  lastUpdatedAt?: number | null;
  isRefreshing?: boolean;
  refreshError?: string | null;

  canUndo?: boolean;
  canRedo?: boolean;
  previewMode?: boolean;

  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onRefresh?: () => void;
  onAddSection?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onTogglePreview?: () => void;

  leadingActions?: ReactNode;
  cornerAction?: ReactNode;
}

export function DashboardToolbar({
  dashboardName,
  subtitle,
  isEditMode,
  canEdit = false,
  isSaving = false,
  isDirty = false,

  showRefreshControls = true,
  status,
  lastUpdatedAt,
  isRefreshing = false,
  refreshError,

  canUndo = false,
  canRedo = false,
  previewMode = false,

  onEdit,
  onSave,
  onCancel,
  onRefresh,
  onAddSection,
  onUndo,
  onRedo,
  onTogglePreview,

  leadingActions,
  cornerAction,
}: DashboardToolbarProps) {
  const iconButtonSx = {
    width: 34,
    height: 34,
    borderRadius: 1.5,
    color: 'text.secondary',
    '&:hover': {
      bgcolor: 'action.hover',
      color: 'text.primary',
    },
  };

  return (
    <Stack spacing={1.25}>
      <Box
        sx={(theme) => ({
          width: '100%',
          minWidth: 0,

          display: 'flex',
          alignItems: {
            xs: 'stretch',
            lg: 'center',
          },
          justifyContent: 'space-between',

          flexDirection: {
            xs: 'column',
            lg: 'row',
          },

          gap: {
            xs: 1.25,
            lg: 2,
          },

          px: {
            xs: 1.25,
            sm: 1.5,
          },

          py: {
            xs: 1.1,
            sm: 1.25,
          },

          border: '1px solid',

          borderColor:
            theme.palette.mode === 'dark'
              ? alpha('#FFFFFF', 0.08)
              : '#E3E8EC',

          borderRadius: 2.5,

          bgcolor:
            theme.palette.mode === 'dark'
              ? '#171C23'
              : '#F8FAFB',

          boxShadow: 'none',

          transition: 'border-color 160ms ease, background-color 160ms ease',
        })}
      >
        {/* =========================================================
            LEFT / MAIN INFORMATION
           ========================================================= */}

        <Stack
          direction="row"
          spacing={1.2}
          sx={{
            alignItems: 'center',
            minWidth: 0,
            flex: 1,
          }}
        >
          {/* Status accent */}
          <Box
            sx={(theme) => ({
              width: 4,
              height: {
                xs: 42,
                sm: 48,
              },

              flexShrink: 0,

              borderRadius: 10,

              bgcolor: isEditMode
                ? theme.palette.primary.main
                : status === 'UP'
                  ? '#3F978E'
                  : status === 'WARNING'
                    ? '#D99A28'
                    : status === 'DOWN'
                      ? '#D95C5C'
                      : '#94A3B8',
            })}
          />

          <Box
            sx={{
              minWidth: 0,
              flex: 1,
            }}
          >
            {/* Title row */}
            <Stack
              direction="row"
              spacing={0.9}
              sx={{
                alignItems: 'center',
                minWidth: 0,
                flexWrap: 'wrap',
                rowGap: 0.5,
              }}
            >
              <Typography
                component="h1"
                sx={{
                  minWidth: 0,
                  maxWidth: {
                    xs: '100%',
                    sm: 520,
                  },

                  fontSize: {
                    xs: '1.05rem',
                    sm: '1.15rem',
                  },

                  fontWeight: 750,
                  lineHeight: 1.3,

                  letterSpacing: '-0.015em',

                  color: 'text.primary',

                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {dashboardName}
              </Typography>

              {showRefreshControls && status ? (
                <StatusBadge status={status} />
              ) : null}

              {isEditMode ? (
                <Box
                  sx={(theme) => ({
                    display: 'inline-flex',
                    alignItems: 'center',

                    height: 22,
                    px: 0.8,

                    borderRadius: 1,

                    bgcolor: alpha(
                      theme.palette.primary.main,
                      theme.palette.mode === 'dark' ? 0.14 : 0.08,
                    ),

                    color: 'primary.main',

                    fontSize: '0.64rem',
                    fontWeight: 700,

                    whiteSpace: 'nowrap',
                  })}
                >
                  ویرایش
                </Box>
              ) : null}
            </Stack>

            {/* Subtitle */}
            {subtitle ? (
              <Typography
                component="p"
                sx={{
                  mt: 0.35,

                  maxWidth: 680,

                  color: 'text.secondary',

                  fontSize: '0.76rem',
                  lineHeight: 1.45,

                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {subtitle}
              </Typography>
            ) : null}

            {/* Last update */}
            {showRefreshControls && !isEditMode ? (
              <Box
                sx={{
                  mt: 0.45,
                }}
              >
                <LastUpdatedLabel updatedAt={lastUpdatedAt} />
              </Box>
            ) : null}
          </Box>
        </Stack>

        {/* =========================================================
            NORMAL MODE
           ========================================================= */}

        {!isEditMode ? (
          <Stack
            direction="row"
            spacing={0.75}
            sx={{
              alignItems: 'center',
              justifyContent: {
                xs: 'flex-start',
                lg: 'flex-end',
              },

              flexWrap: 'wrap',
              flexShrink: 0,

              width: {
                xs: '100%',
                lg: 'auto',
              },
            }}
          >
            {showRefreshControls ? (
              <>
                {/* Refresh controls group */}
                <Stack
                  direction="row"
                  spacing={0.35}
                  sx={(theme) => ({
                    alignItems: 'center',

                    px: 0.45,
                    py: 0.35,

                    borderRadius: 1.75,

                    border: '1px solid',

                    borderColor:
                      theme.palette.mode === 'dark'
                        ? alpha('#FFFFFF', 0.07)
                        : '#E2E7EB',

                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? alpha('#FFFFFF', 0.025)
                        : '#FFFFFF',
                  })}
                >
                  <AutoRefreshToggle />

                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      height: 20,
                      alignSelf: 'center',
                    }}
                  />

                  <DashboardRefreshButton
                    onRefresh={() => onRefresh?.()}
                    loading={isRefreshing}
                  />
                </Stack>
              </>
            ) : null}

            {/* Edit */}
            {canEdit ? (
              <Button
                variant="contained"
                onClick={onEdit}
                startIcon={<RefreshIcon sx={{ display: 'none' }} />}
                sx={{
                  minHeight: 38,

                  px: 1.8,

                  borderRadius: 1.75,

                  fontWeight: 700,

                  whiteSpace: 'nowrap',

                  boxShadow: 'none',

                  '&:hover': {
                    boxShadow: 'none',
                  },
                }}
              >
                ویرایش داشبورد
              </Button>
            ) : null}
          </Stack>
        ) : (
          /* =========================================================
             EDIT MODE
             ========================================================= */

          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              alignItems: 'center',
              flexWrap: 'wrap',
              flexShrink: 0,
            }}
          >
            {/* Leading actions */}
            {leadingActions ? (
              <>
                {leadingActions}

                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    height: 22,
                    mx: 0.5,
                  }}
                />
              </>
            ) : null}

            {/* Undo / Redo */}
            <Stack
              direction="row"
              spacing={0.15}
              sx={(theme) => ({
                alignItems: 'center',

                px: 0.25,
                py: 0.25,

                borderRadius: 1.5,

                bgcolor:
                  theme.palette.mode === 'dark'
                    ? alpha('#FFFFFF', 0.045)
                    : alpha('#000000', 0.035),
              })}
            >
              <Tooltip title="بازگردانی">
                <span>
                  <IconButton
                    size="small"
                    disabled={!canUndo || isSaving}
                    onClick={onUndo}
                    aria-label="بازگردانی"
                    sx={iconButtonSx}
                  >
                    <UndoIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="انجام دوباره">
                <span>
                  <IconButton
                    size="small"
                    disabled={!canRedo || isSaving}
                    onClick={onRedo}
                    aria-label="انجام دوباره"
                    sx={iconButtonSx}
                  >
                    <RedoIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>

            {/* Preview */}
            <Tooltip
              title={
                previewMode
                  ? 'خروج از پیش‌نمایش'
                  : 'پیش‌نمایش داشبورد'
              }
            >
              <span>
                <IconButton
                  size="small"
                  disabled={isSaving}
                  onClick={onTogglePreview}
                  aria-label={
                    previewMode
                      ? 'خروج از پیش‌نمایش'
                      : 'پیش‌نمایش داشبورد'
                  }
                  aria-pressed={previewMode}
                  sx={(theme) => ({
                    ...iconButtonSx,

                    color: previewMode
                      ? 'primary.main'
                      : 'text.secondary',

                    bgcolor: previewMode
                      ? alpha(theme.palette.primary.main, 0.09)
                      : 'transparent',

                    '&:hover': {
                      bgcolor: alpha(
                        theme.palette.primary.main,
                        0.08,
                      ),
                    },
                  })}
                >
                  {previewMode ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                height: 22,
                mx: 0.5,
              }}
            />

            {/* Add section */}
            {onAddSection ? (
              <Button
                variant="outlined"
                size="small"
                disabled={isSaving || previewMode}
                onClick={onAddSection}
                sx={{
                  minHeight: 34,
                  px: 1.3,

                  borderRadius: 1.5,

                  fontWeight: 650,

                  whiteSpace: 'nowrap',
                }}
              >
                افزودن بخش
              </Button>
            ) : null}

            {/* Cancel */}
            <Button
              variant="text"
              size="small"
              disabled={isSaving}
              onClick={onCancel}
              sx={{
                minHeight: 34,
                px: 1.15,

                borderRadius: 1.5,

                color: 'text.secondary',

                fontWeight: 650,

                whiteSpace: 'nowrap',

                '&:hover': {
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                },
              }}
            >
              انصراف
            </Button>

            {/* Save */}
            <Button
              variant="contained"
              size="small"
              disabled={isSaving || !isDirty}
              onClick={onSave}
              sx={{
                minHeight: 34,
                minWidth: 72,

                px: 1.5,

                borderRadius: 1.5,

                fontWeight: 700,

                whiteSpace: 'nowrap',

                boxShadow: 'none',

                '&:hover': {
                  boxShadow: 'none',
                },
              }}
            >
              {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
            </Button>

            {/* Corner action */}
            {cornerAction ? (
              <>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    height: 22,
                    mx: 0.5,
                  }}
                />

                {cornerAction}
              </>
            ) : null}
          </Stack>
        )}
      </Box>

      {/* Refresh error */}
      {showRefreshControls && refreshError ? (
        <Alert
          severity="warning"
          variant="outlined"
          sx={{
            py: 0.2,
            borderRadius: 1.75,

            '& .MuiAlert-icon': {
              py: 0.6,
            },

            '& .MuiAlert-message': {
              fontSize: '0.76rem',
              lineHeight: 1.5,
            },
          }}
        >
          {refreshError}
        </Alert>
      ) : null}
    </Stack>
  );
}