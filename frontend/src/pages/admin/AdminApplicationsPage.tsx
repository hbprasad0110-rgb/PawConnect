import { useState } from 'react';
import { useApp } from '../../AppContext';
import { AppStatusBadge, AnimalStatusBadge } from '../../components/StatusBadge';
import type { ApplicationStatus } from '../../types';

const STATUS_TABS: { label: string; value: ApplicationStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Withdrawn', value: 'WITHDRAWN' },
];

export default function AdminApplicationsPage() {
  const { applications, animals, approveApplication, rejectApplication } = useApp();
  const [filter, setFilter] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);

  const getAnimal = (id: string) => animals.find(a => a.id === id);

  const filtered = applications.filter(a => filter === 'ALL' || a.status === filter);

  const counts = {
    ALL: applications.length,
    PENDING: applications.filter(a => a.status === 'PENDING').length,
    APPROVED: applications.filter(a => a.status === 'APPROVED').length,
    REJECTED: applications.filter(a => a.status === 'REJECTED').length,
    WITHDRAWN: applications.filter(a => a.status === 'WITHDRAWN').length,
  };

  const handleAction = () => {
    if (!confirmAction) return;
    if (confirmAction.action === 'approve') approveApplication(confirmAction.id);
    else rejectApplication(confirmAction.id);
    setConfirmAction(null);
    setExpanded(null);
  };

  return (
    <div className="fade-in min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Admin</p>
          <h1 className="font-display font-800 text-2xl text-slate-900">Applications</h1>
          <p className="text-slate-500 text-sm mt-0.5">Review and manage all adoption applications.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-100 shadow-sm p-1 mb-6 w-fit">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === tab.value ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs ${filter === tab.value ? 'text-blue-200' : 'text-slate-400'}`}>
                ({counts[tab.value]})
              </span>
            </button>
          ))}
        </div>

        {/* Applications */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
              <p className="text-3xl mb-2">📋</p>
              <p>No applications in this category.</p>
            </div>
          ) : filtered.map(app => {
            const animal = getAnimal(app.animalId);
            const isExpanded = expanded === app.id;

            return (
              <div key={app.id} className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 ${isExpanded ? 'border-blue-200' : 'border-slate-100 hover:border-slate-200'}`}>
                {/* Summary row */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : app.id)}
                  className="w-full flex items-center gap-4 p-5 text-left"
                >
                  {animal && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={animal.photo} alt={animal.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-display font-700 text-slate-900">{app.adopterName}</span>
                      <span className="text-slate-300">→</span>
                      <span className="font-display font-700 text-blue-600">{animal?.name}</span>
                    </div>
                    <p className="text-xs text-slate-400">{app.adopterEmail} · Submitted {app.submittedDate}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {animal && <AnimalStatusBadge status={animal.status} />}
                    <AppStatusBadge status={app.status} />
                    <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <DetailRow label="Why they want to adopt" value={app.reason} />
                        <DetailRow label="Pet experience" value={app.experience} />
                        <DetailRow label="Living arrangement" value={app.livingArrangement} />
                        <DetailRow label="Has yard" value={app.hasYard ? 'Yes' : 'No'} />
                      </div>
                      <div className="space-y-3">
                        <DetailRow label="Has other pets" value={app.hasOtherPets ? `Yes, ${app.otherPetsDescription}` : 'No'} />
                        <DetailRow label="Employment status" value={app.employmentStatus} />
                        <DetailRow label="References" value={app.references} />
                        {app.reviewedDate && <DetailRow label="Review date" value={app.reviewedDate} />}
                      </div>
                    </div>

                    {/* Actions */}
                    {app.status === 'PENDING' && (
                      <div className="flex gap-3 pt-2 border-t border-slate-200">
                        <button
                          onClick={() => setConfirmAction({ id: app.id, action: 'approve' })}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 shadow-md shadow-emerald-600/20"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Approve Application
                        </button>
                        <button
                          onClick={() => setConfirmAction({ id: app.id, action: 'reject' })}
                          className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-6 py-2.5 rounded-xl text-sm border border-red-200 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          Reject Application
                        </button>
                      </div>
                    )}

                    {app.status === 'APPROVED' && !app.appointmentId && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                        <p className="text-amber-700 text-sm font-semibold">⏳ Awaiting adopter to schedule an appointment.</p>
                      </div>
                    )}

                    {app.status === 'APPROVED' && app.appointmentId && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                        <p className="text-blue-700 text-sm font-semibold">✅ Appointment scheduled. Check the Appointments page.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${confirmAction.action === 'approve' ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {confirmAction.action === 'approve'
                ? <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                : <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              }
            </div>
            <h3 className="font-display font-800 text-xl text-slate-900 mb-2">
              {confirmAction.action === 'approve' ? 'Approve Application?' : 'Reject Application?'}
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              {confirmAction.action === 'approve'
                ? 'The adopter will be notified and can schedule an appointment.'
                : 'The adopter will be notified that their application was not approved.'
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleAction}
                className={`flex-1 font-bold py-3 rounded-xl transition-colors ${confirmAction.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
              >
                {confirmAction.action === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-slate-700">{value}</p>
    </div>
  );
}
