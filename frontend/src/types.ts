export type AnimalStatus = 'AVAILABLE' | 'APPLICATION_PENDING' | 'APPROVED' | 'FOSTERED' | 'ADOPTED';
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
export type UserRole = 'ADOPTER' | 'ADMIN';
export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface MedicalRecord {
  id: string;
  date: string;
  type: string;
  description: string;
  vet: string;
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
  password: string;
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
  notes: string;
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
  appointmentId: string;
}

export type Page =
  | 'home'
  | 'animals'
  | 'animal-profile'
  | 'login'
  | 'register'
  | 'apply'
  | 'my-applications'
  | 'schedule-appointment'
  | 'my-appointments'
  | 'my-adoption-history'
  | 'admin-dashboard'
  | 'admin-animals'
  | 'admin-medical-records'
  | 'admin-applications'
  | 'admin-appointments'
  | 'admin-complete-adoption'
  | 'admin-adoption-history';
