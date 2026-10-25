import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './ApiAppContext';
import AppRoutes from './AppRoutes';
import Navbar from './components/Navbar';

// Every route change starts at the top of the page, like a normal page load.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);
  return null;
}

function Router() {
  const { appError, clearAppError, isLoading } = useApp();

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading PawConnect...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ScrollToTop />
      <Navbar />
      {appError && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-red-700">{appError}</p>
          <button onClick={clearAppError} className="text-red-500 hover:text-red-700 font-bold" aria-label="Dismiss error">×</button>
        </div>
      )}
      <main><AppRoutes /></main>
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
