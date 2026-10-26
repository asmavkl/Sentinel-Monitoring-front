// import AddChartIcon from '@mui/icons-material/Addchart';
// import NumbersIcon from '@mui/icons-material/Numbers';
// import TableChartIcon from '@mui/icons-material/TableChart';
// import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
// import TimelineIcon from '@mui/icons-material/Timeline';
// import SpeedIcon from '@mui/icons-material/Speed';
// import LinearScaleIcon from '@mui/icons-material/LinearScale';
// import { Box, ButtonBase, Card, CardContent, Stack, Typography } from '@mui/material';
// import type { SvgIconComponent } from '@mui/icons-material';
// import { getRegisteredWidgetTypes } from '@/components/widgets/registry';
// import { WIDGET_TYPE_LABELS, type WidgetType } from '@/types/widgets';

// const WIDGET_TYPE_ICONS: Record<WidgetType, SvgIconComponent> = {
//   StatusCard: MonitorHeartIcon,
//   NumberCard: NumbersIcon,
//   Chart: AddChartIcon,
//   MultiSeriesChart: TimelineIcon,
//   Table: TableChartIcon,
//   Gauge: SpeedIcon,
//   ProgressBar: LinearScaleIcon,
// };

// interface WidgetLibraryProps {
//   onSelect: (widgetType: WidgetType) => void;
//   disabled?: boolean;
//   excludedTypes?: WidgetType[];
// }

// export function WidgetLibrary({ onSelect, disabled = false, excludedTypes = [] }: WidgetLibraryProps) {
//   const widgetTypes = getRegisteredWidgetTypes().filter((widgetType) => !excludedTypes.includes(widgetType));

//   return (
//     <Card
//       variant="outlined"
//       sx={{ height: '100%', bgcolor: 'background.paper' }}
//       data-testid="widget-library-panel"
//     >
//       <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
//         <Stack spacing={1}>
//           <Box
//             sx={{
//               px: 1,
//               py: 0.75,
//               bgcolor: 'primary.main',
//               color: 'primary.contrastText',
//               borderRadius: 0.5,
//             }}
//           >
//             <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
//               کتابخانه ویجت
//             </Typography>
//           </Box>
//           {widgetTypes.map((widgetType) => {
//             const Icon = WIDGET_TYPE_ICONS[widgetType];
//             const label = WIDGET_TYPE_LABELS[widgetType];

//             return (
//               <ButtonBase
//                 key={widgetType}
//                 disabled={disabled}
//                 onClick={() => onSelect(widgetType)}
//                 sx={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 1,
//                   justifyContent: 'flex-start',
//                   width: '100%',
//                   px: 1,
//                   py: 1,
//                   borderRadius: 0.5,
//                   border: '1px solid',
//                   borderColor: 'divider',
//                   bgcolor: 'grey.50',
//                   textAlign: 'start',
//                   '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.light' },
//                   '&.Mui-disabled': { opacity: 0.5 },
//                 }}
//               >
//                 <Icon fontSize="small" color="primary" />
//                 <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                   {label}
//                 </Typography>
//               </ButtonBase>
//             );
//           })}
//         </Stack>
//       </CardContent>
//     </Card>
//   );
// }
import AddChartIcon from '@mui/icons-material/Addchart';
import NumbersIcon from '@mui/icons-material/Numbers';
import TableChartIcon from '@mui/icons-material/TableChart';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import TimelineIcon from '@mui/icons-material/Timeline';
import SpeedIcon from '@mui/icons-material/Speed';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';

import {
  Box,
  ButtonBase,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';

import { alpha } from '@mui/material/styles';
import type { SvgIconComponent } from '@mui/icons-material';

import { getRegisteredWidgetTypes } from '@/components/widgets/registry';
import {
  WIDGET_TYPE_LABELS,
  type WidgetType,
} from '@/types/widgets';

const WIDGET_TYPE_ICONS: Record<WidgetType, SvgIconComponent> = {
  StatusCard: MonitorHeartIcon,
  NumberCard: NumbersIcon,
  Chart: AddChartIcon,
  MultiSeriesChart: TimelineIcon,
  Table: TableChartIcon,
  Gauge: SpeedIcon,
  ProgressBar: LinearScaleIcon,
};

interface WidgetLibraryProps {
  onSelect: (widgetType: WidgetType) => void;
  disabled?: boolean;
  excludedTypes?: WidgetType[];
}

export function WidgetLibrary({
  onSelect,
  disabled = false,
  excludedTypes = [],
}: WidgetLibraryProps) {
  const widgetTypes = getRegisteredWidgetTypes().filter(
    (widgetType) => !excludedTypes.includes(widgetType),
  );

  return (
    <Card
      variant="outlined"
      data-testid="widget-library-panel"
      sx={(theme) => ({
        height: '100%',
        minWidth: 0,
        overflow: 'hidden',

        bgcolor: 'background.paper',

        borderColor:
          theme.palette.mode === 'dark'
            ? alpha('#FFFFFF', 0.08)
            : '#E3E8EC',

        borderRadius: 2.5,

        boxShadow: 'none',
      })}
    >
      <CardContent
        sx={{
          p: 1.25,
          '&:last-child': {
            pb: 1.25,
          },
        }}
      >
        <Stack spacing={1.25}>
          {/* =====================================================
              HEADER
             ===================================================== */}

          <Box
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',

              minHeight: 42,

              px: 1.1,
              py: 0.75,

              borderRadius: 1.75,

              bgcolor:
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.main, 0.08)
                  : alpha(theme.palette.primary.main, 0.055),

              border: '1px solid',

              borderColor:
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.main, 0.14)
                  : alpha(theme.palette.primary.main, 0.1),
            })}
          >
            <Stack
              direction="row"
              spacing={0.9}
              sx={{
                alignItems: 'center',
                minWidth: 0,
              }}
            >
              {/* Header icon */}
              <Box
                sx={(theme) => ({
                  width: 30,
                  height: 30,

                  flexShrink: 0,

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                  borderRadius: 1.25,

                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.16)
                      : alpha(theme.palette.primary.main, 0.1),

                  color: 'primary.main',
                })}
              >
                <WidgetsOutlinedIcon fontSize="small" />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 750,
                    lineHeight: 1.25,
                    color: 'text.primary',
                  }}
                >
                  کتابخانه ویجت
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.15,
                    color: 'text.secondary',
                    lineHeight: 1.3,
                  }}
                >
                  افزودن به داشبورد
                </Typography>
              </Box>
            </Stack>

            {/* Count */}
            <Box
              sx={(theme) => ({
                minWidth: 26,
                height: 24,

                px: 0.75,

                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',

                borderRadius: 1,

                bgcolor:
                  theme.palette.mode === 'dark'
                    ? alpha('#FFFFFF', 0.06)
                    : alpha('#000000', 0.035),

                color: 'text.secondary',

                fontSize: '0.7rem',
                fontWeight: 700,

                fontVariantNumeric: 'tabular-nums',
              })}
            >
              {widgetTypes.length}
            </Box>
          </Box>

          {/* =====================================================
              WIDGET LIST
             ===================================================== */}

          <Stack spacing={0.65}>
            {widgetTypes.map((widgetType) => {
              const Icon = WIDGET_TYPE_ICONS[widgetType];
              const label = WIDGET_TYPE_LABELS[widgetType];

              return (
                <ButtonBase
                  key={widgetType}
                  disabled={disabled}
                  onClick={() => onSelect(widgetType)}
                  sx={(theme) => ({
                    width: '100%',
                    minHeight: 48,

                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',

                    gap: 1,

                    px: 0.85,
                    py: 0.65,

                    borderRadius: 1.75,

                    border: '1px solid',

                    borderColor:
                      theme.palette.mode === 'dark'
                        ? alpha('#FFFFFF', 0.07)
                        : '#E7EBEE',

                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? alpha('#FFFFFF', 0.018)
                        : '#FAFBFC',

                    color: 'text.primary',

                    textAlign: 'start',

                    transition:
                      'background-color 140ms ease, border-color 140ms ease, transform 140ms ease',

                    '&:hover': {
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? alpha(theme.palette.primary.main, 0.08)
                          : alpha(theme.palette.primary.main, 0.045),

                      borderColor:
                        theme.palette.mode === 'dark'
                          ? alpha(theme.palette.primary.main, 0.28)
                          : alpha(theme.palette.primary.main, 0.2),

                      '& .widget-library-icon': {
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? alpha(theme.palette.primary.main, 0.16)
                            : alpha(theme.palette.primary.main, 0.1),

                        color: 'primary.main',
                      },

                      '& .widget-library-arrow': {
                        opacity: 1,
                        transform: 'translateX(-2px)',
                      },
                    },

                    '&:active': {
                      transform: 'scale(0.99)',
                    },

                    '&.Mui-disabled': {
                      opacity: 0.45,
                      cursor: 'not-allowed',
                    },
                  })}
                >
                  {/* Widget icon */}
                  <Box
                    className="widget-library-icon"
                    sx={(theme) => ({
                      width: 34,
                      height: 34,

                      flexShrink: 0,

                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',

                      borderRadius: 1.25,

                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? alpha('#FFFFFF', 0.055)
                          : '#F0F3F5',

                      color: 'text.secondary',

                      transition:
                        'background-color 140ms ease, color 140ms ease',
                    })}
                  >
                    <Icon fontSize="small" />
                  </Box>

                  {/* Label */}
                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      minWidth: 0,

                      fontWeight: 650,
                      lineHeight: 1.35,

                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </Typography>

                  {/* Add indicator */}
                  <Typography
                    className="widget-library-arrow"
                    component="span"
                    sx={{
                      flexShrink: 0,

                      color: 'primary.main',

                      fontSize: '1rem',
                      fontWeight: 700,

                      opacity: 0,

                      transform: 'translateX(0)',

                      transition:
                        'opacity 140ms ease, transform 140ms ease',
                    }}
                  >
                    +
                  </Typography>
                </ButtonBase>
              );
            })}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}