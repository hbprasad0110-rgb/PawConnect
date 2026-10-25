import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../ApiAppContext';
import { PAGE_PATHS, landingPath } from '../routes';
import type { UserRole } from '../types';

// Page-level guard. The API enforces the same rules, this only decides what the browser shows.
export default function RequireRole({ role, children }: { role: UserRole; children: ReactNode }) {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to={PAGE_PATHS.login} replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  if (currentUser.role !== role) {
    return <Navigate to={landingPath(currentUser)} replace />;
  }
  return <>{children}</>;
}
