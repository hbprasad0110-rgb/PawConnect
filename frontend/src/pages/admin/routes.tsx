import type { ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';
import RequireRole from '../../components/RequireRole';
import { PAGE_PATHS } from '../../routes';
import AdminDashboard from './AdminDashboard';
import AdminAnimalsPage from './AdminAnimalsPage';
import AdminAnimalEditPage from './AdminAnimalEditPage';
import AdminMedicalRecordsPage from './AdminMedicalRecordsPage';
import AdminApplicationsPage from './AdminApplicationsPage';
import AdminAppointmentsPage from './AdminAppointmentsPage';
import AdminCompleteAdoptionPage from './AdminCompleteAdoptionPage';
import AdminAdoptionHistoryPage from './AdminAdoptionHistoryPage';

const adminOnly = (element: ReactNode) => <RequireRole role="ADMIN">{element}</RequireRole>;

// Admin screens register themselves here. Every one of them needs the admin role.
export const adminRoutes: RouteObject[] = [
  { path: PAGE_PATHS['admin-dashboard'], element: adminOnly(<AdminDashboard />) },
  { path: PAGE_PATHS['admin-animals'], element: adminOnly(<AdminAnimalsPage />) },
  { path: PAGE_PATHS['admin-animal-edit'], element: adminOnly(<AdminAnimalEditPage />) },
  { path: PAGE_PATHS['admin-medical-records'], element: adminOnly(<AdminMedicalRecordsPage />) },
  { path: PAGE_PATHS['admin-applications'], element: adminOnly(<AdminApplicationsPage />) },
  { path: PAGE_PATHS['admin-appointments'], element: adminOnly(<AdminAppointmentsPage />) },
  { path: PAGE_PATHS['admin-complete-adoption'], element: adminOnly(<AdminCompleteAdoptionPage />) },
  { path: PAGE_PATHS['admin-adoption-history'], element: adminOnly(<AdminAdoptionHistoryPage />) },
];
