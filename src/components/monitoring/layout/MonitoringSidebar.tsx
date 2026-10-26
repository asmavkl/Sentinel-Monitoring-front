import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { forwardRef } from 'react';
import { NavLink, useLocation, type NavLinkProps } from 'react-router-dom';
import {
  isMonitoringNavItemActive,
  useMonitoringNavSections,
  type MonitoringNavItem,
} from './monitoringNav.tsx';
import { layout } from '@/theme/spacing';
import { useUiStore } from '@/store/uiStore';

const SidebarNavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  function SidebarNavLink(props, ref) {
    return <NavLink ref={ref} {...props} />;
  },
);

export function MonitoringSidebar() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const location = useLocation();
  const width = sidebarOpen
    ? layout.sidebarWidth
    : layout.sidebarCollapsedWidth;
  const navSections = useMonitoringNavSections();

  return (
    <Box
      component="aside"
      dir="rtl"
      data-testid="monitoring-sidebar"
      data-sidebar-side="right"
      sx={(theme) => ({
        width,
        flexShrink: 0,
        alignSelf: 'stretch',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        bgcolor:
          theme.palette.mode === 'dark'
            ? '#111827'
            : '#FAFBFC',
        borderInlineEnd: '1px solid',
        borderColor:
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.common.white, 0.08)
            : '#E8EDF2',

        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.easeInOut,
          duration: theme.transitions.duration.short,
        }),
      })}
    >
      <Box
        component="nav"
        aria-label="منوی پایش"
        sx={{
          height: '100%',
          py: 1.5,
          px: sidebarOpen ? 1 : 0.75,
        }}
      >
        {navSections.map((section, sectionIndex) => (
          <Box
            key={section.id}
            sx={{
              mb:
                sectionIndex === navSections.length - 1
                  ? 0
                  : 2,
            }}
          >
            {sidebarOpen && section.label ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 1,
                  mb: 0.75,
                }}
              >
                <Typography
                  sx={(theme) => ({
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    color:
                      theme.palette.mode === 'dark'
                        ? '#7F8A99'
                        : '#8995A3',
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                  })}
                >
                  {section.label}
                </Typography>

                <Box
                  sx={(theme) => ({
                    flex: 1,
                    height: 1,
                    ml: 1,
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.common.white, 0.07)
                        : '#E7EBEF',
                  })}
                />
              </Box>
            ) : null}

            <List disablePadding>
              {section.items.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  pathname={location.pathname}
                  sidebarOpen={sidebarOpen}
                />
              ))}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function NavItem({
  item,
  pathname,
  sidebarOpen,
}: {
  item: MonitoringNavItem;
  pathname: string;
  sidebarOpen: boolean;
}) {
  const active = isMonitoringNavItemActive(item, pathname);

  const button = (
    <ListItemButton
      component={SidebarNavLink}
      to={item.path}
      selected={active}
      aria-current={active ? 'page' : undefined}
      aria-label={item.ariaLabel ?? item.label}
      sx={(theme) => {
        const isDark = theme.palette.mode === 'dark';

        return {
          position: 'relative',
          minHeight: 44,
          mb: 0.6,
          px: sidebarOpen ? 0.75 : 0.5,
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          gap: sidebarOpen ? 0.75 : 0,

          borderRadius: 1.75,

          color: active
            ? theme.palette.primary.main
            : isDark
              ? '#A8B2BF'
              : '#66727F',

          transition: theme.transitions.create(
            ['background-color', 'color', 'transform'],
            {
              duration: 160,
            },
          ),

          '&:hover': {
            bgcolor: isDark
              ? alpha(theme.palette.primary.main, 0.08)
              : alpha(theme.palette.primary.main, 0.055),
            color: isDark
              ? '#E7ECF2'
              : '#263238',
          },

          '&:active': {
            transform: 'scale(0.985)',
          },

          '&.Mui-selected': {
            bgcolor: isDark
              ? alpha(theme.palette.primary.main, 0.16)
              : alpha(theme.palette.primary.main, 0.10),

            color: isDark
              ? '#70D0C6'
              : theme.palette.primary.dark,

            '&:hover': {
              bgcolor: isDark
                ? alpha(theme.palette.primary.main, 0.20)
                : alpha(theme.palette.primary.main, 0.14),
            },

            '&::before': {
              content: '""',
              position: 'absolute',
              right: 3,
              top: 8,
              bottom: 8,
              width: 3,
              borderRadius: 3,
              bgcolor: isDark
                ? '#70D0C6'
                : theme.palette.primary.main,
            },

            '& .nav-icon-container': {
              bgcolor: isDark
                ? alpha(theme.palette.primary.main, 0.20)
                : alpha(theme.palette.primary.main, 0.13),

              color: isDark
                ? '#70D0C6'
                : theme.palette.primary.main,
            },
          },

          '&:focus-visible': {
            outline: `2px solid ${alpha(
              theme.palette.primary.main,
              0.45,
            )}`,
            outlineOffset: 2,
          },
        };
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: sidebarOpen ? 36 : 0,
          width: sidebarOpen ? 36 : 38,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: 'inherit',
        }}
      >
        <Box
          className="nav-icon-container"
          sx={{
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1.5,
            color: 'inherit',
            transition:
              'background-color 160ms ease, color 160ms ease, transform 160ms ease',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& svg': {
                fontSize: 20,
              },
            }}
          >
            {item.icon}
          </Box>
        </Box>
      </ListItemIcon>

      {sidebarOpen && (
        <ListItemText
          primary={item.label}
          sx={{
            minWidth: 0,
            m: 0,
          }}
          slotProps={{
            primary: {
              sx: {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '0.82rem',
                lineHeight: 1.4,
                fontWeight: active ? 700 : 550,
              },
            },
          }}
        />
      )}
    </ListItemButton>
  );

  if (!sidebarOpen) {
    return (
      <Tooltip
        title={item.label}
        placement="left"
        arrow
        slotProps={{
          tooltip: {
            sx: {
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 1,
            },
          },
        }}
      >
        <Box>{button}</Box>
      </Tooltip>
    );
  }

  return button;
}