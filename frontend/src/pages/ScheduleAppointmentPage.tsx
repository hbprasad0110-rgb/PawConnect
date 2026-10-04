import { useState } from 'react';
import { useApp } from '../AppContext';

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM',
];

export default function ScheduleAppointmentPage() {
  const { animals, selectedAnimalId, selectedApplicationId, currentUser, scheduleAppointment, navigate } = useApp();
  const animal = animals.find(a => a.id === selectedAnimalId);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!animal || !currentUser || !selectedApplicationId) return null;

  const today = new Date();
  const minDate = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!date) e.date = 'Please select a date.';
    if (!time) e.time = 'Please select a time slot.';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    scheduleAppointment(selectedApplicationId, animal.id, date, time, notes);
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="fade-in min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center max-w-md">
        <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="font-display font-800 text-2xl text-slate-900 mb-2">Appointment Scheduled!</h2>
        <p className="text-slate-500 mb-1">Your meet-and-greet with <strong>{animal.name}</strong> is confirmed.</p>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 my-4 text-sm text-blue-800">
          <p className="font-semibold">{date} at {time}</p>
          <p className="text-xs text-blue-600 mt-1">PawConnect Animal Shelter, Campus Drive</p>
        </div>
        <button
          onClick={() => navigate('my-appointments')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
        >
          View My Appointments
        </button>
      </div>
    </div>
  );

  return (
    <div className="fade-in min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <button onClick={() => navigate('my-applications')} className="text-slate-400 hover:text-slate-700 text-sm mb-4 flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to My Applications
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100">
              <img src={animal.photo} alt={animal.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-0.5">Schedule Appointment</p>
              <h1 className="font-display font-800 text-2xl text-slate-900">Meet & Greet with {animal.name}</h1>
              <p className="text-slate-500 text-sm">{animal.breed} · {animal.gender}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="font-display font-700 text-lg text-slate-900 mb-4">Select a Date</h2>
                <input
                  type="date"
                  min={minDate}
                  value={date}
                  onChange={e => { setDate(e.target.value); setErrors(er => ({ ...er, date: '' })); }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500/30 transition-all ${errors.date ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-blue-400'}`}
                />
                {errors.date && <p className="text-red-600 text-xs mt-1">{errors.date}</p>}
              </div>

              {/* Time */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="font-display font-700 text-lg text-slate-900 mb-4">Select a Time</h2>
                {errors.time && <p className="text-red-600 text-xs mb-2">{errors.time}</p>}
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => { setTime(slot); setErrors(er => ({ ...er, time: '' })); }}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        time === slot
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="font-display font-700 text-lg text-slate-900 mb-2">Additional Notes</h2>
                <p className="text-slate-400 text-xs mb-4">Any questions or things you'd like us to know before your visit.</p>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. I'll be bringing my 8-year-old child along..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-blue-600/20 text-lg"
              >
                Confirm Appointment
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="font-display font-700 text-slate-900 mb-3">Appointment Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <svg className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-slate-600">PawConnect Animal Shelter<br /><span className="text-slate-400 text-xs">Campus Drive, Rm 101</span></span>
                </div>
                <div className="flex gap-2">
                  <svg className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span className="text-slate-600">(555) 000-PAWS</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <p className="text-xs font-semibold text-amber-700 mb-2">What to bring</p>
              <ul className="text-xs text-amber-800 space-y-1">
                <li>• Valid government-issued ID</li>
                <li>• All household members (18+)</li>
                <li>• Existing pet health records</li>
                <li>• Landlord approval (if renting)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
