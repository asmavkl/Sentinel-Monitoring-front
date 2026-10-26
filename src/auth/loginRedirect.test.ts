import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { redirectToLogin, resetLoginRedirectState } from './loginRedirect';
import { env } from '@/utils/env';

describe('redirectToLogin', () => {
  beforeEach(() => {
    resetLoginRedirectState();
  });

  afterEach(() => {
    resetLoginRedirectState();
    vi.unstubAllGlobals();
  });

  it('assigns the GIS login URL', () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { assign });

    redirectToLogin();

    expect(assign).toHaveBeenCalledWith(env.loginUrl);
  });

  it('does not redirect twice while already in progress', () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { assign });

    redirectToLogin();
    redirectToLogin();

    expect(assign).toHaveBeenCalledOnce();
  });
});
