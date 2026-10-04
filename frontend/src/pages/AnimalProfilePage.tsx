import { useApp } from '../AppContext';
import { AnimalStatusBadge } from '../components/StatusBadge';

export default function AnimalProfilePage() {
  const { animals, currentUser, selectedAnimalId, navigate, applications } = useApp();
  const animal = animals.find(a => a.id === selectedAnimalId);

  if (!animal) return (
    <div className="text-center py-20">
      <p className="text-slate-400">Animal not found.</p>
      <button onClick={() => navigate('animals')} className="text-blue-600 mt-2">Back to Animals</button>
    </div>
  );

  const hasApplied = currentUser
    ? applications.some(app => app.animalId === animal.id && app.adopterId === currentUser.id && app.status !== 'WITHDRAWN')
    : false;

  const canApply = animal.status === 'AVAILABLE' && !hasApplied;

  const handleApply = () => {
    if (!currentUser) {
      navigate('login');
      return;
    }
    navigate('apply', animal.id);
  };

  const Check = ({ ok }: { ok: boolean }) => (
    <span className={`inline-flex items-center gap-1 text-sm font-semibold ${ok ? 'text-emerald-600' : 'text-slate-400'}`}>
      {ok
        ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      }
      {ok ? 'Yes' : 'No'}
    </span>
  );

  return (
    <div className="fade-in min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-slate-400">
          <button onClick={() => navigate('home')} className="hover:text-blue-600 transition-colors">Home</button>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <button onClick={() => navigate('animals')} className="hover:text-blue-600 transition-colors">Animals</button>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-slate-700 font-medium">{animal.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left: Photo + quick info */}
          <div className="space-y-5">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="aspect-square bg-slate-100">
                <img src={animal.photo} alt={animal.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h1 className="font-display font-900 text-3xl text-slate-900">{animal.name}</h1>
                  <AnimalStatusBadge status={animal.status} />
                </div>
                <p className="text-slate-500 font-medium mb-0.5">{animal.breed}</p>
                <p className="text-slate-400 text-sm">{animal.type === 'DOG' ? '🐕 Dog' : '🐈 Cat'} · {animal.gender} · {animal.age}</p>
              </div>
            </div>

            {/* Quick details */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
              <h3 className="font-display font-700 text-slate-900 text-sm uppercase tracking-wide">Quick Info</h3>
              {[
                ['Weight', animal.weight],
                ['Color', animal.color],
                ['Arrival Date', animal.arrivalDate],
                ['Intake Reason', animal.intakeReason],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-slate-400">{k}</span>
                  <span className="text-slate-700 font-medium">{v}</span>
                </div>
              ))}
            </div>

            {/* Health status */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
              <h3 className="font-display font-700 text-slate-900 text-sm uppercase tracking-wide">Health Status</h3>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Vaccinated</span>
                <Check ok={animal.vaccinated} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">{animal.gender === 'Male' ? 'Neutered' : 'Spayed'}</span>
                <Check ok={animal.neutered} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Microchipped</span>
                <Check ok={animal.microchipped} />
              </div>
            </div>

            {/* Adopt button */}
            {animal.status !== 'ADOPTED' && (
              <div>
                {hasApplied ? (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                    <svg className="w-5 h-5 text-blue-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-blue-700 text-sm font-semibold">You've already applied for {animal.name}!</p>
                    <button onClick={() => navigate('my-applications')} className="text-blue-500 text-xs mt-1 underline">View your application</button>
                  </div>
                ) : canApply ? (
                  <button
                    onClick={handleApply}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-blue-600/25 text-lg"
                  >
                    Apply for Adoption
                  </button>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                    <p className="text-slate-500 text-sm font-medium">Currently not accepting applications</p>
                    <p className="text-slate-400 text-xs mt-1">Status: {animal.status.replace('_', ' ')}</p>
                  </div>
                )}
                {!currentUser && canApply && (
                  <p className="text-xs text-slate-400 text-center mt-2">You'll need to <button onClick={() => navigate('login')} className="text-blue-500 underline">sign in</button> to apply.</p>
                )}
              </div>
            )}
          </div>

          {/* Right: Description + Medical Records */}
          <div className="col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7">
              <h2 className="font-display font-800 text-2xl text-slate-900 mb-4">About {animal.name}</h2>
              <p className="text-slate-600 leading-relaxed text-base">{animal.description}</p>
            </div>

            {/* Health Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7">
              <h2 className="font-display font-700 text-xl text-slate-900 mb-3">Health Summary</h2>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <p className="text-emerald-800 text-sm leading-relaxed">{animal.healthSummary}</p>
                </div>
              </div>
            </div>

            {/* Medical Records */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7">
              <h2 className="font-display font-700 text-xl text-slate-900 mb-5">Medical Records</h2>
              <div className="space-y-3">
                {animal.medicalRecords.map((record, i) => (
                  <div key={record.id} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                        {String(animal.medicalRecords.length - i).padStart(2, '0')}
                      </div>
                      {i < animal.medicalRecords.length - 1 && <div className="w-px h-full bg-slate-200 mt-2 min-h-[16px]" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-800 text-sm">{record.type}</span>
                        <span className="text-xs text-slate-400">{record.date}</span>
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed">{record.description}</p>
                      <p className="text-xs text-blue-500 mt-1 font-medium">Dr. {record.vet.replace('Dr. ', '')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
