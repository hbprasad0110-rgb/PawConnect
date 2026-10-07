import { useApp } from '../AppContext';
import { AptStatusBadge } from '../components/StatusBadge';

export default function MyAppointmentsPage() {
  const { currentUser, appointments, animals, navigate } = useApp();
  const myApts = appointments.filter(a => a.adopterId === currentUser?.id);
  const getAnimal = (id: string) => animals.find(a => a.id === id);

  const upcoming = myApts.filter(a => a.status === 'SCHEDULED');
  const past = myApts.filter(a => a.status !== 'SCHEDULED');

  const AptCard = ({ apt }: { apt: typeof myApts[0] }) => {
    const animal = getAnimal(apt.animalId);
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:border-blue-100 transition-colors">
        <div className="flex gap-0">
          {animal && (
            <div className="w-28 h-28 flex-shrink-0 bg-slate-100">
              <img src={animal.photo} alt={animal.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 p-5 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display font-800 text-lg text-slate-900">Meet & Greet: {apt.animalName}</h3>
                <AptStatusBadge status={apt.status} />
              </div>
              {animal && <p className="text-slate-400 text-sm mb-2">{animal.breed} · {animal.gender}</p>}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">{apt.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">{apt.time}</span>
                </div>
              </div>
              {apt.notes && (
                <p className="text-xs text-slate-400 mt-2 max-w-md">📝 {apt.notes}</p>
              )}
              {apt.status === 'COMPLETED' && (
                <div className="mt-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                  <p className="text-emerald-700 text-xs font-semibold">✓ Appointment completed. Check your adoption history for records.</p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 ml-4">
              {animal && (
                <button
                  onClick={() => navigate('animal-profile', animal.id)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold border border-blue-200 hover:border-blue-300 px-4 py-2 rounded-lg transition-colors"
                >
                  View Animal
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="px-5 pb-4 pt-0 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            PawConnect Animal Shelter · Campus Drive · Room 101
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="font-display font-800 text-3xl text-slate-900 mb-1">My Appointments</h1>
          <p className="text-slate-500">Manage your upcoming shelter visits and meet-and-greets.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {myApts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="font-display font-700 text-xl text-slate-700 mb-2">No appointments yet</h3>
            <p className="text-slate-400 mb-6">Appointments are scheduled after your application is approved.</p>
            <button onClick={() => navigate('my-applications')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              View My Applications
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {upcoming.length > 0 && (
              <div>
                <h2 className="font-display font-700 text-lg text-slate-900 mb-4">Upcoming</h2>
                <div className="space-y-4">
                  {upcoming.map(apt => <AptCard key={apt.id} apt={apt} />)}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h2 className="font-display font-700 text-lg text-slate-600 mb-4">Past Appointments</h2>
                <div className="space-y-4 opacity-75">
                  {past.map(apt => <AptCard key={apt.id} apt={apt} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
