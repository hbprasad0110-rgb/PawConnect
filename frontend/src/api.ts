import type { AdminSummary, AdoptionRecord, Animal, AnimalAdoptionRecord, AnimalStatusHistoryEntry, Appointment, Application, MedicalRecord, User } from './types';
import { appConfig } from './config';

export class ApiClientError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

type ApiEnvelope<T> = { data: T };
type Raw = Record<string, any>;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${appConfig.apiBase}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiClientError(
      response.status,
      payload?.error?.code || 'REQUEST_FAILED',
      payload?.error?.message || 'The request could not be completed.',
    );
  }
  return (payload as ApiEnvelope<T>).data;
}

const asId = (value: unknown) => String(value ?? '');
const asDate = (value: unknown) => value ? String(value).slice(0, 10) : '';
const status = (value: unknown) => String(value || '').toUpperCase();

const formatAge = (monthsValue: unknown) => {
  const months = Number(monthsValue || 0);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'}`;
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  return remaining ? `${years}y ${remaining}m` : `${years} year${years === 1 ? '' : 's'}`;
};

export const ageToMonths = (age: string) => {
  const value = age.trim().toLowerCase();
  const years = Number(value.match(/(\d+)\s*(?:y|year)/)?.[1] || 0);
  const months = Number(value.match(/(\d+)\s*(?:m|month)/)?.[1] || 0);
  if (years || months) return years * 12 + months;
  return Number(value.match(/\d+/)?.[0] || 0);
};

export const mapMedicalRecord = (row: Raw): MedicalRecord => ({
  id: asId(row.id),
  date: asDate(row.administeredOn),
  type: row.recordType || '',
  description: row.description || '',
  vet: row.vetName || '',
});

export const mapAnimal = (row: Raw): Animal => ({
  id: asId(row.id),
  name: row.name || '',
  type: status(row.type) as Animal['type'],
  breed: row.breed || '',
  age: formatAge(row.ageMonths),
  gender: (String(row.gender || '').toLowerCase() === 'female' ? 'Female' : 'Male'),
  status: status(row.status) as Animal['status'],
  photo: row.photoUrl || '',
  description: row.description || '',
  weight: row.weight || '',
  color: row.color || '',
  vaccinated: Boolean(row.vaccinated),
  neutered: Boolean(row.neutered),
  microchipped: Boolean(row.microchipped),
  healthSummary: row.healthSummary || '',
  medicalRecords: Array.isArray(row.medicalRecords) ? row.medicalRecords.map(mapMedicalRecord) : [],
  arrivalDate: asDate(row.arrivalDate),
  intakeReason: row.intakeReason || '',
});

export const mapUser = (row: Raw): User => ({
  id: asId(row.id),
  name: [row.firstName, row.lastName].filter(Boolean).join(' '),
  email: row.email || '',
  role: status(row.role) as User['role'],
  phone: row.phone || '',
  address: row.address || '',
});

export const mapApplication = (row: Raw): Application => ({
  id: asId(row.id),
  animalId: asId(row.animalId),
  adopterId: asId(row.userId),
  adopterName: [row.adopterFirstName, row.adopterLastName].filter(Boolean).join(' '),
  adopterEmail: row.adopterEmail || '',
  status: status(row.status) as Application['status'],
  submittedDate: asDate(row.createdAt),
  reviewedDate: asDate(row.decidedAt) || undefined,
  reason: row.reason || '',
  experience: row.experience || '',
  livingArrangement: row.livingArrangement || '',
  hasYard: Boolean(row.hasYard),
  hasOtherPets: Boolean(row.hasOtherPets),
  otherPetsDescription: row.otherPetsDescription || '',
  employmentStatus: row.employmentStatus || '',
  references: row.references || '',
});

export const mapAppointment = (row: Raw): Appointment => {
  const startsAt = new Date(row.startsAt);
  return {
    id: asId(row.id),
    applicationId: asId(row.applicationId),
    animalId: asId(row.animalId),
    animalName: row.animalName || '',
    adopterId: asId(row.userId),
    adopterName: [row.adopterFirstName, row.adopterLastName].filter(Boolean).join(' '),
    date: Number.isNaN(startsAt.getTime()) ? '' : startsAt.toLocaleDateString(),
    time: Number.isNaN(startsAt.getTime()) ? '' : startsAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    status: ['requested', 'confirmed'].includes(String(row.status).toLowerCase()) ? 'SCHEDULED' : status(row.status) as Appointment['status'],
    notes: row.notes || '',
  };
};

export const mapAdoption = (row: Raw): AdoptionRecord => ({
  id: asId(row.id),
  animalId: asId(row.animalId),
  animalName: row.animalName || '',
  animalType: status(row.animalType) as AdoptionRecord['animalType'],
  animalBreed: row.animalBreed || '',
  animalPhoto: row.animalPhotoUrl || '',
  adopterId: asId(row.userId),
  adopterName: [row.adopterFirstName, row.adopterLastName].filter(Boolean).join(' '),
  adoptionDate: asDate(row.adoptedOn),
  appointmentId: '',
});

const json = (value: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(value) });
const patch = (value?: unknown): RequestInit => ({ method: 'PATCH', ...(value === undefined ? {} : { body: JSON.stringify(value) }) });
const put = (value: unknown): RequestInit => ({ method: 'PUT', body: JSON.stringify(value) });

export const api = {
  health: () => request<{ status: string; service: string }>('/health'),
  session: () => request<Raw>('/auth/me').then(mapUser),
  login: (email: string, password: string) => request<Raw>('/auth/login', json({ email, password })).then(mapUser),
  register: (body: { name: string; email: string; password: string; phone: string; address: string }) => request<Raw>('/auth/register', json(body)).then(mapUser),
  logout: () => request('/auth/logout', { method: 'POST' }),
  profile: () => request<Raw>('/auth/profile').then(mapUser),
  updateProfile: (body: { firstName: string; lastName: string; phone: string; address: string }) => request<Raw>('/auth/profile', put(body)).then(mapUser),
  animals: (admin = false) => request<Raw[]>(admin ? '/admin/animals' : `/animals?pageSize=${appConfig.animalPageSize}`),
  adoptedAnimals: () => request<Raw[]>(`/animals?status=adopted&pageSize=${appConfig.animalPageSize}`),
  animal: (id: string) => request<Raw>(`/animals/${id}`).then(mapAnimal),
  adminAnimal: (id: string) => request<Raw>(`/admin/animals/${id}`).then(mapAnimal),
  updateAnimal: (id: string, body: unknown) => request<Raw>(`/admin/animals/${id}`, put(body)).then(mapAnimal),
  medicalRecords: (animalId: string) => request<Raw[]>(`/admin/animals/${animalId}/medical-records`).then((rows) => rows.map(mapMedicalRecord)),
  updateMedicalRecord: (id: string, body: unknown) => request<Raw>(`/admin/medical-records/${id}`, put(body)).then(mapMedicalRecord),
  myApplications: () => request<Raw[]>('/applications/mine'),
  adminApplications: () => request<Raw[]>('/admin/applications'),
  application: (id: string, admin = false) => request<Raw>(admin ? `/admin/applications/${id}` : `/applications/${id}`).then(mapApplication),
  createApplication: (body: unknown) => request('/applications', json(body)),
  decideApplication: (id: string, decision: 'approved' | 'rejected') => request(`/admin/applications/${id}/decision`, patch({ decision, decisionNote: '' })),
  withdrawApplication: (id: string) => request(`/applications/${id}/withdraw`, patch()),
  myAppointments: () => request<Raw[]>('/appointments/mine'),
  adminAppointments: () => request<Raw[]>('/admin/appointments'),
  createAppointment: (body: unknown) => request('/appointments', json(body)),
  appointmentAvailability: (date: string, animalId: string) => request<string[]>(`/appointments/availability?date=${encodeURIComponent(date)}&animalId=${encodeURIComponent(animalId)}`),
  cancelAppointment: (id: string) => request(`/appointments/${id}/cancel`, patch()),
  setAppointmentStatus: (id: string, nextStatus: 'completed' | 'cancelled' | 'confirmed') => request(`/admin/appointments/${id}/status`, patch({ status: nextStatus })),
  myAdoptions: () => request<Raw[]>('/adoptions/mine'),
  adminAdoptions: () => request<Raw[]>('/admin/adoptions'),
  adminSummary: () => request<AdminSummary>('/admin/summary'),
  animalAdoptionRecord: (animalId: string) => request<Raw>(`/admin/animals/${animalId}/adoption-record`).then((row): AnimalAdoptionRecord => ({
    id: asId(row.id), animalId: asId(row.animalId), applicationId: asId(row.applicationId), adopterId: asId(row.userId),
    adoptedOn: asDate(row.adoptedOn), notes: row.notes || '',
  })),
  animalStatusHistory: (animalId: string) => request<Raw[]>(`/admin/animals/${animalId}/status-history`).then((rows): AnimalStatusHistoryEntry[] => rows.map((row) => ({
    id: asId(row.id), animalId: asId(row.animalId), fromStatus: row.fromStatus ? status(row.fromStatus) as AnimalStatusHistoryEntry['fromStatus'] : null,
    toStatus: status(row.toStatus) as AnimalStatusHistoryEntry['toStatus'], actorUserId: asId(row.actorUserId), createdAt: String(row.createdAt || ''),
  }))),
  completeAdoption: (applicationId: string) => request(`/admin/applications/${applicationId}/complete-adoption`, json({ notes: '' })),
  setAnimalStatus: (id: string, nextStatus: 'available' | 'fostered') => request(`/admin/animals/${id}/status`, patch({ status: nextStatus })),
  addAnimal: (body: unknown) => request('/admin/animals', json(body)),
  addMedicalRecord: (animalId: string, body: unknown) => request(`/admin/animals/${animalId}/medical-records`, json(body)),
};
