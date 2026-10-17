import { useEffect, useState } from 'react';
import { useApp } from '../../ApiAppContext';
import type { MedicalRecord } from '../../types';

export default function AdminMedicalRecordsPage() {
  const { animals, addMedicalRecord, getMedicalRecords, updateMedicalRecord } = useApp();
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(animals[0]?.id ?? '');
  const [showAdd, setShowAdd] = useState(false);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [editing, setEditing] = useState<MedicalRecord | null>(null);
  const [newRecord, setNewRecord] = useState({ date: '', type: '', description: '', vet: '' });

  const selectedAnimal = animals.find(a => a.id === selectedAnimalId);

  const RECORD_TYPES = ['Intake Exam', 'Vaccination', 'Wellness Check', 'Dental Cleaning', 'Surgery', 'X-Ray', 'Lab Work', 'Follow-up', 'Microchip', 'Deworming', 'Emergency'];

  useEffect(() => {
    if (!selectedAnimalId && animals[0]) setSelectedAnimalId(animals[0].id);
  }, [animals, selectedAnimalId]);

  useEffect(() => {
    if (!selectedAnimalId) return;
    let active = true;
    void getMedicalRecords(selectedAnimalId).then((rows) => {
      if (active) setRecords(rows);
    });
    return () => { active = false; };
  }, [getMedicalRecords, selectedAnimalId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.type || !newRecord.date || !newRecord.description || !newRecord.vet) return;
    const created = await addMedicalRecord(selectedAnimalId, newRecord);
    if (!created) return;
    setRecords(await getMedicalRecords(selectedAnimalId));
    setNewRecord({ date: '', type: '', description: '', vet: '' });
    setShowAdd(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const updated = await updateMedicalRecord(editing);
    if (!updated) return;
    setRecords(await getMedicalRecords(selectedAnimalId));
    setEditing(null);
  };

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all';

  return (
    <div className="fade-in min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Admin</p>
          <h1 className="font-display font-800 text-2xl text-slate-900">Medical Records</h1>
          <p className="text-slate-500 text-sm mt-0.5">View and manage health records for all shelter animals.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6">
        {/* Animal list */}
        <div className="w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Select Animal</p>
            </div>
            <div className="divide-y divide-slate-50">
              {animals.map(animal => (
                <button
                  key={animal.id}
                  onClick={() => { setSelectedAnimalId(animal.id); setShowAdd(false); setEditing(null); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${selectedAnimalId === animal.id ? 'bg-blue-50 border-r-2 border-blue-500' : 'hover:bg-slate-50'}`}
                >
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={animal.photo} alt={animal.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-semibold text-sm truncate ${selectedAnimalId === animal.id ? 'text-blue-700' : 'text-slate-800'}`}>{animal.name}</p>
                    <p className="text-xs text-slate-400 truncate">{animal.breed}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Records */}
        <div className="flex-1">
          {selectedAnimal && (
            <div className="space-y-5">
              {/* Header */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100">
                    <img src={selectedAnimal.photo} alt={selectedAnimal.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="font-display font-800 text-xl text-slate-900">{selectedAnimal.name}</h2>
                    <p className="text-slate-500 text-sm">{selectedAnimal.breed} · {selectedAnimal.gender} · {selectedAnimal.age}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAdd(s => !s)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 shadow-md shadow-blue-600/20"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Record
                </button>
              </div>

              {/* Add record form */}
              {showAdd && (
                <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 space-y-4">
                  <h3 className="font-display font-700 text-slate-900">New Medical Record</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Record Type *</label>
                      <select required value={newRecord.type} onChange={e => setNewRecord(r => ({ ...r, type: e.target.value }))} className={inputCls}>
                        <option value="">Select type...</option>
                        {RECORD_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date *</label>
                      <input required type="date" value={newRecord.date} onChange={e => setNewRecord(r => ({ ...r, date: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Veterinarian *</label>
                      <select required value={newRecord.vet} onChange={e => setNewRecord(r => ({ ...r, vet: e.target.value }))} className={inputCls}>
                        <option value="">Select vet...</option>
                        <option>Dr. Emily Chen</option>
                        <option>Dr. James Park</option>
                        <option>Dr. Maria Santos</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description *</label>
                    <textarea required rows={3} value={newRecord.description} onChange={e => setNewRecord(r => ({ ...r, description: e.target.value }))} className={`${inputCls} resize-none`} placeholder="Describe the procedure, findings, and any follow-up needed..." />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">Save Record</button>
                    <button type="button" onClick={() => setShowAdd(false)} className="border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">Cancel</button>
                  </div>
                </form>
              )}

              {editing && (
                <form onSubmit={handleUpdate} className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 space-y-4">
                  <h3 className="font-display font-700 text-slate-900">Edit Medical Record</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <label className="text-xs font-semibold text-slate-600">Record Type<input required className={`${inputCls} mt-1.5`} value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value })} /></label>
                    <label className="text-xs font-semibold text-slate-600">Date<input required type="date" className={`${inputCls} mt-1.5`} value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} /></label>
                    <label className="text-xs font-semibold text-slate-600">Veterinarian<input required className={`${inputCls} mt-1.5`} value={editing.vet} onChange={e => setEditing({ ...editing, vet: e.target.value })} /></label>
                  </div>
                  <label className="block text-xs font-semibold text-slate-600">Description<textarea required rows={3} className={`${inputCls} mt-1.5 resize-none`} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} /></label>
                  <div className="flex gap-3">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm">Save Changes</button>
                    <button type="button" onClick={() => setEditing(null)} className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-sm font-semibold">Cancel</button>
                  </div>
                </form>
              )}

              {/* Records list */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-display font-700 text-lg text-slate-900 mb-5">
                  Medical History <span className="text-slate-400 font-normal text-base">({records.length} records)</span>
                </h3>
                {records.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-3xl mb-2">🩺</p>
                    <p>No medical records yet. Add the first record above.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...records].reverse().map(record => (
                      <div key={record.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{record.type}</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{record.date}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 font-medium">{record.vet}</span>
                            <button onClick={() => setEditing(record)} className="text-xs text-blue-600 hover:text-blue-700 font-semibold">Edit</button>
                          </div>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">{record.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
