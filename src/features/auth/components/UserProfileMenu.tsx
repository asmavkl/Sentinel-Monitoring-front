import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Popover,
  Stack,
  Typography,
} from '@mui/material';
import { useState, type MouseEvent, type ReactNode } from 'react';
import { getUserAvatarSrc, getUserDisplayName, getUserInitials } from '@/auth/portalUser';
import type { CurrentUser } from '@/types/portal';
import { env } from '@/utils/env';

interface UserProfileMenuProps {
  user: CurrentUser;
}

export function UserProfileMenu({ user }: UserProfileMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const displayName = getUserDisplayName(user) ?? 'کاربر';
  const avatarSrc = getUserAvatarSrc(user.avatar);
  const initials = getUserInitials(user);
  const open = Boolean(anchorEl);

  const openMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const confirmLogout = () => {
    if (!env.loginUrl) {
      return;
    }

    window.location.assign(env.loginUrl);
  };

  return (
    <>
      <Button
        size="small"
        onClick={openMenu}
        aria-label="پروفایل کاربر"
        aria-haspopup="dialog"
        aria-expanded={open}
        data-testid="current-user-profile"
        sx={{
          minWidth: 0,
          px: 0.5,
          py: 0.25,
          gap: 0.75,
          borderRadius: 0.5,
          color: 'text.primary',
          textTransform: 'none',
          bgcolor: 'action.hover',
          '&:hover': {
            bgcolor: 'action.selected',
          },
        }}
      >
        <ProfileAvatar src={avatarSrc} initials={initials} name={displayName} size={26} />
        <Typography
          component="span"
          noWrap
          data-testid="current-user-name"
          sx={{
            maxWidth: 140,
            fontSize: '0.75rem',
            fontWeight: 600,
            lineHeight: 1.2,
            display: { xs: 'none', sm: 'block' },
          }}
        >
          {displayName}
        </Typography>
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 0.75,
              width: 300,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 0.5,
            },
          },
        }}
      >
        <Stack data-testid="user-profile-panel" sx={{ p: 1.5, gap: 1.25 }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
            <ProfileAvatar src={avatarSrc} initials={initials} name={displayName} size={52} />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.3 }} noWrap>
                {displayName}
              </Typography>
              {user.userName ? (
                <Typography
                  color="text.secondary"
                  sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}
                  noWrap
                >
                  {user.userName}
                </Typography>
              ) : null}
            </Box>
          </Stack>

          {user.roles.length > 0 ? (
            <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {user.roles.map((role) => (
                <Chip
                  key={role}
                  size="small"
                  label={role}
                  sx={{ height: 22, fontSize: '0.7rem' }}
                />
              ))}
            </Stack>
          ) : null}

          {user.email || user.mobile ? (
            <Stack spacing={0.75}>
              {user.email ? (
                <ProfileRow
                  icon={<MailOutlinedIcon sx={{ fontSize: 16 }} />}
                  label="ایمیل"
                  value={user.email}
                />
              ) : null}
              {user.mobile ? (
                <ProfileRow
                  icon={<PhoneOutlinedIcon sx={{ fontSize: 16 }} />}
                  label="موبایل"
                  value={user.mobile}
                />
              ) : null}
            </Stack>
          ) : null}

          <Divider />

          <Stack spacing={0.75}>
            {env.portalUrl ? (
              <Button
                size="small"
                variant="outlined"
                href={env.portalUrl}
                startIcon={<HomeOutlinedIcon />}
                sx={{ justifyContent: 'flex-start' }}
              >
                بازگشت به درگاه
              </Button>
            ) : null}
            <Button
              size="small"
              color="error"
              variant="text"
              startIcon={<LogoutOutlinedIcon />}
              onClick={() => {
                closeMenu();
                setLogoutOpen(true);
              }}
              sx={{ justifyContent: 'flex-start' }}
            >
              خروج از حساب
            </Button>
          </Stack>
        </Stack>
      </Popover>

      <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)}>
        <DialogTitle>خروج از حساب کاربری</DialogTitle>
        <DialogContent>
          <DialogContentText>آیا از حساب کاربری خود می‌خواهید خارج شوید؟</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutOpen(false)}>انصراف</Button>
          <Button color="error" variant="contained" onClick={confirmLogout}>
            خروج از حساب
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function ProfileAvatar({
  src,
  initials,
  name,
  size,
}: {
  src: string | null;
  initials: string;
  name: string;
  size: number;
}) {
  return (
    <Avatar
      src={src ?? undefined}
      alt={name}
      sx={{
        width: size,
        height: size,
        fontSize: size > 32 ? '1rem' : '0.7rem',
        fontWeight: 700,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
      }}
    >
      {initials}
    </Avatar>
  );
}

function ProfileRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
      <Box sx={{ color: 'text.secondary', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography color="text.secondary" sx={{ fontSize: '0.68rem', lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', lineHeight: 1.3 }} noWrap>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}
