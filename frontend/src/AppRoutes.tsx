import { useRef } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation, useRoutes } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { useApp } from './ApiAppContext';
import RequireRole from './components/RequireRole';
import { PAGE_PATHS, landingPath } from './routes';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AnimalsPage from './pages/AnimalsPage';
import AnimalProfilePage from './pages/AnimalProfilePage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import ScheduleAppointmentPage from './pages/ScheduleAppointmentPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import MyAdoptionHistoryPage from './pages/MyAdoptionHistoryPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import { adminRoutes } from './pages/admin/routes';

// A signed-in user has no use for the login page: send them where they were headed, or to their home.
function LoginRoute() {
  const { currentUser } = useApp();
  const location = useLocation();
  if (!currentUser) return <LoginPage />;
  const from = (location.state as { from?: string } | null)?.from;
  return <Navigate to={from && from !== PAGE_PATHS.login ? from : landingPath(currentUser)} replace />;
}

// Same for registration, except someone who just created their account stays to see the confirmation.
function RegisterRoute() {
  const { currentUser } = useApp();
  const wasSignedIn = useRef(Boolean(currentUser));
  if (wasSignedIn.current && currentUser) return <Navigate to={landingPath(currentUser)} replace />;
  return <RegisterPage />;
}

const adopterOnly = (element: ReactNode) => <RequireRole role="ADOPTER">{element}</RequireRole>;

const routes: RouteObject[] = [
  { path: PAGE_PATHS.home, element: <HomePage /> },
  { path: PAGE_PATHS.animals, element: <AnimalsPage /> },
  { path: PAGE_PATHS['animal-profile'], element: <AnimalProfilePage /> },
  { path: PAGE_PATHS.login, element: <LoginRoute /> },
  { path: PAGE_PATHS.register, element: <RegisterRoute /> },
  { path: PAGE_PATHS.apply, element: adopterOnly(<ApplicationFormPage />) },
  { path: PAGE_PATHS['my-applications'], element: adopterOnly(<MyApplicationsPage />) },
  { path: PAGE_PATHS['schedule-appointment'], element: adopterOnly(<ScheduleAppointmentPage />) },
  { path: PAGE_PATHS['my-appointments'], element: adopterOnly(<MyAppointmentsPage />) },
  { path: PAGE_PATHS['my-adoption-history'], element: adopterOnly(<MyAdoptionHistoryPage />) },
  { path: PAGE_PATHS.profile, element: adopterOnly(<ProfilePage />) },
  ...adminRoutes,
  { path: '*', element: <NotFoundPage /> },
];

export default function AppRoutes() {
  return useRoutes(routes);
}
