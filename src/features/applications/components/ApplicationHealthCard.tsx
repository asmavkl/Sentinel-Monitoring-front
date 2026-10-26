// import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
// import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
// import { alpha, Box, Card, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
// import type { KeyboardEvent } from 'react';
// import { useRefreshApplicationStatus } from '@/features/applications/hooks/useApplications';
// import { ApplicationStatusBlock } from './ApplicationStatusBlock';
// import { ApplicationHealthStatus } from '@/types/enums';
// import type { ApplicationListItem } from '@/types/applications';
// import { formatRelativeTime } from '@/utils/dateUtils';
// import { getHealthStatusColor } from '@/utils/healthStatus';

// function monitoringStatusToHealthStatus(status: string): number {
//   switch (status) {
//     case 'UP':
//       return ApplicationHealthStatus.Normal;
//     case 'WARNING':
//       return ApplicationHealthStatus.Warning;
//     case 'DOWN':
//       return ApplicationHealthStatus.Critical;
//     case 'OUT_OF_SERVICE':
//       return ApplicationHealthStatus.OutOfService;
//     default:
//       return ApplicationHealthStatus.Unknown;
//   }
// }

// interface ApplicationHealthCardProps {
//   application: ApplicationListItem & { responseTimeMs?: number | null };
//   onOpen: (applicationId: number) => void;
// }

// function formatLastCheckTime(value: string | null): string {
//   if (!value) {
//     return '—';
//   }

//   return formatRelativeTime(value);
// }

// function formatResponseTime(responseTimeMs?: number | null): string | null {
//   if (responseTimeMs == null || Number.isNaN(responseTimeMs)) {
//     return null;
//   }

//   return `${Math.round(responseTimeMs)} ms`;
// }

// export function ApplicationHealthCard({ application, onOpen }: ApplicationHealthCardProps) {
//   const healthStatus = monitoringStatusToHealthStatus(application.status);
//   const responseTime = formatResponseTime(application.responseTimeMs);
//   const lastCheckLabel = application.lastUpdate ? formatLastCheckTime(application.lastUpdate) : null;
//   const refreshStatus = useRefreshApplicationStatus(application.id);
//   const statusColor = getHealthStatusColor(healthStatus as ApplicationHealthStatus);

//   const openDashboard = () => {
//     onOpen(application.id);
//   };

//   const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
//     if (event.key === 'Enter' || event.key === ' ') {
//       event.preventDefault();
//       openDashboard();
//     }
//   };

//   return (
//     <Card
//       role="link"
//       tabIndex={0}
//       aria-label={application.name}
//       data-testid="application-health-card"
//       data-application-id={application.id}
//       onClick={openDashboard}
//       onKeyDown={handleKeyDown}
//       sx={{
//         cursor: 'pointer',
//         width: '100%',
//         aspectRatio: '1 / 1',
//         height: 'auto',
//         alignSelf: 'start',
//         display: 'flex',
//         flexDirection: 'column',
//         overflow: 'hidden',
//         borderRadius: 2,
//         boxShadow: 'none',
//         '&:hover': {
//           transform: 'scale(1.05)',
//           transition: 'transform 0.2s ease',
//         },
//         '&:focus-visible': {
//           outline: '2px solid',
//           outlineColor: 'primary.main',
//         },
//       }}
//     >
//       <Stack
//         direction="row"
//         sx={{
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           gap: 0.5,
//           px: 1,
//           py: 0.5,
//           minHeight: 34,
//           bgcolor: alpha(statusColor, 0.08),
//           borderBottom: '1px solid',
//           borderColor: 'divider',
//         }}
//       >
//         <Typography
//           variant="subtitle2"
//           noWrap
//           title={application.name}
//           sx={{ fontWeight: 700, flex: 1, minWidth: 0, textAlign: 'start' }}
//         >
//           {application.name}
//         </Typography>
//         {lastCheckLabel ? (
//           <Typography
//             variant="caption"
//             color="text.secondary"
//             noWrap
//             title="آخرین بررسی"
//             sx={{ flexShrink: 0, maxWidth: 120 }}
//           >
//             {lastCheckLabel}
//           </Typography>
//         ) : null}
//         <Stack direction="row" spacing={0} sx={{ flexShrink: 0 }}>
//           <Tooltip title={refreshStatus.isPending ? 'در حال بروزرسانی' : 'بروزرسانی وضعیت'}>
//             <span>
//               <IconButton
//                 size="small"
//                 aria-label={`بروزرسانی وضعیت ${application.name}`}
//                 disabled={refreshStatus.isPending}
//                 onClick={(event) => {
//                   event.stopPropagation();
//                   refreshStatus.mutate();
//                 }}
//                 sx={{ p: 0.25 }}
//               >
//                 {refreshStatus.isPending ? (
//                   <CircularProgress size={14} />
//                 ) : (
//                   <SyncOutlinedIcon sx={{ fontSize: 16 }} />
//                 )}
//               </IconButton>
//             </span>
//           </Tooltip>
//           <Tooltip title="داشبورد">
//             <IconButton
//               size="small"
//               aria-label={`داشبورد ${application.name}`}
//               onClick={(event) => {
//                 event.stopPropagation();
//                 openDashboard();
//               }}
//               sx={{ p: 0.25 }}
//             >
//               <BarChartOutlinedIcon sx={{ fontSize: 16 }} />
//             </IconButton>
//           </Tooltip>
//         </Stack>
//       </Stack>

//       <ApplicationStatusBlock status={healthStatus} />

//       {responseTime ? (
//         <Box
//           sx={{
//             px: 1,
//             py: 0.6,
//             bgcolor: 'action.hover',
//             borderTop: '1px solid',
//             borderColor: 'divider',
//           }}
//         >
//           <Typography variant="caption" color="text.secondary" component="div">
//             زمان پاسخ: {responseTime}
//           </Typography>
//         </Box>
//       ) : null}
//     </Card>
//   );
// }
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import {
  alpha,
  Box,
  Card,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import type { KeyboardEvent } from 'react';

import { useRefreshApplicationStatus } from '@/features/applications/hooks/useApplications';
import { ApplicationStatusBlock } from './ApplicationStatusBlock';
import { ApplicationHealthStatus } from '@/types/enums';
import type { ApplicationListItem } from '@/types/applications';
import { formatRelativeTime } from '@/utils/dateUtils';
import { getHealthStatusColor } from '@/utils/healthStatus';

function monitoringStatusToHealthStatus(status: string): number {
  switch (status) {
    case 'UP':
      return ApplicationHealthStatus.Normal;
    case 'WARNING':
      return ApplicationHealthStatus.Warning;
    case 'DOWN':
      return ApplicationHealthStatus.Critical;
    case 'OUT_OF_SERVICE':
      return ApplicationHealthStatus.OutOfService;
    default:
      return ApplicationHealthStatus.Unknown;
  }
}

interface ApplicationHealthCardProps {
  application: ApplicationListItem & {
    responseTimeMs?: number | null;
  };
  onOpen: (applicationId: number) => void;
}

function formatLastCheckTime(value: string | null): string {
  if (!value) {
    return '—';
  }

  return formatRelativeTime(value);
}

function formatResponseTime(
  responseTimeMs?: number | null,
): string | null {
  if (responseTimeMs == null || Number.isNaN(responseTimeMs)) {
    return null;
  }

  return `${Math.round(responseTimeMs)} ms`;
}

export function ApplicationHealthCard({
  application,
  onOpen,
}: ApplicationHealthCardProps) {
  const healthStatus = monitoringStatusToHealthStatus(application.status);
  const responseTime = formatResponseTime(application.responseTimeMs);
  const lastCheckLabel = application.lastUpdate
    ? formatLastCheckTime(application.lastUpdate)
    : null;

  const refreshStatus = useRefreshApplicationStatus(application.id);
  const statusColor = getHealthStatusColor(
    healthStatus as ApplicationHealthStatus,
  );

  const openDashboard = () => {
    onOpen(application.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDashboard();
    }
  };

  return (
    <Card
      role="link"
      tabIndex={0}
      aria-label={application.name}
      data-testid="application-health-card"
      data-application-id={application.id}
      onClick={openDashboard}
      onKeyDown={handleKeyDown}
      sx={(theme) => ({
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        height: 'auto',
        alignSelf: 'start',

        display: 'flex',
        flexDirection: 'column',

        overflow: 'hidden',

        bgcolor: 'background.paper',

        border: '1px solid',
        borderColor:
          theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.08)'
            : '#E2E7EB',

        borderRadius: 2.5,

        boxShadow: 'none',

        cursor: 'pointer',

        transition:
          'border-color 160ms ease, background-color 160ms ease, transform 160ms ease',

        '&:hover': {
          borderColor: alpha(statusColor, 0.45),
          bgcolor:
            theme.palette.mode === 'dark'
              ? alpha(statusColor, 0.035)
              : alpha(statusColor, 0.018),
          transform: 'translateY(-2px)',
        },

        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: alpha(statusColor, 0.65),
          outlineOffset: 2,
        },

        '&:active': {
          transform: 'translateY(0)',
        },
      })}
    >
      {/* Header */}
      <Stack
        direction="row"
        sx={(theme) => ({
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 0.75,

          minHeight: 44,
          px: 1.1,
          py: 0.65,

          bgcolor: alpha(statusColor, 0.055),

          borderBottom: '1px solid',
          borderColor:
            theme.palette.mode === 'dark'
              ? alpha(statusColor, 0.14)
              : alpha(statusColor, 0.1),
        })}
      >
        {/* Status indicator */}
        <Box
          aria-hidden
          sx={{
            width: 4,
            alignSelf: 'stretch',
            flexShrink: 0,
            borderRadius: 2,
            bgcolor: statusColor,
          }}
        />

        {/* Application name + last check */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.2,
          }}
        >
          <Typography
            component="h2"
            noWrap
            title={application.name}
            sx={{
              minWidth: 0,
              fontSize: '0.82rem',
              fontWeight: 700,
              lineHeight: 1.35,
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {application.name}
          </Typography>

          {lastCheckLabel ? (
            <Typography
              component="span"
              noWrap
              title={`آخرین بررسی: ${lastCheckLabel}`}
              sx={{
                fontSize: '0.64rem',
                lineHeight: 1.2,
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              آخرین بررسی: {lastCheckLabel}
            </Typography>
          ) : null}
        </Box>

        {/* Actions */}
        <Stack
          direction="row"
          spacing={0.25}
          sx={{
            flexShrink: 0,
            alignItems: 'center',
          }}
        >
          <Tooltip
            title={
              refreshStatus.isPending
                ? 'در حال بروزرسانی'
                : 'بروزرسانی وضعیت'
            }
          >
            <span>
              <IconButton
                size="small"
                aria-label={`بروزرسانی وضعیت ${application.name}`}
                disabled={refreshStatus.isPending}
                onClick={(event) => {
                  event.stopPropagation();
                  refreshStatus.mutate();
                }}
                sx={{
                  width: 28,
                  height: 28,
                  color: 'text.secondary',
                  borderRadius: 1.25,

                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                {refreshStatus.isPending ? (
                  <CircularProgress size={14} />
                ) : (
                  <SyncOutlinedIcon sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="مشاهده داشبورد">
            <IconButton
              size="small"
              aria-label={`داشبورد ${application.name}`}
              onClick={(event) => {
                event.stopPropagation();
                openDashboard();
              }}
              sx={{
                width: 28,
                height: 28,
                color: 'text.secondary',
                borderRadius: 1.25,

                '&:hover': {
                  color: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <BarChartOutlinedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Main status */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: 'stretch',
        }}
      >
        <ApplicationStatusBlock status={healthStatus} />
      </Box>

      {/* Response time */}
      {responseTime ? (
        <Box
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',

            minHeight: 32,
            px: 1.1,
            py: 0.5,

            bgcolor:
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.025)'
                : '#F8FAFB',

            borderTop: '1px solid',
            borderColor:
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.06)'
                : '#EDF0F2',
          })}
        >
          <Typography
            component="span"
            sx={{
              fontSize: '0.64rem',
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            زمان پاسخ
          </Typography>

          <Typography
            component="span"
            sx={{
              fontSize: '0.7rem',
              color: 'text.primary',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {responseTime}
          </Typography>
        </Box>
      ) : null}
    </Card>
  );
}