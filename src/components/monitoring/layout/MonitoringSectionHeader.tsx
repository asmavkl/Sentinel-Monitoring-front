import { Box, Typography, useTheme } from '@mui/material';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';

export type MonitoringSectionColor = 'blue' | 'purple' | 'gray';

const SECTION_COLORS: Record<
  MonitoringSectionColor,
  {
    main: string;
    light: string;
    dark: string;
  }
> = {
  blue: {
    main: '#3F978E',
    light: '#E5F3F1',
    dark: '#63C7BD',
  },
  purple: {
    main: '#8F65B8',
    light: '#F1EAF6',
    dark: '#B98DE0',
  },
  gray: {
    main: '#64748B',
    light: '#EEF2F5',
    dark: '#A6B4C3',
  },
};

interface MonitoringSectionHeaderProps {
  title: string;
  color?: MonitoringSectionColor;
  count?: number;
}

export function MonitoringSectionHeader({
  title,
  color = 'blue',
  count,
}: MonitoringSectionHeaderProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const sectionColor = SECTION_COLORS[color];

  return (
    <Box
      data-testid="monitoring-section-header"
      data-section-color={color}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 60,
        px: 2,
        py: 1.25,
        overflow: 'hidden',

        background: isDark
          ? `linear-gradient(
              270deg,
              ${sectionColor.dark} 0%,
              ${sectionColor.dark}55 12%,
              #20262E 38%,
              #20262E 100%
            )`
          : `linear-gradient(
              270deg,
              ${sectionColor.light} 0%,
              ${sectionColor.light}99 18%,
              #F7F9FA 48%,
              #FFFFFF 100%
            )`,

        border: `1px solid ${isDark ? `${sectionColor.dark}35` : `${sectionColor.main}25`
          }`,

        borderRadius: 2,

        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: isDark
            ? sectionColor.dark
            : sectionColor.main,
          borderRadius: '8px 0 0 8px',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1.5,
            bgcolor: isDark ? '#29313A' : '#FFFFFF',
            color: isDark ? sectionColor.dark : sectionColor.main,
            border: `1px solid ${isDark ? '#3A444F' : '#E3E8EC'
              }`,
          }}
        >
          <InsightsOutlinedIcon sx={{ fontSize: 20 }} />
        </Box>

        <Typography
          component="h2"
          sx={{
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: isDark ? '#F1F5F9' : '#263238',
          }}
        >
          {title}
        </Typography>

        {count !== undefined && (
          <Box
            sx={{
              minWidth: 28,
              height: 24,
              px: 0.75,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1.5,
              bgcolor: isDark ? '#29313A' : '#FFFFFF',
              color: isDark ? sectionColor.dark : sectionColor.main,
              border: `1px solid ${isDark ? '#3A444F' : '#E3E8EC'
                }`,
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {count}
          </Box>
        )}
      </Box>

      <Typography
        sx={{
          display: { xs: 'none', sm: 'block' },
          ml: 2,
          flexShrink: 0,
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: isDark ? '#7D8996' : '#94A3B8',
          userSelect: 'none',
        }}
      >
      </Typography>
    </Box>
  );
}