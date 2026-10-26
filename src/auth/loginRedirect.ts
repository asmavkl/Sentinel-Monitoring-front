import { env } from '@/utils/env';

let redirectInProgress = false;

export function resetLoginRedirectState(): void {
  redirectInProgress = false;
}

export function redirectToLogin(): void {
  if (redirectInProgress || !env.loginUrl) {
    return;
  }

  redirectInProgress = true;
  window.location.assign(env.loginUrl);
}
