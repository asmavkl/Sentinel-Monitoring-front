export interface PortalCurrentUserDto {
  id?: string | number | null;
  Id?: string | number | null;
  userId?: string | number | null;
  UserId?: string | number | null;
  userName?: string | null;
  UserName?: string | null;
  username?: string | null;
  fullName?: string | null;
  FullName?: string | null;
  displayName?: string | null;
  DisplayName?: string | null;
  firstName?: string | null;
  FirstName?: string | null;
  lastName?: string | null;
  LastName?: string | null;
  email?: string | null;
  Email?: string | null;
  mobile?: string | null;
  Mobile?: string | null;
  phoneNumber?: string | null;
  roles?: string[] | string | Array<Record<string, unknown>> | null;
  Roles?: string[] | string | Array<Record<string, unknown>> | null;
  role?: string | null;
  Role?: string | null;
  userRoles?: string[] | Array<Record<string, unknown>> | null;
  UserRoles?: string[] | Array<Record<string, unknown>> | null;
  avatarBase64?: string | null;
  AvatarBase64?: string | null;
  avatar?: string | null;
  Avatar?: string | null;
  profileImage?: string | null;
  ProfileImage?: string | null;
}

export interface CurrentUser {
  id: string | number | null;
  userName: string | null;
  fullName: string | null;
  email: string | null;
  mobile: string | null;
  roles: string[];
  /** Raw profile image from GetCurrentUser (`avatarBase64` or a URL). */
  avatar: string | null;
  /** User role from /api/auth/roles (Admin, Operator, Viewer) */
  role: string | null;
}
