import { useEffect, useState } from 'react';
import { useApp } from '../ApiAppContext';
import { AnimalStatusBadge } from '../components/StatusBadge';
import type { Animal, AnimalStatus, PageMeta } from '../types';

const STATUS_FILTERS: { label: string; value: AnimalStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'Application Pending', value: 'APPLICATION_PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'In Foster Care', value: 'FOSTERED' },
  { label: 'Adopted', value: 'ADOPTED' },
];

export default function AnimalsPage() {
  const { navigate, searchAnimals } = useApp();
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'ALL' | 'DOG' | 'CAT'>('ALL');
  const [status, setStatus] = useState<AnimalStatus | 'ALL'>('ALL');
  const [gender, setGender] = useState<'ALL' | 'Male' | 'Female'>('ALL');
  const [breed, setBreed] = useState('');
  const [ageRange, setAgeRange] = useState<'ALL' | 'YOUNG' | 'ADULT' | 'SENIOR'>('ALL');
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<Animal[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ page: 1, pageSize: 9, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const age = ageRange === 'YOUNG' ? { minAgeMonths: 0, maxAgeMonths: 11 }
      : ageRange === 'ADULT' ? { minAgeMonths: 12, maxAgeMonths: 83 }
        : ageRange === 'SENIOR' ? { minAgeMonths: 84 } : {};
    let active = true;
    setLoading(true);
    const timer = window.setTimeout(() => {
      void searchAnimals({
        search: search || undefined, breed: breed || undefined,
        type: type === 'ALL' ? undefined : type.toLowerCase() as 'dog' | 'cat',
        gender: gender === 'ALL' ? undefined : gender.toLowerCase() as 'male' | 'female',
        status: status === 'ALL' ? undefined : status.toLowerCase(),
        includeAdopted: status === 'ALL', page, pageSize: 9, ...age,
      }).then((response) => {
        if (!active) return;
        setResults(response.items);
        setMeta(response.meta);
        setLoading(false);
      });
    }, 200);
    return () => { active = false; window.clearTimeout(timer); };
  }, [ageRange, breed, gender, page, search, searchAnimals, status, type]);

  const resetFilters = () => {
    setType('ALL'); setStatus('ALL'); setGender('ALL'); setSearch(''); setBreed(''); setAgeRange('ALL'); setPage(1);
  };

  return (
    <div className="fade-in min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="font-display font-800 text-3xl text-slate-900 mb-1">Browse Animals</h1>
          <p className="text-slate-500">Find your perfect companion from our shelter family.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-60 flex-shrink-0 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-display font-700 text-slate-900 mb-4 text-sm uppercase tracking-wide">Filters</h3>

            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Animal Type</label>
              <div className="space-y-1.5">
                {(['ALL', 'DOG', 'CAT'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => { setType(t); setPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${type === t ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {t === 'ALL' ? '🐾 All Animals' : t === 'DOG' ? '🐕 Dogs' : '🐈 Cats'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Breed</label>
              <input value={breed} onChange={(event) => { setBreed(event.target.value); setPage(1); }} placeholder="Any breed" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>

            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Age</label>
              <select value={ageRange} onChange={(event) => { setAgeRange(event.target.value as typeof ageRange); setPage(1); }} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                <option value="ALL">Any age</option><option value="YOUNG">Under 1 year</option><option value="ADULT">1–6 years</option><option value="SENIOR">7+ years</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Status</label>
              <div className="space-y-1.5">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => { setStatus(f.value); setPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${status === f.value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Gender</label>
              <div className="space-y-1.5">
                {(['ALL', 'Male', 'Female'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => { setGender(g); setPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${gender === g ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {g === 'ALL' ? 'All' : g}
                  </button>
                ))}
              </div>
            </div>

            {(type !== 'ALL' || status !== 'ALL' || gender !== 'ALL' || ageRange !== 'ALL' || breed || search) && (
              <button
                onClick={resetFilters}
                className="w-full mt-4 text-sm text-slate-400 hover:text-slate-700 underline transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Search bar */}
          <div className="relative mb-6">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or breed..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-800">{meta.total}</span> animals found
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-400">Loading animals...</div>
          ) : results.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-display font-700 text-xl text-slate-700 mb-2">No animals found</h3>
              <p className="text-slate-400">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-5">
              {results.map(animal => (
                <button
                  key={animal.id}
                  onClick={() => navigate('animal-profile', animal.id)}
                  className="animal-card bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:border-blue-100 transition-all duration-200 text-left group"
                >
                  <div className="overflow-hidden aspect-[4/3] bg-slate-100 relative">
                    <img
                      src={animal.photo}
                      alt={animal.name}
                      className="animal-card-img w-full h-full object-cover transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm text-xs font-bold text-slate-700 px-2 py-1 rounded-lg">
                        {animal.type === 'DOG' ? '🐕 Dog' : '🐈 Cat'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-display font-800 text-lg text-slate-900">{animal.name}</h3>
                      <AnimalStatusBadge status={animal.status} />
                    </div>
                    <p className="text-slate-500 text-sm">{animal.breed}</p>
                    <p className="text-slate-400 text-xs mt-0.5 mb-3">{animal.gender} · {animal.age}</p>
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all duration-200">
                      View Details
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {meta.total > meta.pageSize && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-40">Previous</button>
              <span className="text-sm text-slate-500">Page {meta.page} of {Math.ceil(meta.total / meta.pageSize)}</span>
              <button disabled={page >= Math.ceil(meta.total / meta.pageSize)} onClick={() => setPage((value) => value + 1)} className="border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
