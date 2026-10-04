import type { AnimalStatus, ApplicationStatus, AppointmentStatus } from '../types';

const animalColors: Record<AnimalStatus, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  APPLICATION_PENDING: 'bg-amber-100 text-amber-700 border border-amber-200',
  APPROVED: 'bg-blue-100 text-blue-700 border border-blue-200',
  FOSTERED: 'bg-purple-100 text-purple-700 border border-purple-200',
  ADOPTED: 'bg-slate-100 text-slate-600 border border-slate-200',
};

const appColors: Record<ApplicationStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700 border border-amber-200',
  APPROVED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  REJECTED: 'bg-red-100 text-red-700 border border-red-200',
  WITHDRAWN: 'bg-slate-100 text-slate-500 border border-slate-200',
};

const aptColors: Record<AppointmentStatus, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700 border border-blue-200',
  COMPLETED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-700 border border-red-200',
};

const animalLabels: Record<AnimalStatus, string> = {
  AVAILABLE: 'Available',
  APPLICATION_PENDING: 'Application Pending',
  APPROVED: 'Approved',
  FOSTERED: 'In Foster Care',
  ADOPTED: 'Adopted',
};

export function AnimalStatusBadge({ status }: { status: AnimalStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold font-display ${animalColors[status]}`}>
      {status === 'AVAILABLE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />}
      {animalLabels[status]}
    </span>
  );
}

export function AppStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-display ${appColors[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export function AptStatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-display ${aptColors[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
