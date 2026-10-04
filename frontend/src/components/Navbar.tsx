import { useApp } from '../AppContext';

function PawIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor">
      <ellipse cx="8" cy="10" rx="3.2" ry="4" />
      <ellipse cx="14" cy="7" rx="3" ry="4" />
      <ellipse cx="20" cy="7" rx="3" ry="4" />
      <ellipse cx="26" cy="10" rx="3.2" ry="4" />
      <path d="M16 14c-5 0-9 3.5-9 8 0 3 1.5 5 4 5 1.5 0 3-1 5-1s3.5 1 5 1c2.5 0 4-2 4-5 0-4.5-4-8-9-8z" />
    </svg>
  );
}

export default function Navbar() {
  const { currentUser, navigate, logout } = useApp();

  const navLink = (label: string, page: Parameters<typeof navigate>[0]) => (
    <button
      key={label}
      onClick={() => navigate(page)}
      className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors duration-150 px-1"
    >
      {label}
    </button>
  );

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 group"
        >
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white group-hover:bg-blue-700 transition-colors">
            <PawIcon className="w-5 h-5" />
          </div>
          <span className="font-display font-900 text-xl text-slate-900">
            Paw<span className="text-blue-600">Connect</span>
          </span>
        </button>

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          {!currentUser && (
            <>
              {navLink('Browse Animals', 'animals')}
              <button
                onClick={() => navigate('login')}
                className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors duration-150 px-1"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('register')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-150"
              >
                Create Account
              </button>
            </>
          )}

          {currentUser?.role === 'ADOPTER' && (
            <>
              {navLink('Browse Animals', 'animals')}
              {navLink('My Applications', 'my-applications')}
              {navLink('My Appointments', 'my-appointments')}
              {navLink('Adoption History', 'my-adoption-history')}
              <div className="flex items-center gap-3 ml-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-700 font-bold text-sm">{currentUser.name[0]}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-slate-700 text-sm transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}

          {currentUser?.role === 'ADMIN' && (
            <>
              {navLink('Dashboard', 'admin-dashboard')}
              {navLink('Animals', 'admin-animals')}
              {navLink('Applications', 'admin-applications')}
              {navLink('Appointments', 'admin-appointments')}
              {navLink('Medical Records', 'admin-medical-records')}
              {navLink('Adoptions', 'admin-adoption-history')}
              <div className="flex items-center gap-3 ml-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-orange-700 font-bold text-sm">A</span>
                </div>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-slate-700 text-sm transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
