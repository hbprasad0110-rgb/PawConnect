export type AnimalStatus = 'AVAILABLE' | 'APPLICATION_PENDING' | 'APPROVED' | 'FOSTERED' | 'ADOPTED';
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN' | 'COMPLETED';
export type UserRole = 'ADOPTER' | 'ADMIN';
export type AppointmentStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface MedicalRecord {
  id: string;
  date: string;
  type: string;
  description: string;
  vet: string;
  vaccination: string;
  healthStatus: string;
  treatment: string;
  notes: string;
}

export interface Animal {
  id: string;
  name: string;
  type: 'DOG' | 'CAT';
  breed: string;
  age: string;
  gender: 'Male' | 'Female';
  status: AnimalStatus;
  photo: string;
  description: string;
  weight: string;
  color: string;
  vaccinated: boolean;
  neutered: boolean;
  microchipped: boolean;
  healthSummary: string;
  medicalRecords: MedicalRecord[];
  arrivalDate: string;
  intakeReason: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address: string;
}

export interface Application {
  id: string;
  animalId: string;
  adopterId: string;
  adopterName: string;
  adopterEmail: string;
  status: ApplicationStatus;
  submittedDate: string;
  reviewedDate?: string;
  decisionNote: string;
  reason: string;
  experience: string;
  livingArrangement: string;
  hasYard: boolean;
  hasOtherPets: boolean;
  otherPetsDescription: string;
  employmentStatus: string;
  references: string;
  appointmentId?: string;
}

export interface Appointment {
  id: string;
  applicationId: string;
  animalId: string;
  animalName: string;
  adopterId: string;
  adopterName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  purpose: string;
  notes: string;
}

export interface PublicSummary {
  animalsRehomed: number;
  availableAnimals: number;
  animalsInFosterCare: number;
  veterinaryPartners: number;
  adoptionsThisMonth: number;
}

export interface AdoptionRecord {
  id: string;
  animalId: string;
  animalName: string;
  animalType: 'DOG' | 'CAT';
  animalBreed: string;
  animalPhoto: string;
  adopterId: string;
  adopterName: string;
  adoptionDate: string;
  applicationId: string;
  completedBy: string;
  notes: string;
}

export interface AnimalSearchFilters {
  search?: string;
  type?: 'dog' | 'cat';
  breed?: string;
  gender?: 'male' | 'female';
  status?: string;
  minAgeMonths?: number;
  maxAgeMonths?: number;
  page?: number;
  pageSize?: number;
  includeAdopted?: boolean;
}

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface AdminSummary {
  totalAnimals: number;
  availableAnimals: number;
  pendingApplications: number;
  upcomingAppointments: number;
  completedAdoptions: number;
}

export interface AnimalStatusHistoryEntry {
  id: string;
  animalId: string;
  fromStatus: AnimalStatus | null;
  toStatus: AnimalStatus;
  actorUserId: string;
  notes: string;
  createdAt: string;
}

export interface AnimalAdoptionRecord {
  id: string;
  animalId: string;
  applicationId: string;
  adopterId: string;
  adoptedOn: string;
  notes: string;
}

export type Page =
  | 'home'
  | 'animals'
  | 'animal-profile'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password'
  | 'apply'
  | 'my-applications'
  | 'schedule-appointment'
  | 'my-appointments'
  | 'my-adoption-history'
  | 'profile'
  | 'admin-dashboard'
  | 'admin-animals'
  | 'admin-animal-edit'
  | 'admin-medical-records'
  | 'admin-applications'
  | 'admin-appointments'
  | 'admin-complete-adoption'
  | 'admin-adoption-history';
