import { useApp } from '../../AppContext';

export default function AdminAdoptionHistoryPage() {
  const { adoptionHistory, navigate } = useApp();

  return (
    <div className="fade-in min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Admin</p>
          <h1 className="font-display font-800 text-2xl text-slate-900">Adoption History</h1>
          <p className="text-slate-500 text-sm mt-0.5">{adoptionHistory.length} total adoptions recorded.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-center">
            <p className="font-display font-900 text-3xl text-blue-600">{adoptionHistory.length}</p>
            <p className="text-slate-500 text-sm mt-1">Total Adoptions</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-center">
            <p className="font-display font-900 text-3xl text-emerald-600">
              {adoptionHistory.filter(r => r.animalType === 'DOG').length}
            </p>
            <p className="text-slate-500 text-sm mt-1">Dogs Adopted</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-center">
            <p className="font-display font-900 text-3xl text-purple-600">
              {adoptionHistory.filter(r => r.animalType === 'CAT').length}
            </p>
            <p className="text-slate-500 text-sm mt-1">Cats Adopted</p>
          </div>
        </div>

        {/* Table */}
        {adoptionHistory.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <div className="text-5xl mb-4">🏠</div>
            <h3 className="font-display font-700 text-xl text-slate-700 mb-2">No adoptions recorded yet</h3>
            <p className="text-slate-400">Completed adoptions will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-display font-700 text-lg text-slate-900">All Records</h2>
              <span className="text-xs text-slate-400">{adoptionHistory.length} records</span>
            </div>
            <div className="divide-y divide-slate-50">
              {[...adoptionHistory].reverse().map(record => (
                <div key={record.id} className="flex items-center gap-5 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={record.animalPhoto} alt={record.animalName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-display font-700 text-slate-900">{record.animalName}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-sm text-slate-500">{record.animalBreed}</span>
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
                        {record.animalType === 'DOG' ? '🐕 Dog' : '🐈 Cat'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      Adopted by <strong className="text-slate-700">{record.adopterName}</strong>
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-700">{record.adoptionDate}</p>
                    <div className="flex items-center gap-1 mt-0.5 justify-end">
                      <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="text-xs text-emerald-600 font-semibold">Forever Home</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <button
                      onClick={() => navigate('animal-profile', record.animalId)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold border border-blue-100 hover:border-blue-300 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
