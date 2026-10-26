import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import {
  alpha,
  Box,
  Card,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import type { KeyboardEvent } from 'react';
import { ApplicationStatusBlock } from '@/features/applications/components/ApplicationStatusBlock';
import { ApplicationHealthStatus } from '@/types/enums';
import type { MonitoredServerDto, MonitoredServerStatusDto } from '@/types/monitoredServers';
import { getHealthStatusColor } from '@/utils/healthStatus';

interface ServerHealthCardProps {
  server: MonitoredServerDto;
  status?: MonitoredServerStatusDto;
  onOpen: (serverId: number) => void;
}

export function ServerHealthCard({ server, status, onOpen }: ServerHealthCardProps) {
  const healthStatus = status?.healthStatus ?? ApplicationHealthStatus.Unknown;
  const statusColor = getHealthStatusColor(healthStatus);

  const openServer = () => {
    onOpen(server.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openServer();
    }
  };

  return (
    <Card
      role="link"
      tabIndex={0}
      aria-label={server.name}
      data-testid="server-health-card"
      data-server-id={server.id}
      onClick={openServer}
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

        {/* Server name + last check */}
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
            title={server.name}
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
            {server.name}
          </Typography>

          <Typography
            component="span"
            noWrap
            sx={{
              fontSize: '0.64rem',
              lineHeight: 1.2,
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {server.host}:{server.port}
            {server.isActive ? '' : ' · غیرفعال'}
          </Typography>
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
          <Tooltip title="مشاهده داشبورد">
            <IconButton
              size="small"
              aria-label={`داشبورد ${server.name}`}
              onClick={(event) => {
                event.stopPropagation();
                openServer();
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

      {/* Error message */}
      {status?.errorMessage ? (
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
              color: 'error',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={status.errorMessage}
          >
            خطا
          </Typography>
        </Box>
      ) : null}
    </Card>
  );
}
