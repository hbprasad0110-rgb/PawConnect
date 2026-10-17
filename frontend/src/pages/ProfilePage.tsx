import { useEffect, useState } from 'react';
import { useApp } from '../ApiAppContext';

export default function ProfilePage() {
  const { currentUser, getProfile, updateProfile } = useApp();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', address: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void getProfile().then((user) => {
      if (!user) return;
      const [firstName = '', ...last] = user.name.trim().split(/\s+/);
      setForm({ firstName, lastName: last.join(' ') || 'User', phone: user.phone, address: user.address });
    });
  }, [getProfile]);

  if (!currentUser) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!await updateProfile(form)) return;
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const field = 'w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="font-display font-800 text-2xl text-slate-900">My Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Keep your contact and household information current.</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={submit} className="bg-white border border-slate-200 p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <p className="font-semibold text-slate-900">{currentUser.name}</p>
              <p className="text-sm text-slate-500">{currentUser.email}</p>
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full">Adopter</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm font-semibold text-slate-700">First Name
              <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={`${field} mt-1.5`} />
            </label>
            <label className="text-sm font-semibold text-slate-700">Last Name
              <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={`${field} mt-1.5`} />
            </label>
          </div>
          <label className="block text-sm font-semibold text-slate-700">Phone
            <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={`${field} mt-1.5`} />
          </label>
          <label className="block text-sm font-semibold text-slate-700">Address
            <textarea required rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={`${field} mt-1.5 resize-none`} />
          </label>
          <div className="flex items-center gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg">Save Profile</button>
            {saved && <span className="text-sm font-semibold text-emerald-600">Profile updated.</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
