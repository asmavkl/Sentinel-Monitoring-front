// import { Box, Stack, Typography } from '@mui/material';
// import { healthStatusTheme } from '@/theme/healthStatusTheme';

// export interface MonitoringSummaryBarProps {
//   up?: number;
//   warning?: number;
//   down?: number;
//   unknown?: number;
//   outOfService?: number;
//   title?: string;
//   compact?: boolean;
//   variant?: 'default' | 'onPrimary';
// }

// interface SummaryItemProps {
//   label: string;
//   count: number;
//   color: string;
//   compact: boolean;
//   onPrimary: boolean;
// }

// function SummaryItem({ label, count, color, compact, onPrimary }: SummaryItemProps) {
//   return (
//     <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
//       <Box
//         sx={{
//           width: compact ? 8 : 10,
//           height: compact ? 8 : 10,
//           borderRadius: '50%',
//           bgcolor: color,
//           flexShrink: 0,
//           boxShadow: onPrimary ? '0 0 0 1px rgba(255,255,255,0.35)' : 'none',
//         }}
//       />
//       <Typography
//         component="span"
//         sx={{
//           fontSize: compact ? '0.75rem' : '0.8125rem',
//           fontWeight: 600,
//           color: onPrimary ? 'inherit' : 'text.primary',
//           whiteSpace: 'nowrap',
//         }}
//       >
//         {label}: {count}
//       </Typography>
//     </Stack>
//   );
// }

// export function MonitoringSummaryBar({
//   up = 0,
//   warning = 0,
//   down = 0,
//   unknown = 0,
//   outOfService = 0,
//   title,
//   compact = false,
//   variant = 'default',
// }: MonitoringSummaryBarProps) {
//   const onPrimary = variant === 'onPrimary';

//   return (
//     <Box
//       data-testid="monitoring-summary-bar"
//       sx={{
//         display: 'flex',
//         flexDirection: compact ? 'row' : 'column',
//         alignItems: compact ? 'center' : 'stretch',
//         gap: compact ? 2 : 1,
//         ...(compact
//           ? {}
//           : {
//               px: 1.5,
//               py: 1,
//               bgcolor: 'background.paper',
//               border: '1px solid',
//               borderColor: 'divider',
//             }),
//       }}
//     >
//       {title ? (
//         <Typography
//           sx={{
//             fontSize: '0.8125rem',
//             fontWeight: 700,
//             color: onPrimary ? 'inherit' : 'text.secondary',
//           }}
//         >
//           {title}
//         </Typography>
//       ) : null}

//       <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
//         <SummaryItem
//           label={compact ? 'سالم' : ''}
//           count={up}
//           color={healthStatusTheme.UP.background}
//           compact={compact}
//           onPrimary={onPrimary}
//         />
//         <SummaryItem
//           label="هشدار"
//           count={warning}
//           color={healthStatusTheme.WARNING.background}
//           compact={compact}
//           onPrimary={onPrimary}
//         />
//         <SummaryItem
//           label="بحرانی"
//           count={down}
//           color={healthStatusTheme.DOWN.background}
//           compact={compact}
//           onPrimary={onPrimary}
//         />
//         <SummaryItem
//           label="قطع"
//           count={outOfService}
//           color={healthStatusTheme.OUT_OF_SERVICE.background}
//           compact={compact}
//           onPrimary={onPrimary}
//         />
//         {unknown > 0 ? (
//           <SummaryItem
//             label="نامشخص"
//             count={unknown}
//             color={healthStatusTheme.UNKNOWN.background}
//             compact={compact}
//             onPrimary={onPrimary}
//           />
//         ) : null}
//       </Stack>
//     </Box>
//   );
// }
import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { healthStatusTheme } from '@/theme/healthStatusTheme';

export interface MonitoringSummaryBarProps {
  up?: number;
  warning?: number;
  down?: number;
  unknown?: number;
  outOfService?: number;
  title?: string;
  compact?: boolean;
  variant?: 'default' | 'onPrimary';
}

interface SummaryItemProps {
  label: string;
  count: number;
  color: string;
  compact: boolean;
  onPrimary: boolean;
}

function SummaryItem({
  label,
  count,
  color,
  compact,
  onPrimary,
}: SummaryItemProps) {
  return (
    <Box
      sx={(theme) => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.85,
        px: compact ? 0.75 : 1.15,
        py: compact ? 0.5 : 0.7,
        borderRadius: 1.75,
        bgcolor: onPrimary
          ? alpha('#FFFFFF', 0.08)
          : alpha(color, theme.palette.mode === 'dark' ? 0.1 : 0.055),
        border: '1px solid',
        borderColor: onPrimary
          ? alpha('#FFFFFF', 0.1)
          : alpha(color, theme.palette.mode === 'dark' ? 0.2 : 0.12),
        transition: 'all 160ms ease',

        '&:hover': {
          bgcolor: onPrimary
            ? alpha('#FFFFFF', 0.13)
            : alpha(color, theme.palette.mode === 'dark' ? 0.16 : 0.09),
          borderColor: alpha(color, 0.28),
        },
      })}
    >
      <Box
        sx={{
          position: 'relative',
          width: compact ? 7 : 8,
          height: compact ? 7 : 8,
          flexShrink: 0,
          borderRadius: '50%',
          bgcolor: color,
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: -3,
            borderRadius: '50%',
            bgcolor: alpha(color, 0.12),
          },
        }}
      />

      <Typography
        component="span"
        sx={{
          fontSize: compact ? '0.72rem' : '0.77rem',
          fontWeight: 600,
          color: onPrimary ? alpha('#FFFFFF', 0.82) : 'text.secondary',
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>

      <Box
        sx={(theme) => ({
          minWidth: compact ? 20 : 23,
          height: compact ? 20 : 23,
          px: 0.45,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1.1,
          bgcolor: onPrimary
            ? alpha('#FFFFFF', 0.13)
            : alpha(color, theme.palette.mode === 'dark' ? 0.18 : 0.1),
          color: onPrimary ? '#FFFFFF' : color,
          fontSize: compact ? '0.68rem' : '0.71rem',
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
        })}
      >
        {count}
      </Box>
    </Box>
  );
}

export function MonitoringSummaryBar({
  up = 0,
  warning = 0,
  down = 0,
  unknown = 0,
  outOfService = 0,
  title,
  compact = false,
  variant = 'default',
}: MonitoringSummaryBarProps) {
  const onPrimary = variant === 'onPrimary';

  const items = [
    {
      label: 'سالم',
      count: up,
      color: healthStatusTheme.UP.background,
    },
    {
      label: 'هشدار',
      count: warning,
      color: healthStatusTheme.WARNING.background,
    },
    {
      label: 'بحرانی',
      count: down,
      color: healthStatusTheme.DOWN.background,
    },
    {
      label: 'قطع',
      count: outOfService,
      color: healthStatusTheme.OUT_OF_SERVICE.background,
    },
    ...(unknown > 0
      ? [
        {
          label: 'نامشخص',
          count: unknown,
          color: healthStatusTheme.UNKNOWN.background,
        },
      ]
      : []),
  ];

  const total = up + warning + down + outOfService + unknown;

  return (
    <Box
      data-testid="monitoring-summary-bar"
      sx={(theme) => ({
        position: 'relative',
        display: 'flex',
        alignItems: compact ? 'center' : 'flex-start',
        flexDirection: compact ? 'row' : 'column',
        gap: compact ? 1.5 : 1.1,
        px: compact ? 0.25 : 1.5,
        py: compact ? 0.5 : 1.25,
        bgcolor: compact
          ? 'transparent'
          : onPrimary
            ? alpha('#FFFFFF', 0.06)
            : theme.palette.background.paper,
        border: compact ? 'none' : '1px solid',
        borderColor: compact
          ? 'transparent'
          : onPrimary
            ? alpha('#FFFFFF', 0.11)
            : theme.palette.divider,
        borderRadius: compact ? 0 : 2,
      })}
    >
      {!compact && title ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            minWidth: 0,
          }}
        >
          <Typography
            sx={(theme) => ({
              fontSize: '0.8rem',
              fontWeight: 700,
              color: onPrimary
                ? alpha('#FFFFFF', 0.88)
                : theme.palette.text.secondary,
            })}
          >
            {title}
          </Typography>

          <Box
            sx={(theme) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 0.75,
              py: 0.35,
              borderRadius: 1,
              bgcolor: onPrimary
                ? alpha('#FFFFFF', 0.08)
                : theme.palette.mode === 'dark'
                  ? alpha('#FFFFFF', 0.05)
                  : '#F4F6F8',
              color: onPrimary
                ? alpha('#FFFFFF', 0.72)
                : theme.palette.text.secondary,
              fontSize: '0.68rem',
              fontWeight: 700,
            })}
          >
            <Box component="span">مجموع</Box>
            <Box
              component="span"
              sx={{
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {total}
            </Box>
          </Box>
        </Box>
      ) : null}

      {compact && title ? (
        <Typography
          sx={(theme) => ({
            fontSize: '0.75rem',
            fontWeight: 700,
            color: onPrimary
              ? alpha('#FFFFFF', 0.82)
              : theme.palette.text.secondary,
            whiteSpace: 'nowrap',
          })}
        >
          {title}
        </Typography>
      ) : null}

      <Stack
        direction="row"
        spacing={compact ? 0.75 : 0.85}
        sx={{
          alignItems: 'center',
          flexWrap: 'wrap',
          rowGap: 0.75,
          width: compact ? 'auto' : '100%',
        }}
      >
        {items.map((item) => (
          <SummaryItem
            key={item.label}
            label={item.label}
            count={item.count}
            color={item.color}
            compact={compact}
            onPrimary={onPrimary}
          />
        ))}
      </Stack>
    </Box>
  );
}