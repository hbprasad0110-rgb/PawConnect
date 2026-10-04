import { useState } from 'react';
import { useApp } from '../../AppContext';
import { AnimalStatusBadge } from '../../components/StatusBadge';
import type { AnimalStatus, Animal } from '../../types';

const STATUSES: AnimalStatus[] = ['AVAILABLE', 'APPLICATION_PENDING', 'APPROVED', 'FOSTERED', 'ADOPTED'];

export default function AdminAnimalsPage() {
  const { animals, navigate, updateAnimalStatus, addAnimal } = useApp();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newAnimal, setNewAnimal] = useState({
    name: '', type: 'DOG' as 'DOG' | 'CAT', breed: '', age: '', gender: 'Male' as 'Male' | 'Female',
    weight: '', color: '', status: 'AVAILABLE' as AnimalStatus,
    description: '', photo: '', vaccinated: false, neutered: false, microchipped: false,
    healthSummary: '', arrivalDate: new Date().toISOString().split('T')[0], intakeReason: '',
  });

  const filtered = animals.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.breed.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnimal.name || !newAnimal.breed) return;
    addAnimal({
      ...newAnimal,
      photo: newAnimal.photo || 'https://images.unsplash.com/photo-1583786693544-e352f898888d?w=600&h=450&fit=crop&auto=format',
    });
    setShowAdd(false);
    setNewAnimal({ name: '', type: 'DOG', breed: '', age: '', gender: 'Male', weight: '', color: '', status: 'AVAILABLE', description: '', photo: '', vaccinated: false, neutered: false, microchipped: false, healthSummary: '', arrivalDate: new Date().toISOString().split('T')[0], intakeReason: '' });
  };

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all';

  return (
    <div className="fade-in min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Admin</p>
            <h1 className="font-display font-800 text-2xl text-slate-900">Manage Animals</h1>
            <p className="text-slate-500 text-sm mt-0.5">{animals.length} total animals in the system</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-blue-600/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Animal
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search animals..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 shadow-sm"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Animal</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Breed</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Age</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Change Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(animal => (
                <tr key={animal.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        <img src={animal.photo} alt={animal.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-display font-700 text-slate-900">{animal.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">{animal.type === 'DOG' ? '🐕 Dog' : '🐈 Cat'}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{animal.breed}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{animal.gender} · {animal.age}</td>
                  <td className="px-5 py-4">
                    <AnimalStatusBadge status={animal.status} />
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={animal.status}
                      onChange={e => updateAnimalStatus(animal.id, e.target.value as AnimalStatus)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-blue-500/30 transition-all"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => navigate('animal-profile', animal.id)}
                      className="text-blue-600 hover:text-blue-700 font-semibold text-xs underline"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Animal Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-7 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-display font-800 text-xl text-slate-900">Add New Animal</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-7 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Name *</label>
                  <input required value={newAnimal.name} onChange={e => setNewAnimal(n => ({ ...n, name: e.target.value }))} className={inputCls} placeholder="Buddy" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Type *</label>
                  <select value={newAnimal.type} onChange={e => setNewAnimal(n => ({ ...n, type: e.target.value as 'DOG' | 'CAT' }))} className={inputCls}>
                    <option value="DOG">Dog</option>
                    <option value="CAT">Cat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Breed *</label>
                  <input required value={newAnimal.breed} onChange={e => setNewAnimal(n => ({ ...n, breed: e.target.value }))} className={inputCls} placeholder="Golden Retriever" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Age</label>
                  <input value={newAnimal.age} onChange={e => setNewAnimal(n => ({ ...n, age: e.target.value }))} className={inputCls} placeholder="2 years" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
                  <select value={newAnimal.gender} onChange={e => setNewAnimal(n => ({ ...n, gender: e.target.value as 'Male' | 'Female' }))} className={inputCls}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Weight</label>
                  <input value={newAnimal.weight} onChange={e => setNewAnimal(n => ({ ...n, weight: e.target.value }))} className={inputCls} placeholder="65 lbs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Color</label>
                  <input value={newAnimal.color} onChange={e => setNewAnimal(n => ({ ...n, color: e.target.value }))} className={inputCls} placeholder="Golden" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Intake Reason</label>
                  <input value={newAnimal.intakeReason} onChange={e => setNewAnimal(n => ({ ...n, intakeReason: e.target.value }))} className={inputCls} placeholder="Owner surrender" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea rows={3} value={newAnimal.description} onChange={e => setNewAnimal(n => ({ ...n, description: e.target.value }))} className={`${inputCls} resize-none`} placeholder="Describe the animal..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Health Summary</label>
                <textarea rows={2} value={newAnimal.healthSummary} onChange={e => setNewAnimal(n => ({ ...n, healthSummary: e.target.value }))} className={`${inputCls} resize-none`} />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={newAnimal.vaccinated} onChange={e => setNewAnimal(n => ({ ...n, vaccinated: e.target.checked }))} className="accent-blue-600" />
                  Vaccinated
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={newAnimal.neutered} onChange={e => setNewAnimal(n => ({ ...n, neutered: e.target.checked }))} className="accent-blue-600" />
                  Neutered/Spayed
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={newAnimal.microchipped} onChange={e => setNewAnimal(n => ({ ...n, microchipped: e.target.checked }))} className="accent-blue-600" />
                  Microchipped
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
                  Add Animal
                </button>
                <button type="button" onClick={() => setShowAdd(false)} className="px-6 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-3 rounded-xl transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
