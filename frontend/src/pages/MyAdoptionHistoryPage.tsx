import { useApp } from '../AppContext';

export default function MyAdoptionHistoryPage() {
  const { currentUser, adoptionHistory, navigate } = useApp();
  const myHistory = adoptionHistory.filter(r => r.adopterId === currentUser?.id);

  return (
    <div className="fade-in min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="font-display font-800 text-3xl text-slate-900 mb-1">My Adoption History</h1>
          <p className="text-slate-500">A record of every furry friend you've welcomed home.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {myHistory.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
            <div className="text-5xl mb-4">🏠</div>
            <h3 className="font-display font-700 text-xl text-slate-700 mb-2">No adoptions yet</h3>
            <p className="text-slate-400 mb-6">Your adoption records will appear here after you complete an adoption.</p>
            <button onClick={() => navigate('animals')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              Browse Animals
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myHistory.map(record => (
              <div key={record.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:border-blue-100 transition-colors">
                <div className="flex">
                  <div className="w-32 h-32 flex-shrink-0 bg-slate-100">
                    <img src={record.animalPhoto} alt={record.animalName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 p-6 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-800 text-xl text-slate-900">{record.animalName}</h3>
                        <span className="bg-slate-100 text-slate-500 text-xs font-semibold px-2 py-0.5 rounded-full border border-slate-200">Adopted</span>
                      </div>
                      <p className="text-slate-500 text-sm mb-0.5">{record.animalBreed} · {record.animalType === 'DOG' ? '🐕 Dog' : '🐈 Cat'}</p>
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-3">
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>Adopted on <strong>{record.adoptionDate}</strong></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">Forever Home</p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-emerald-700 text-sm font-semibold">
                    {record.animalName} is living their best life with {record.adopterName}! 🐾
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
