import { useState } from 'react';
import { useApp } from '../../AppContext';

export default function AdminCompleteAdoptionPage() {
  const { animals, appointments, selectedAnimalId, selectedAppointmentId, completeAdoption, navigate } = useApp();
  const [confirmed, setConfirmed] = useState(false);
  const [step, setStep] = useState(1);

  const animal = animals.find(a => a.id === selectedAnimalId);
  const appointment = appointments.find(a => a.id === selectedAppointmentId);

  if (!animal || !appointment) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-slate-400 mb-4">Appointment or animal not found.</p>
        <button onClick={() => navigate('admin-appointments')} className="text-blue-600 font-semibold">← Back to Appointments</button>
      </div>
    </div>
  );

  if (animal.status === 'ADOPTED') return (
    <div className="fade-in min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center max-w-md">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="font-display font-800 text-2xl text-slate-900 mb-2">{animal.name} is Already Adopted!</h2>
        <p className="text-slate-500 mb-6">This adoption has already been finalized and recorded.</p>
        <button onClick={() => navigate('admin-adoption-history')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
          View Adoption History
        </button>
      </div>
    </div>
  );

  const handleComplete = () => {
    completeAdoption(appointment.id);
    setConfirmed(true);
  };

  if (confirmed) return (
    <div className="fade-in min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-12 text-center max-w-md">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center">
            <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        </div>
        <h2 className="font-display font-900 text-3xl text-slate-900 mb-2">Adoption Complete!</h2>
        <p className="text-emerald-600 font-semibold text-lg mb-4">🐾 {animal.name} has found their forever home!</p>
        <p className="text-slate-500 mb-8">Congratulations to <strong>{appointment.adopterName}</strong>! {animal.name}'s status has been updated to Adopted and a record has been created.</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('admin-adoption-history')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
          >
            View Adoption History
          </button>
          <button
            onClick={() => navigate('admin-dashboard')}
            className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-3 rounded-xl transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fade-in min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <button onClick={() => navigate('admin-appointments')} className="text-slate-400 hover:text-slate-700 text-sm mb-4 flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Appointments
          </button>
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Admin · Finalize Adoption</p>
          <h1 className="font-display font-800 text-2xl text-slate-900">Complete Adoption</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Progress steps */}
        <div className="flex items-center gap-0 mb-8">
          {[{ n: 1, label: 'Review Details' }, { n: 2, label: 'Confirm' }].map((s, i) => (
            <div key={s.n} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${step === s.n ? 'bg-blue-600 text-white' : step > s.n ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                {step > s.n
                  ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  : <span>{s.n}</span>
                }
                {s.label}
              </div>
              {i < 1 && <div className="w-8 h-px bg-slate-200 mx-1" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-5">
            {/* Animal card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex">
                <div className="w-32 h-32 flex-shrink-0 bg-slate-100">
                  <img src={animal.photo} alt={animal.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Animal Being Adopted</p>
                  <h2 className="font-display font-800 text-2xl text-slate-900 mb-0.5">{animal.name}</h2>
                  <p className="text-slate-500 text-sm">{animal.breed} · {animal.gender} · {animal.age}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 text-xs font-semibold text-emerald-700">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Ready for adoption
                  </div>
                </div>
              </div>
            </div>

            {/* Adopter card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Adopter Information</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Name</p>
                  <p className="font-semibold text-slate-800">{appointment.adopterName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Appointment Date</p>
                  <p className="font-semibold text-slate-800">{appointment.date} at {appointment.time}</p>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase mb-4">Pre-Adoption Checklist</p>
              <div className="space-y-3">
                {[
                  'Adoption fee collected ($75)',
                  'Adoption contract signed',
                  'Microchip transfer form completed',
                  'Vaccine records provided to adopter',
                  'Adoption kit prepared (food, collar, ID tag)',
                  'Follow-up care instructions reviewed',
                ].map((item, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" defaultChecked={i < 3} className="w-4 h-4 accent-emerald-600" />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-blue-600/20 text-lg"
              >
                Continue to Confirm
              </button>
            )}

            {step === 2 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                <h3 className="font-display font-700 text-lg text-emerald-800 mb-2">Ready to finalize?</h3>
                <p className="text-emerald-700 text-sm mb-5">
                  This will mark <strong>{animal.name}</strong>'s status as <strong>Adopted</strong> and create a permanent adoption record for <strong>{appointment.adopterName}</strong>. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleComplete}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-600/25 text-lg"
                  >
                    ✓ Finalize Adoption
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 border border-slate-200 text-slate-600 hover:bg-white font-semibold py-3.5 rounded-xl transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sticky top-24">
              <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Adoption Summary</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Animal</span>
                  <span className="font-semibold text-slate-800">{animal.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Adopter</span>
                  <span className="font-semibold text-slate-800">{appointment.adopterName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date</span>
                  <span className="font-semibold text-slate-800">{new Date().toISOString().split('T')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fee</span>
                  <span className="font-semibold text-slate-800">$75.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
