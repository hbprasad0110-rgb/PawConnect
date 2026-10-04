import { useApp } from '../../AppContext';
import { AptStatusBadge } from '../../components/StatusBadge';

export default function AdminAppointmentsPage() {
  const { appointments, animals, navigate, completeAppointment } = useApp();

  const upcoming = appointments.filter(a => a.status === 'SCHEDULED');
  const completed = appointments.filter(a => a.status === 'COMPLETED');

  const getAnimal = (id: string) => animals.find(a => a.id === id);

  const AptRow = ({ apt, showActions }: { apt: typeof appointments[0]; showActions: boolean }) => {
    const animal = getAnimal(apt.animalId);
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:border-blue-100 transition-colors">
        <div className="flex">
          {animal && (
            <div className="w-24 h-24 flex-shrink-0 bg-slate-100">
              <img src={animal.photo} alt={apt.animalName} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 p-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display font-700 text-lg text-slate-900">{apt.adopterName}</h3>
                <span className="text-slate-300">+</span>
                <span className="font-display font-700 text-blue-600">{apt.animalName}</span>
                <AptStatusBadge status={apt.status} />
              </div>
              {animal && <p className="text-slate-400 text-sm mb-2">{animal.breed} · {animal.gender}</p>}
              <div className="flex items-center gap-5 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <strong>{apt.date}</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <strong>{apt.time}</strong>
                </div>
              </div>
              {apt.notes && (
                <p className="text-xs text-slate-400 mt-1.5 max-w-lg">📝 {apt.notes}</p>
              )}
            </div>
            {showActions && (
              <div className="flex flex-col gap-2 ml-6 flex-shrink-0">
                <button
                  onClick={() => completeAppointment(apt.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-blue-600/20 whitespace-nowrap"
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => navigate('admin-complete-adoption', apt.animalId, undefined, apt.id)}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-5 py-2.5 rounded-xl text-sm border border-emerald-200 transition-colors whitespace-nowrap"
                >
                  Complete Adoption
                </button>
              </div>
            )}
            {!showActions && apt.status === 'COMPLETED' && (
              <div className="ml-6">
                <button
                  onClick={() => navigate('admin-complete-adoption', apt.animalId, undefined, apt.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Finalize Adoption
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Admin</p>
          <h1 className="font-display font-800 text-2xl text-slate-900">Appointments</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage shelter visit schedules and complete adoptions.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Upcoming */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-display font-700 text-lg text-slate-900">Upcoming</h2>
            {upcoming.length > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{upcoming.length}</span>
            )}
          </div>
          {upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
              <p className="text-3xl mb-2">📅</p>
              <p>No upcoming appointments scheduled.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(apt => <AptRow key={apt.id} apt={apt} showActions={true} />)}
            </div>
          )}
        </div>

        {/* Completed */}
        {completed.length > 0 && (
          <div>
            <h2 className="font-display font-700 text-lg text-slate-600 mb-4">Completed Appointments</h2>
            <div className="space-y-3 opacity-80">
              {completed.map(apt => {
                const animal = getAnimal(apt.animalId);
                const alreadyAdopted = animal?.status === 'ADOPTED';
                return (
                  <div key={apt.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="flex">
                      {animal && (
                        <div className="w-24 h-24 flex-shrink-0 bg-slate-100">
                          <img src={animal.photo} alt={apt.animalName} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 p-5 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display font-700 text-lg text-slate-900">{apt.adopterName}</h3>
                            <span className="text-slate-300">+</span>
                            <span className="font-display font-700 text-blue-600">{apt.animalName}</span>
                            <AptStatusBadge status={apt.status} />
                          </div>
                          <p className="text-slate-500 text-sm">{apt.date} at {apt.time}</p>
                        </div>
                        {!alreadyAdopted && (
                          <button
                            onClick={() => navigate('admin-complete-adoption', apt.animalId, undefined, apt.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors ml-6"
                          >
                            Finalize Adoption
                          </button>
                        )}
                        {alreadyAdopted && (
                          <span className="ml-6 text-sm text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">Adoption Complete</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
