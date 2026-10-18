import { useEffect, useState } from 'react';
import { useApp } from '../../ApiAppContext';
import type { Animal } from '../../types';

type EditableAnimal = Omit<Animal, 'id' | 'medicalRecords' | 'status'>;

export default function AdminAnimalEditPage() {
  const { selectedAnimalId, getAdminAnimal, updateAnimal, navigate } = useApp();
  const [animal, setAnimal] = useState<EditableAnimal | null>(null);

  useEffect(() => {
    if (!selectedAnimalId) return;
    void getAdminAnimal(selectedAnimalId).then((row) => {
      if (!row) return;
      const { id: _id, medicalRecords: _records, status: _status, ...editable } = row;
      setAnimal(editable);
    });
  }, [getAdminAnimal, selectedAnimalId]);

  if (!selectedAnimalId) return null;
  if (!animal) return <div className="p-12 text-center text-slate-500">Loading animal record...</div>;

  const set = <K extends keyof EditableAnimal>(key: K, value: EditableAnimal[K]) => setAnimal({ ...animal, [key]: value });
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (await updateAnimal(selectedAnimalId, animal)) navigate('admin-animals');
  };
  const input = 'w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500/30';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button onClick={() => navigate('admin-animals')} className="text-sm text-blue-600 mb-3">Back to Animals</button>
          <h1 className="font-display font-800 text-2xl text-slate-900">Edit {animal.name}</h1>
        </div>
      </div>
      <form onSubmit={save} className="max-w-4xl mx-auto px-6 py-8 space-y-5">
        <div className="bg-white border border-slate-200 p-6 grid grid-cols-2 gap-4">
          <label className="text-sm font-semibold text-slate-700">Name<input required className={`${input} mt-1`} value={animal.name} onChange={(e) => set('name', e.target.value)} /></label>
          <label className="text-sm font-semibold text-slate-700">Breed<input required className={`${input} mt-1`} value={animal.breed} onChange={(e) => set('breed', e.target.value)} /></label>
          <label className="text-sm font-semibold text-slate-700">Type<select className={`${input} mt-1`} value={animal.type} onChange={(e) => set('type', e.target.value as Animal['type'])}><option>DOG</option><option>CAT</option></select></label>
          <label className="text-sm font-semibold text-slate-700">Gender<select className={`${input} mt-1`} value={animal.gender} onChange={(e) => set('gender', e.target.value as Animal['gender'])}><option>Male</option><option>Female</option></select></label>
          <label className="text-sm font-semibold text-slate-700">Age<input className={`${input} mt-1`} value={animal.age} onChange={(e) => set('age', e.target.value)} placeholder="2 years" /></label>
          <label className="text-sm font-semibold text-slate-700">Weight<input className={`${input} mt-1`} value={animal.weight} onChange={(e) => set('weight', e.target.value)} /></label>
          <label className="text-sm font-semibold text-slate-700">Color<input className={`${input} mt-1`} value={animal.color} onChange={(e) => set('color', e.target.value)} /></label>
          <label className="text-sm font-semibold text-slate-700">Arrival Date<input type="date" className={`${input} mt-1`} value={animal.arrivalDate} onChange={(e) => set('arrivalDate', e.target.value)} /></label>
          <label className="col-span-2 text-sm font-semibold text-slate-700">Photo URL<input className={`${input} mt-1`} value={animal.photo} onChange={(e) => set('photo', e.target.value)} /></label>
          <label className="col-span-2 text-sm font-semibold text-slate-700">Description<textarea required rows={3} className={`${input} mt-1 resize-none`} value={animal.description} onChange={(e) => set('description', e.target.value)} /></label>
          <label className="col-span-2 text-sm font-semibold text-slate-700">Health Summary<textarea rows={2} className={`${input} mt-1 resize-none`} value={animal.healthSummary} onChange={(e) => set('healthSummary', e.target.value)} /></label>
          <label className="col-span-2 text-sm font-semibold text-slate-700">Intake Reason<input className={`${input} mt-1`} value={animal.intakeReason} onChange={(e) => set('intakeReason', e.target.value)} /></label>
          <div className="col-span-2 flex gap-6 pt-2">
            {(['vaccinated', 'neutered', 'microchipped'] as const).map((key) => <label key={key} className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={animal[key]} onChange={(e) => set(key, e.target.checked)} />{key[0].toUpperCase() + key.slice(1)}</label>)}
          </div>
        </div>
        <div className="flex gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg">Save Changes</button>
          <button type="button" onClick={() => navigate('admin-animals')} className="border border-slate-200 text-slate-600 font-semibold px-6 py-3 rounded-lg">Cancel</button>
        </div>
      </form>
    </div>
  );
}
