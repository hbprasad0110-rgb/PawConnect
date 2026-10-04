import { useApp } from '../../AppContext';

export default function AdminDashboard() {
  const { animals, applications, appointments, adoptionHistory, navigate } = useApp();

  const available = animals.filter(a => a.status === 'AVAILABLE').length;
  const pending = applications.filter(a => a.status === 'PENDING').length;
  const approved = applications.filter(a => a.status === 'APPROVED').length;
  const scheduled = appointments.filter(a => a.status === 'SCHEDULED').length;
  const totalAdopted = adoptionHistory.length;

  const StatCard = ({ label, value, color, icon, onClick }: {
    label: string; value: number; color: string; icon: React.ReactNode; onClick?: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-left hover:shadow-md hover:border-blue-100 transition-all duration-200 ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{label}</p>
          <p className={`font-display font-900 text-4xl ${color}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('-700', '-100').replace('-600', '-100')}`}>
          {icon}
        </div>
      </div>
    </button>
  );

  const recentApps = applications.filter(a => a.status === 'PENDING').slice(0, 5);

  return (
    <div className="fade-in min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Admin Panel</p>
              <h1 className="font-display font-800 text-3xl text-slate-900">Dashboard</h1>
              <p className="text-slate-500 mt-1">Welcome back. Here's what's happening at the shelter today.</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-slate-700">Shelter Open</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <StatCard
            label="Available Animals"
            value={available}
            color="text-emerald-600"
            icon={<svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>}
            onClick={() => navigate('admin-animals')}
          />
          <StatCard
            label="Pending Applications"
            value={pending}
            color="text-amber-600"
            icon={<svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            onClick={() => navigate('admin-applications')}
          />
          <StatCard
            label="Approved Applications"
            value={approved}
            color="text-blue-600"
            icon={<svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            onClick={() => navigate('admin-applications')}
          />
          <StatCard
            label="Scheduled Appts."
            value={scheduled}
            color="text-purple-600"
            icon={<svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            onClick={() => navigate('admin-appointments')}
          />
          <StatCard
            label="Total Adoptions"
            value={totalAdopted}
            color="text-rose-600"
            icon={<svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
            onClick={() => navigate('admin-adoption-history')}
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Pending applications */}
          <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-700 text-lg text-slate-900">Pending Applications</h2>
              <button onClick={() => navigate('admin-applications')} className="text-sm text-blue-600 font-semibold hover:text-blue-700">View all →</button>
            </div>
            {recentApps.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>No pending applications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApps.map(app => {
                  const animal = animals.find(a => a.id === app.animalId);
                  return (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-amber-200 transition-colors">
                      <div className="flex items-center gap-3">
                        {animal && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200">
                            <img src={animal.photo} alt={animal.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{app.adopterName}</p>
                          <p className="text-xs text-slate-400">applying for {animal?.name} · {app.submittedDate}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('admin-applications')}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs px-3 py-1.5 rounded-lg border border-amber-200 transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="font-display font-700 text-lg text-slate-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: 'Manage Animals', page: 'admin-animals' as const, icon: '🐾' },
                  { label: 'Review Applications', page: 'admin-applications' as const, icon: '📋' },
                  { label: 'View Appointments', page: 'admin-appointments' as const, icon: '📅' },
                  { label: 'Medical Records', page: 'admin-medical-records' as const, icon: '🩺' },
                  { label: 'Adoption History', page: 'admin-adoption-history' as const, icon: '🏠' },
                ].map(item => (
                  <button
                    key={item.page}
                    onClick={() => navigate(item.page)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 font-medium text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
                  >
                    <span>{item.icon}</span>
                    {item.label}
                    <svg className="w-4 h-4 ml-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
              <p className="font-display font-700 text-base mb-1">Shelter Status</p>
              <p className="text-blue-200 text-xs mb-3">September 2026</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-200">Total animals</span>
                  <span className="font-bold">{animals.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Adopted this year</span>
                  <span className="font-bold">{adoptionHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Capacity</span>
                  <span className="font-bold">{Math.round((animals.length / 20) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
