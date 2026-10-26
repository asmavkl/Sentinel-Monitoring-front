// import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
// import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
// import MenuIcon from '@mui/icons-material/Menu';
// import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
// import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
// import {
//   AppBar,
//   Box,
//   CircularProgress,
//   IconButton,
//   Stack,
//   Toolbar,
//   Tooltip,
//   Typography,
// } from '@mui/material';

// import { useLocation } from 'react-router-dom';
// import { MonitoringSummaryBar } from './MonitoringSummaryBar';
// import { getMonitoringSectionTitle } from './monitoringNav.tsx';
// import { getUserDisplayName } from '@/auth/portalUser';
// import { useApplicationHealthSummary } from '@/features/applications/hooks/useApplicationHealthSummary';
// import { useServerHealthSummary } from '@/features/server-monitoring/hooks/useMonitoredServers';
// import { UserProfileMenu } from '@/features/auth/components/UserProfileMenu';
// import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
// import { useUiStore } from '@/store/uiStore';
// import { layout } from '@/theme/spacing';

// const headerActionSx = {
//   color: 'text.secondary',
//   borderRadius: 0.5,
//   '&:hover': {
//     bgcolor: 'action.hover',
//     color: 'text.primary',
//   },
// } as const;

// export function MonitoringHeader() {
//   const location = useLocation();
//   const toggleSidebar = useUiStore((state) => state.toggleSidebar);
//   const colorMode = useUiStore((state) => state.colorMode);
//   const toggleColorMode = useUiStore((state) => state.toggleColorMode);
//   const { data: currentUser } = useCurrentUser();
//   const displayName = getUserDisplayName(currentUser);
//   const applicationSummary = useApplicationHealthSummary();
//   const serverSummary = useServerHealthSummary();
//   const sectionTitle = getMonitoringSectionTitle(location.pathname);

//   const combinedSummary = {
//     up: applicationSummary.up + serverSummary.up,
//     warning: applicationSummary.warning + serverSummary.warning,
//     down: applicationSummary.down + serverSummary.down,
//     outOfService: applicationSummary.outOfService + serverSummary.outOfService,
//     unknown: applicationSummary.unknown + serverSummary.unknown,
//     isFetching: applicationSummary.isFetching || serverSummary.isFetching,
//     refetch: () => {
//       void applicationSummary.refetch();
//       void serverSummary.refetch();
//     },
//   };

//   return (
//     <AppBar
//       position="sticky"
//       color="inherit"
//       elevation={0}
//       data-testid="monitoring-header"
//       sx={{
//         bgcolor: 'background.paper',
//         color: 'text.primary',
//         borderBottom: '1px solid',
//         borderColor: 'divider',
//         zIndex: (theme) => theme.zIndex.drawer + 1,
//       }}
//     >
//       <Toolbar
//         variant="dense"
//         sx={{
//           minHeight: layout.headerHeight,
//           gap: 1.25,
//           px: 1.5,
//         }}
//       >
//         <Stack
//           direction="row"
//           spacing={1}
//           sx={{ alignItems: 'center', minWidth: 0, flexShrink: 0 }}
//         >
//           <IconButton
//             edge="start"
//             size="small"
//             onClick={toggleSidebar}
//             aria-label="باز و بسته کردن منو"
//             sx={headerActionSx}
//           >
//             <MenuIcon fontSize="small" />
//           </IconButton>
//           <Box
//             aria-hidden
//             sx={{
//               width: 28,
//               height: 28,
//               display: { xs: 'none', sm: 'grid' },
//               placeItems: 'center',
//               flexShrink: 0,
//               borderRadius: 0.5,
//               bgcolor: 'primary.main',
//               color: 'primary.contrastText',
//             }}
//           >
//             <MonitorHeartOutlinedIcon sx={{ fontSize: 18 }} />
//           </Box>
//           <Box sx={{ minWidth: 0 }}>
//             <Typography
//               component="p"
//               sx={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap' }}
//             >
//               Sentinel Monitoring
//             </Typography>
//             <Typography
//               component="p"
//               color="text.secondary"
//               sx={{
//                 fontSize: '0.68rem',
//                 lineHeight: 1.2,
//                 whiteSpace: 'nowrap',
//               }}
//             >
//               مرکز پایش سامانه های سازمان
//             </Typography>
//           </Box>
//           <Typography
//             component="h1"
//             sx={{
//               fontSize: '0.8125rem',
//               fontWeight: 700,
//               whiteSpace: 'nowrap',
//               display: { xs: 'none', md: 'block' },
//             }}
//           >
//             {sectionTitle}
//           </Typography>
//         </Stack>

//         <Box
//           sx={{
//             flex: 1,
//             display: { xs: 'none', md: 'flex' },
//             justifyContent: 'center',
//             minWidth: 0,
//           }}
//         >
//           <Box
//             sx={{
//               px: 1.25,
//               py: 0.4,
//               borderRadius: 0.5,
//               bgcolor: 'action.hover',
//             }}
//           >
//             <MonitoringSummaryBar
//               compact

//               up={combinedSummary.up}
//               warning={combinedSummary.warning}
//               down={combinedSummary.down}
//               outOfService={combinedSummary.outOfService}
//               unknown={combinedSummary.unknown}
//             />
//           </Box>
//         </Box>

//         <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
//           <Tooltip
//             title={
//               combinedSummary.isFetching
//                 ? 'در حال بروزرسانی'
//                 : 'بروزرسانی وضعیت سامانه ها'
//             }
//           >
//             <span>
//               <IconButton
//                 size="small"
//                 onClick={() => {
//                   void combinedSummary.refetch();
//                 }}
//                 disabled={combinedSummary.isFetching}
//                 aria-label="بروزرسانی وضعیت سامانه ها"
//                 sx={headerActionSx}
//               >
//                 {combinedSummary.isFetching ? (
//                   <CircularProgress size={16} color="inherit" />
//                 ) : (
//                   <SyncOutlinedIcon fontSize="small" />
//                 )}
//               </IconButton>
//             </span>
//           </Tooltip>
//           {displayName && currentUser ? <UserProfileMenu user={currentUser} /> : null}
//           <Tooltip title={colorMode === 'light' ? 'حالت تاریک' : 'حالت روشن'}>
//             <IconButton
//               size="small"
//               onClick={toggleColorMode}
//               aria-label="تغییر حالت نمایش"
//               sx={headerActionSx}
//             >
//               {colorMode === 'light' ? (
//                 <DarkModeOutlinedIcon fontSize="small" />
//               ) : (
//                 <LightModeOutlinedIcon fontSize="small" />
//               )}
//             </IconButton>
//           </Tooltip>
//         </Stack>
//       </Toolbar>
//     </AppBar>
//   );
// }
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import {
  AppBar,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';

import { useLocation } from 'react-router-dom';
import { MonitoringSummaryBar } from './MonitoringSummaryBar';
import { getMonitoringSectionTitle } from './monitoringNav.tsx';
import { getUserDisplayName } from '@/auth/portalUser';
import { useApplicationHealthSummary } from '@/features/applications/hooks/useApplicationHealthSummary';
import { useServerHealthSummary } from '@/features/server-monitoring/hooks/useMonitoredServers';
import { UserProfileMenu } from '@/features/auth/components/UserProfileMenu';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useUiStore } from '@/store/uiStore';
import { layout } from '@/theme/spacing';

const headerActionSx = {
  width: 36,
  height: 36,
  color: 'text.secondary',
  borderRadius: 1.5,

  '&:hover': {
    bgcolor: 'action.hover',
    color: 'text.primary',
  },

  '&.Mui-disabled': {
    color: 'text.disabled',
  },
} as const;

export function MonitoringHeader() {
  const location = useLocation();

  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const colorMode = useUiStore((state) => state.colorMode);
  const toggleColorMode = useUiStore((state) => state.toggleColorMode);

  const { data: currentUser } = useCurrentUser();
  const displayName = getUserDisplayName(currentUser);

  const applicationSummary = useApplicationHealthSummary();
  const serverSummary = useServerHealthSummary();

  const sectionTitle = getMonitoringSectionTitle(location.pathname);

  const combinedSummary = {
    up: applicationSummary.up + serverSummary.up,
    warning: applicationSummary.warning + serverSummary.warning,
    down: applicationSummary.down + serverSummary.down,
    outOfService:
      applicationSummary.outOfService + serverSummary.outOfService,
    unknown: applicationSummary.unknown + serverSummary.unknown,

    isFetching:
      applicationSummary.isFetching ||
      serverSummary.isFetching,

    refetch: () => {
      void applicationSummary.refetch();
      void serverSummary.refetch();
    },
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      data-testid="monitoring-header"
      sx={(theme) => ({
        bgcolor:
          theme.palette.mode === 'dark'
            ? '#171C23'
            : '#FFFFFF',

        color: 'text.primary',

        borderBottom: '1px solid',
        borderColor:
          theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.08)'
            : '#E5E9ED',

        boxShadow: 'none',

        zIndex: (theme) => theme.zIndex.drawer + 1,
      })}
    >
      <Toolbar
        sx={{
          minHeight: layout.headerHeight,
          px: { xs: 1, sm: 1.5, lg: 2 },
          gap: { xs: 0.75, sm: 1.25 },
        }}
      >
        {/* ───────────────── Brand / Navigation ───────────────── */}
        <Stack
          direction="row"
          spacing={{ xs: 0.75, sm: 1 }}
          sx={{
            alignItems: 'center',
            minWidth: 0,
            flexShrink: 0,
          }}
        >
          <Tooltip title="باز و بسته کردن منو">
            <IconButton
              size="small"
              onClick={toggleSidebar}
              aria-label="باز و بسته کردن منو"
              sx={headerActionSx}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Brand Icon */}
          <Box
            aria-hidden
            sx={(theme) => ({
              width: 32,
              height: 32,
              display: { xs: 'none', sm: 'grid' },
              placeItems: 'center',
              flexShrink: 0,
              borderRadius: 1.5,

              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(95,189,181,0.16)'
                  : '#E8F5F3',

              color: 'primary.main',
            })}
          >
            <MonitorHeartOutlinedIcon sx={{ fontSize: 19 }} />
          </Box>

          {/* Brand */}
          <Box
            sx={{
              minWidth: 0,
              display: { xs: 'none', md: 'block' },
            }}
          >
            <Typography
              component="p"
              sx={{
                fontSize: '0.86rem',
                fontWeight: 750,
                lineHeight: 1.25,
                whiteSpace: 'nowrap',
                letterSpacing: '-0.01em',
              }}
            >
              Sentinel Monitoring
            </Typography>

            <Typography
              component="p"
              sx={{
                mt: 0.15,
                fontSize: '0.64rem',
                lineHeight: 1.2,
                color: 'text.secondary',
                whiteSpace: 'nowrap',
              }}
            >
              مرکز پایش سامانه‌های سازمان
            </Typography>
          </Box>

          {/* Section */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              height: 24,
              alignSelf: 'center',
              mx: { xs: 0.25, md: 0.5 },
            }}
          />

          <Typography
            component="h1"
            sx={{
              minWidth: 0,
              maxWidth: { xs: 120, sm: 180, md: 220 },
              fontSize: { xs: '0.76rem', sm: '0.82rem' },
              fontWeight: 700,
              color: 'text.primary',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {sectionTitle}
          </Typography>
        </Stack>

        {/* ───────────────── Health Summary ───────────────── */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: { xs: 'none', lg: 'flex' },
            justifyContent: 'center',
            px: 1,
          }}
        >
          <Box
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              minWidth: 0,
              px: 0.5,
              py: 0.25,

              borderRadius: 2,

              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.035)'
                  : '#F6F8F9',

              border: '1px solid',
              borderColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.06)'
                  : '#EDF0F2',
            })}
          >
            <MonitoringSummaryBar
              compact
              up={combinedSummary.up}
              warning={combinedSummary.warning}
              down={combinedSummary.down}
              outOfService={combinedSummary.outOfService}
              unknown={combinedSummary.unknown}
            />
          </Box>
        </Box>

        {/* ───────────────── Actions ───────────────── */}
        <Stack
          direction="row"
          spacing={0.25}
          sx={{
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          {/* Refresh */}
          <Tooltip
            title={
              combinedSummary.isFetching
                ? 'در حال بروزرسانی وضعیت...'
                : 'بروزرسانی وضعیت سامانه‌ها'
            }
          >
            <span>
              <IconButton
                size="small"
                onClick={() => {
                  void combinedSummary.refetch();
                }}
                disabled={combinedSummary.isFetching}
                aria-label="بروزرسانی وضعیت سامانه‌ها"
                sx={headerActionSx}
              >
                {combinedSummary.isFetching ? (
                  <CircularProgress size={17} color="inherit" />
                ) : (
                  <SyncOutlinedIcon fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>

          {/* User */}
          {displayName && currentUser ? (
            <>
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  height: 24,
                  alignSelf: 'center',
                  mx: 0.5,
                }}
              />

              <UserProfileMenu user={currentUser} />
            </>
          ) : null}

          {/* Theme */}
          <Tooltip
            title={
              colorMode === 'light'
                ? 'فعال کردن حالت تاریک'
                : 'فعال کردن حالت روشن'
            }
          >
            <IconButton
              size="small"
              onClick={toggleColorMode}
              aria-label="تغییر حالت نمایش"
              sx={headerActionSx}
            >
              {colorMode === 'light' ? (
                <DarkModeOutlinedIcon fontSize="small" />
              ) : (
                <LightModeOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}