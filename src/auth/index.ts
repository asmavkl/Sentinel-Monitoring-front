export type { AuthTokenProvider, AuthTokenReader, AuthorizationHeaderHandler } from './types';
export {
  BrowserStorageTokenProvider,
  browserStorageTokenProvider,
} from './browserStorageTokenProvider';
export { JwtTokenReader, jwtTokenReader } from './jwtTokenReader';
export { normalizeJwtToken } from './normalizeJwtToken';
export {
  BearerAuthorizationHeaderHandler,
  authorizationHeaderHandler,
} from './authorizationHeaderHandler';
export { redirectToLogin, resetLoginRedirectState } from './loginRedirect';
export {
  capturePortalToken,
  persistPortalToken,
  persistPortalTokenFromPayload,
  extractPortalAuthToken,
  readCookie,
} from './capturePortalToken';
export {
  canEditDashboard,
  userHasDashboardWriteAccess,
  userHasCredentialWriteAccess,
  userHasMonitoringWriteAccess,
  getCurrentUserRoles,
  getEffectiveUserRoles,
  parseJwtPayload,
  DASHBOARD_WRITE_ROLE,
} from './currentUser';
export {
  getUserAvatarSrc,
  getUserDisplayName,
  getUserInitials,
  mapPortalCurrentUser,
  extractPortalUserPayload,
} from './portalUser';
export {
  isAdmin,
  isOperator,
  isViewer,
  canWriteSystem,
  canWriteMonitoring,
  canEditDashboard as canEditDashboardByRole,
} from './roleAccess';
