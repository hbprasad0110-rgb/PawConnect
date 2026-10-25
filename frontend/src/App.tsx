import { AppProvider, useApp } from './ApiAppContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AnimalsPage from './pages/AnimalsPage';
import AnimalProfilePage from './pages/AnimalProfilePage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import ScheduleAppointmentPage from './pages/ScheduleAppointmentPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import MyAdoptionHistoryPage from './pages/MyAdoptionHistoryPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnimalsPage from './pages/admin/AdminAnimalsPage';
import AdminMedicalRecordsPage from './pages/admin/AdminMedicalRecordsPage';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';
import AdminCompleteAdoptionPage from './pages/admin/AdminCompleteAdoptionPage';
import AdminAdoptionHistoryPage from './pages/admin/AdminAdoptionHistoryPage';
import AdminAnimalEditPage from './pages/admin/AdminAnimalEditPage';

function Router() {
  const { currentPage, currentUser, appError, clearAppError, isLoading } = useApp();

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading PawConnect...</div>;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />;
      case 'login': return currentUser ? (currentUser.role === 'ADMIN' ? <AdminDashboard /> : <HomePage />) : <LoginPage />;
      case 'register': return currentUser ? (currentUser.role === 'ADMIN' ? <AdminDashboard /> : <HomePage />) : <RegisterPage />;
      case 'forgot-password': return currentUser ? (currentUser.role === 'ADMIN' ? <AdminDashboard /> : <HomePage />) : <ForgotPasswordPage />;
      case 'reset-password': return <ResetPasswordPage />;
      case 'animals': return <AnimalsPage />;
      case 'animal-profile': return <AnimalProfilePage />;
      case 'apply':
        if (!currentUser || currentUser.role !== 'ADOPTER') return <LoginPage />;
        return <ApplicationFormPage />;
      case 'my-applications':
        if (!currentUser || currentUser.role !== 'ADOPTER') return <LoginPage />;
        return <MyApplicationsPage />;
      case 'schedule-appointment':
        if (!currentUser || currentUser.role !== 'ADOPTER') return <LoginPage />;
        return <ScheduleAppointmentPage />;
      case 'my-appointments':
        if (!currentUser || currentUser.role !== 'ADOPTER') return <LoginPage />;
        return <MyAppointmentsPage />;
      case 'my-adoption-history':
        if (!currentUser || currentUser.role !== 'ADOPTER') return <LoginPage />;
        return <MyAdoptionHistoryPage />;
      case 'profile':
        if (!currentUser || currentUser.role !== 'ADOPTER') return <LoginPage />;
        return <ProfilePage />;
      case 'admin-dashboard':
        if (!currentUser || currentUser.role !== 'ADMIN') return <LoginPage />;
        return <AdminDashboard />;
      case 'admin-animals':
        if (!currentUser || currentUser.role !== 'ADMIN') return <LoginPage />;
        return <AdminAnimalsPage />;
      case 'admin-animal-edit':
        if (!currentUser || currentUser.role !== 'ADMIN') return <LoginPage />;
        return <AdminAnimalEditPage />;
      case 'admin-medical-records':
        if (!currentUser || currentUser.role !== 'ADMIN') return <LoginPage />;
        return <AdminMedicalRecordsPage />;
      case 'admin-applications':
        if (!currentUser || currentUser.role !== 'ADMIN') return <LoginPage />;
        return <AdminApplicationsPage />;
      case 'admin-appointments':
        if (!currentUser || currentUser.role !== 'ADMIN') return <LoginPage />;
        return <AdminAppointmentsPage />;
      case 'admin-complete-adoption':
        if (!currentUser || currentUser.role !== 'ADMIN') return <LoginPage />;
        return <AdminCompleteAdoptionPage />;
      case 'admin-adoption-history':
        if (!currentUser || currentUser.role !== 'ADMIN') return <LoginPage />;
        return <AdminAdoptionHistoryPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      {appError && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-red-700">{appError}</p>
          <button onClick={clearAppError} className="text-red-500 hover:text-red-700 font-bold" aria-label="Dismiss error">×</button>
        </div>
      )}
      <main>{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
