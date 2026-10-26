// import { Box } from '@mui/material';
// import type { ReactNode } from 'react';
// import { MonitoringSectionHeader } from './MonitoringSectionHeader';
// import type { MonitoringSectionColor } from './MonitoringSectionHeader';

// interface MonitoringTableCardProps {
//   title?: string;
//   color?: MonitoringSectionColor;
//   children: ReactNode;
// }

// export function MonitoringTableCard({
//   title,
//   color = 'blue',
//   children,
// }: MonitoringTableCardProps) {
//   return (
//     <Box data-testid="monitoring-table-card">
//       {title ? (
//         <Box sx={{ mb: 0 }}>
//           <MonitoringSectionHeader title={title} color={color} />
//         </Box>
//       ) : null}
//       <Box
//         sx={{
//           bgcolor: 'background.paper',
//           border: '1px solid',
//           borderColor: 'divider',
//           borderTop: title ? 'none' : '1px solid',
//           overflow: 'auto',
//         }}
//       >
//         {children}
//       </Box>
//     </Box>
//   );
// }
import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { MonitoringSectionHeader } from './MonitoringSectionHeader';
import type { MonitoringSectionColor } from './MonitoringSectionHeader';

interface MonitoringTableCardProps {
  title?: string;
  color?: MonitoringSectionColor;
  children: ReactNode;
}

export function MonitoringTableCard({
  title,
  color = 'blue',
  children,
}: MonitoringTableCardProps) {
  return (
    <Box
      data-testid="monitoring-table-card"
      sx={(theme) => ({
        width: '100%',
        minWidth: 0,
        overflow: 'hidden',

        bgcolor: 'background.paper',

        border: '1px solid',
        borderColor:
          theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.08)'
            : '#E3E8EC',

        borderRadius: 2.5,

        // بدون سایه
        boxShadow: 'none',
      })}
    >
      {title ? (
        <Box
          sx={{
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <MonitoringSectionHeader
            title={title}
            color={color}
          />
        </Box>
      ) : null}

      <Box
        sx={(theme) => ({
          width: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',

          bgcolor: 'background.paper',

          borderTop: title
            ? '1px solid'
            : 'none',

          borderColor:
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.07)'
              : '#E8ECEF',

          // برای جدول‌هایی که عرضشان زیاد است
          '& > table': {
            width: '100%',
            minWidth: 720,
          },

          // Scrollbar ظریف‌تر
          '&::-webkit-scrollbar': {
            height: 7,
          },

          '&::-webkit-scrollbar-thumb': {
            backgroundColor:
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.18)'
                : 'rgba(100,116,139,0.25)',
            borderRadius: 10,
          },

          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
        })}
      >
        {children}
      </Box>
    </Box>
  );
}