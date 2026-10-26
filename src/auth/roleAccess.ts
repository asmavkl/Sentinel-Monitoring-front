export function isAdmin(role: string | null): boolean {
  return role === 'Admin';
}

export function isOperator(role: string | null): boolean {
  return role === 'Operator';
}

export function isViewer(role: string | null): boolean {
  return role === 'Viewer';
}

export function canWriteSystem(role: string | null): boolean {
  return isAdmin(role);
}

export function canWriteMonitoring(role: string | null): boolean {
  return isAdmin(role);
}

export function canEditDashboard(role: string | null): boolean {
  return isAdmin(role) || isOperator(role);
}
