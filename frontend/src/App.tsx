import { AppProvider, useApp } from './AppContext';
import Navbar from './components/Navbar';
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
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnimalsPage from './pages/admin/AdminAnimalsPage';
import AdminMedicalRecordsPage from './pages/admin/AdminMedicalRecordsPage';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';
import AdminCompleteAdoptionPage from './pages/admin/AdminCompleteAdoptionPage';
import AdminAdoptionHistoryPage from './pages/admin/AdminAdoptionHistoryPage';

function Router() {
  const { currentPage, currentUser } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />;
      case 'login': return <LoginPage />;
      case 'register': return <RegisterPage />;
      case 'animals': return <AnimalsPage />;
      case 'animal-profile': return <AnimalProfilePage />;
      case 'apply':
        if (!currentUser) return <LoginPage />;
        return <ApplicationFormPage />;
      case 'my-applications':
        if (!currentUser) return <LoginPage />;
        return <MyApplicationsPage />;
      case 'schedule-appointment':
        if (!currentUser) return <LoginPage />;
        return <ScheduleAppointmentPage />;
      case 'my-appointments':
        if (!currentUser) return <LoginPage />;
        return <MyAppointmentsPage />;
      case 'my-adoption-history':
        if (!currentUser) return <LoginPage />;
        return <MyAdoptionHistoryPage />;
      case 'admin-dashboard':
        if (!currentUser || currentUser.role !== 'ADMIN') return <LoginPage />;
        return <AdminDashboard />;
      case 'admin-animals':
        if (!currentUser || currentUser.role !== 'ADMIN') return <LoginPage />;
        return <AdminAnimalsPage />;
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
