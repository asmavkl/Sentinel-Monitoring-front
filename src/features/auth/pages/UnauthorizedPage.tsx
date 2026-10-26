import { useEffect } from 'react';
import { Button, Stack } from '@mui/material';
import { redirectToLogin } from '@/auth/loginRedirect';
import { EmptyState } from '@/components/common';
import { env } from '@/utils/env';

export function UnauthorizedPage() {
  useEffect(() => {
    redirectToLogin();
  }, []);

  return (
    <Stack
      sx={{
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        bgcolor: 'background.default',
      }}
    >
      <EmptyState
        title="ورود لازم است"
        description="در حال انتقال به درگاه برای ورود."
        action={
          env.loginUrl ? (
            <Button variant="contained" href={env.loginUrl}>
              ورود به درگاه
            </Button>
          ) : null
        }
      />
    </Stack>
  );
}
