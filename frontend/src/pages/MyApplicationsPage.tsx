import { useApp } from '../AppContext';
import { AppStatusBadge, AnimalStatusBadge } from '../components/StatusBadge';

export default function MyApplicationsPage() {
  const { currentUser, applications, animals, navigate, withdrawApplication } = useApp();

  const myApps = applications.filter(a => a.adopterId === currentUser?.id);

  const getAnimal = (id: string) => animals.find(a => a.id === id);

  return (
    <div className="fade-in min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h1 className="font-display font-800 text-3xl text-slate-900 mb-1">My Applications</h1>
          <p className="text-slate-500">Track the status of your adoption applications.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {myApps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="font-display font-700 text-xl text-slate-700 mb-2">No applications yet</h3>
            <p className="text-slate-400 mb-6">Browse our animals and apply for adoption to get started.</p>
            <button onClick={() => navigate('animals')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              Browse Animals
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myApps.map(app => {
              const animal = getAnimal(app.animalId);
              if (!animal) return null;
              return (
                <div key={app.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:border-blue-100 transition-colors">
                  <div className="flex gap-0">
                    {/* Animal photo */}
                    <div className="w-36 h-36 flex-shrink-0 bg-slate-100">
                      <img src={animal.photo} alt={animal.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display font-800 text-xl text-slate-900">{animal.name}</h3>
                          <AnimalStatusBadge status={animal.status} />
                        </div>
                        <p className="text-slate-500 text-sm mb-0.5">{animal.breed} · {animal.gender} · {animal.age}</p>
                        <p className="text-slate-400 text-xs mb-3">Application submitted: {app.submittedDate}</p>

                        <div className="flex items-center gap-3">
                          <AppStatusBadge status={app.status} />
                          {app.reviewedDate && (
                            <span className="text-xs text-slate-400">Reviewed {app.reviewedDate}</span>
                          )}
                        </div>

                        {app.status === 'APPROVED' && !app.appointmentId && (
                          <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                            <p className="text-emerald-700 text-sm font-semibold mb-0.5">🎉 Congratulations! Your application was approved.</p>
                            <p className="text-emerald-600 text-xs">Schedule a meet-and-greet appointment to proceed with the adoption.</p>
                          </div>
                        )}

                        {app.status === 'APPROVED' && app.appointmentId && (
                          <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
                            <p className="text-blue-700 text-sm font-semibold mb-0.5">✅ Appointment scheduled!</p>
                            <p className="text-blue-600 text-xs">Check your appointments page for details.</p>
                          </div>
                        )}

                        {app.status === 'REJECTED' && (
                          <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-3">
                            <p className="text-red-700 text-sm font-semibold">Application not approved this time.</p>
                            <p className="text-red-500 text-xs mt-0.5">Feel free to browse other animals and apply again.</p>
                          </div>
                        )}

                        {app.status === 'PENDING' && (
                          <p className="text-amber-600 text-xs mt-2">⏳ Under review. We'll notify you within 2-3 business days.</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
                        <button
                          onClick={() => navigate('animal-profile', animal.id)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-semibold border border-blue-200 hover:border-blue-300 px-4 py-2 rounded-lg transition-colors"
                        >
                          View Animal
                        </button>
                        {app.status === 'APPROVED' && !app.appointmentId && (
                          <button
                            onClick={() => navigate('schedule-appointment', animal.id, app.id)}
                            className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg transition-colors"
                          >
                            Schedule Appt.
                          </button>
                        )}
                        {app.status === 'APPROVED' && app.appointmentId && (
                          <button
                            onClick={() => navigate('my-appointments')}
                            className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded-lg transition-colors"
                          >
                            View Appt.
                          </button>
                        )}
                        {(app.status === 'PENDING' || app.status === 'APPROVED') && !app.appointmentId && (
                          <button
                            onClick={() => withdrawApplication(app.id)}
                            className="text-xs text-slate-400 hover:text-red-500 transition-colors mt-1"
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
