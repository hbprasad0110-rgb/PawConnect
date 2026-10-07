import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Animal, User, Application, Appointment, AdoptionRecord, Page, AnimalStatus, ApplicationStatus } from './types';
import {
  INITIAL_USERS,
  INITIAL_ANIMALS,
  INITIAL_APPLICATIONS,
  INITIAL_APPOINTMENTS,
  INITIAL_ADOPTION_HISTORY,
} from './data';

interface AppContextType {
  currentUser: User | null;
  currentPage: Page;
  selectedAnimalId: string | null;
  selectedApplicationId: string | null;
  selectedAppointmentId: string | null;
  animals: Animal[];
  applications: Application[];
  appointments: Appointment[];
  adoptionHistory: AdoptionRecord[];
  users: User[];
  loginError: string;
  navigate: (page: Page, animalId?: string, applicationId?: string, appointmentId?: string) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, password: string, phone: string, address: string) => void;
  applyForAdoption: (animalId: string, data: Omit<Application, 'id' | 'animalId' | 'adopterId' | 'adopterName' | 'adopterEmail' | 'status' | 'submittedDate'>) => void;
  approveApplication: (applicationId: string) => void;
  rejectApplication: (applicationId: string) => void;
  withdrawApplication: (applicationId: string) => void;
  scheduleAppointment: (applicationId: string, animalId: string, date: string, time: string, notes: string) => void;
  completeAppointment: (appointmentId: string) => void;
  completeAdoption: (appointmentId: string) => void;
  updateAnimalStatus: (animalId: string, status: AnimalStatus) => void;
  addAnimal: (animal: Omit<Animal, 'id' | 'medicalRecords'>) => void;
  addMedicalRecord: (animalId: string, record: Omit<import('./types').MedicalRecord, 'id'>) => void;
  setLoginError: (msg: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

let idCounter = 100;
const nextId = () => `gen${++idCounter}`;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [animals, setAnimals] = useState<Animal[]>(INITIAL_ANIMALS);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [adoptionHistory, setAdoptionHistory] = useState<AdoptionRecord[]>(INITIAL_ADOPTION_HISTORY);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [loginError, setLoginError] = useState('');

  const navigate = useCallback((page: Page, animalId?: string, applicationId?: string, appointmentId?: string) => {
    setCurrentPage(page);
    if (animalId !== undefined) setSelectedAnimalId(animalId);
    if (applicationId !== undefined) setSelectedApplicationId(applicationId);
    if (appointmentId !== undefined) setSelectedAppointmentId(appointmentId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      setLoginError('');
      return true;
    }
    setLoginError('Invalid email or password. Please try again.');
    return false;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setCurrentPage('home');
  }, []);

  const register = useCallback((name: string, email: string, password: string, phone: string, address: string) => {
    const newUser: User = {
      id: nextId(),
      name,
      email,
      password,
      role: 'ADOPTER',
      phone,
      address,
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
  }, []);

  const applyForAdoption = useCallback((animalId: string, data: Omit<Application, 'id' | 'animalId' | 'adopterId' | 'adopterName' | 'adopterEmail' | 'status' | 'submittedDate'>) => {
    if (!currentUser) return;
    const newApp: Application = {
      id: nextId(),
      animalId,
      adopterId: currentUser.id,
      adopterName: currentUser.name,
      adopterEmail: currentUser.email,
      status: 'PENDING',
      submittedDate: new Date().toISOString().split('T')[0],
      ...data,
    };
    setApplications(prev => [...prev, newApp]);
    setAnimals(prev => prev.map(a => a.id === animalId ? { ...a, status: 'APPLICATION_PENDING' as AnimalStatus } : a));
  }, [currentUser]);

  const approveApplication = useCallback((applicationId: string) => {
    setApplications(prev => prev.map(app => {
      if (app.id === applicationId) {
        const updated = { ...app, status: 'APPROVED' as ApplicationStatus, reviewedDate: new Date().toISOString().split('T')[0] };
        setAnimals(a => a.map(animal => animal.id === app.animalId ? { ...animal, status: 'APPROVED' as AnimalStatus } : animal));
        return updated;
      }
      return app;
    }));
  }, []);

  const rejectApplication = useCallback((applicationId: string) => {
    setApplications(prev => prev.map(app => {
      if (app.id === applicationId) {
        const updated = { ...app, status: 'REJECTED' as ApplicationStatus, reviewedDate: new Date().toISOString().split('T')[0] };
        const otherPending = prev.filter(a => a.animalId === app.animalId && a.id !== applicationId && a.status === 'PENDING');
        if (otherPending.length === 0) {
          setAnimals(a => a.map(animal => animal.id === app.animalId && animal.status === 'APPLICATION_PENDING' ? { ...animal, status: 'AVAILABLE' as AnimalStatus } : animal));
        }
        return updated;
      }
      return app;
    }));
  }, []);

  const withdrawApplication = useCallback((applicationId: string) => {
    setApplications(prev => prev.map(app =>
      app.id === applicationId ? { ...app, status: 'WITHDRAWN' as ApplicationStatus } : app
    ));
  }, []);

  const scheduleAppointment = useCallback((applicationId: string, animalId: string, date: string, time: string, notes: string) => {
    const app = applications.find(a => a.id === applicationId);
    if (!app || !currentUser) return;
    const animal = animals.find(a => a.id === animalId);
    const newApt: Appointment = {
      id: nextId(),
      applicationId,
      animalId,
      animalName: animal?.name ?? '',
      adopterId: currentUser.id,
      adopterName: currentUser.name,
      date,
      time,
      status: 'SCHEDULED',
      notes,
    };
    setAppointments(prev => [...prev, newApt]);
    setApplications(prev => prev.map(a => a.id === applicationId ? { ...a, appointmentId: newApt.id } : a));
  }, [applications, animals, currentUser]);

  const completeAppointment = useCallback((appointmentId: string) => {
    setAppointments(prev => prev.map(apt =>
      apt.id === appointmentId ? { ...apt, status: 'COMPLETED' as const } : apt
    ));
  }, []);

  const completeAdoption = useCallback((appointmentId: string) => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return;
    const animal = animals.find(a => a.id === apt.animalId);
    if (!animal) return;

    setAnimals(prev => prev.map(a => a.id === apt.animalId ? { ...a, status: 'ADOPTED' as AnimalStatus } : a));
    setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'COMPLETED' as const } : a));

    const record: AdoptionRecord = {
      id: nextId(),
      animalId: apt.animalId,
      animalName: animal.name,
      animalType: animal.type,
      animalBreed: animal.breed,
      animalPhoto: animal.photo,
      adopterId: apt.adopterId,
      adopterName: apt.adopterName,
      adoptionDate: new Date().toISOString().split('T')[0],
      appointmentId: appointmentId,
    };
    setAdoptionHistory(prev => [...prev, record]);
  }, [appointments, animals]);

  const updateAnimalStatus = useCallback((animalId: string, status: AnimalStatus) => {
    setAnimals(prev => prev.map(a => a.id === animalId ? { ...a, status } : a));
  }, []);

  const addAnimal = useCallback((animalData: Omit<Animal, 'id' | 'medicalRecords'>) => {
    const newAnimal: Animal = { ...animalData, id: nextId(), medicalRecords: [] };
    setAnimals(prev => [...prev, newAnimal]);
  }, []);

  const addMedicalRecord = useCallback((animalId: string, record: Omit<import('./types').MedicalRecord, 'id'>) => {
    setAnimals(prev => prev.map(a =>
      a.id === animalId
        ? { ...a, medicalRecords: [...a.medicalRecords, { ...record, id: nextId() }] }
        : a
    ));
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser, currentPage, selectedAnimalId, selectedApplicationId, selectedAppointmentId,
      animals, applications, appointments, adoptionHistory, users, loginError,
      navigate, login, logout, register,
      applyForAdoption, approveApplication, rejectApplication, withdrawApplication,
      scheduleAppointment, completeAppointment, completeAdoption,
      updateAnimalStatus, addAnimal, addMedicalRecord, setLoginError,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
