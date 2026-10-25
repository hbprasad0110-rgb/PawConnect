import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { AdminSummary, AdoptionRecord, Animal, AnimalAdoptionRecord, AnimalSearchFilters, AnimalStatus, AnimalStatusHistoryEntry, Appointment, Application, MedicalRecord, Page, PageMeta, PublicSummary, User } from './types';
import { ageToMonths, api, ApiClientError, mapAdoption, mapApplication, mapAppointment } from './api';
import { PAGE_PATHS, landingPath, pageFromPath, pathFor, paramsFromPath } from './routes';

type ApplicationDraft = Omit<Application, 'id' | 'animalId' | 'adopterId' | 'adopterName' | 'adopterEmail' | 'status' | 'submittedDate' | 'decisionNote'>;

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
  adminSummary: AdminSummary | null;
  publicSummary: PublicSummary | null;
  loginError: string;
  appError: string;
  isLoading: boolean;
  navigate: (page: Page, animalId?: string, applicationId?: string, appointmentId?: string) => void;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, phone: string, address: string) => Promise<boolean>;
  applyForAdoption: (animalId: string, data: ApplicationDraft) => Promise<boolean>;
  approveApplication: (applicationId: string, decisionNote: string) => Promise<boolean>;
  rejectApplication: (applicationId: string, decisionNote: string) => Promise<boolean>;
  withdrawApplication: (applicationId: string) => Promise<boolean>;
  scheduleAppointment: (applicationId: string, animalId: string, date: string, time: string, purpose: string, notes: string) => Promise<boolean>;
  completeAppointment: (appointmentId: string) => Promise<boolean>;
  confirmAppointment: (appointmentId: string) => Promise<boolean>;
  cancelAdminAppointment: (appointmentId: string) => Promise<boolean>;
  completeAdoption: (appointmentId: string, adoptedOn: string, notes: string) => Promise<boolean>;
  updateAnimalStatus: (animalId: string, status: AnimalStatus) => Promise<boolean>;
  addAnimal: (animal: Omit<Animal, 'id' | 'medicalRecords'>) => Promise<boolean>;
  updateAnimal: (animalId: string, animal: Omit<Animal, 'id' | 'medicalRecords' | 'status'>) => Promise<boolean>;
  getAdminAnimal: (animalId: string) => Promise<Animal | null>;
  addMedicalRecord: (animalId: string, record: Omit<MedicalRecord, 'id'>) => Promise<boolean>;
  updateMedicalRecord: (record: MedicalRecord) => Promise<boolean>;
  getMedicalRecords: (animalId: string) => Promise<MedicalRecord[]>;
  getApplicationDetails: (applicationId: string) => Promise<Application | null>;
  getAppointmentAvailability: (date: string, animalId: string) => Promise<string[]>;
  cancelAppointment: (appointmentId: string) => Promise<boolean>;
  getProfile: () => Promise<User | null>;
  updateProfile: (profile: { firstName: string; lastName: string; phone: string; address: string }) => Promise<boolean>;
  getAnimalAudit: (animalId: string) => Promise<{ adoption: AnimalAdoptionRecord | null; history: AnimalStatusHistoryEntry[] }>;
  searchAnimals: (filters: AnimalSearchFilters) => Promise<{ items: Animal[]; meta: PageMeta }>;
  searchAdminApplications: (status?: string) => Promise<Application[]>;
  searchAdminAppointments: (filters: { status?: string; date?: string; animalId?: string }) => Promise<Appointment[]>;
  setLoginError: (message: string) => void;
  clearAppError: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const errorMessage = (error: unknown) =>
  error instanceof ApiClientError ? error.message : 'Unable to reach the PawConnect API. Check that npm run dev is running.';

const appointmentDateTime = (date: string, time: string) => {
  const match = time.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/i);
  if (!match) throw new Error('Invalid appointment time.');
  let hour = Number(match[1]);
  if (match[3].toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (match[3].toUpperCase() === 'AM' && hour === 12) hour = 0;
  return new Date(`${date}T${String(hour).padStart(2, '0')}:${match[2]}:00`).toISOString();
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const location = useLocation();
  const routerNavigate = useNavigate();
  const navigateRef = useRef(routerNavigate);
  useEffect(() => { navigateRef.current = routerNavigate; }, [routerNavigate]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [adoptionHistory, setAdoptionHistory] = useState<AdoptionRecord[]>([]);
  const [adminSummary, setAdminSummary] = useState<AdminSummary | null>(null);
  const [publicSummary, setPublicSummary] = useState<PublicSummary | null>(null);
  const [loginError, setLoginError] = useState('');
  const [appError, setAppError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // The URL decides which screen is open and which animal, application or appointment it is about.
  const currentPage = pageFromPath(location.pathname) ?? 'home';
  const routeIds = paramsFromPath(location.pathname);
  const selectedApplicationId = routeIds.applicationId ?? null;
  const selectedAppointmentId = routeIds.appointmentId ?? null;
  const selectedAnimalId = routeIds.animalId
    ?? applications.find((application) => application.id === selectedApplicationId)?.animalId
    ?? appointments.find((appointment) => appointment.id === selectedAppointmentId)?.animalId
    ?? null;

  useEffect(() => {
    const handleUnauthorized = () => {
      if (!currentUser) return;
      setCurrentUser(null);
      setApplications([]);
      setAppointments([]);
      setAdoptionHistory([]);
      setAdminSummary(null);
      setAppError('Your session expired. Please sign in again.');
      navigateRef.current(PAGE_PATHS.login, { replace: true });
    };
    window.addEventListener('pawconnect:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('pawconnect:unauthorized', handleUnauthorized);
  }, [currentUser]);

  const loadAnimals = useCallback(async (admin = false) => {
    const rows = await api.animals(admin);
    const detailed = await Promise.all(rows.map((row) => api.animal(String(row.id))));
    setAnimals(detailed);
  }, []);

  const refreshForUser = useCallback(async (user: User) => {
    const admin = user.role === 'ADMIN';
    const [applicationRows, appointmentRows, adoptionRows, summary] = await Promise.all([
      admin ? api.adminApplications() : api.myApplications(),
      admin ? api.adminAppointments() : api.myAppointments(),
      admin ? api.adminAdoptions() : api.myAdoptions(),
      admin ? api.adminSummary() : Promise.resolve(null),
      loadAnimals(admin),
    ]);
    const mappedAppointments = appointmentRows.map(mapAppointment);
    setAppointments(mappedAppointments);
    setApplications(applicationRows.map(mapApplication).map((application) => ({
      ...application,
      appointmentId: mappedAppointments.find((appointment) => appointment.applicationId === application.id)?.id,
    })));
    setAdoptionHistory(adoptionRows.map(mapAdoption));
    setAdminSummary(summary);
  }, [loadAnimals]);

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      try {
        await api.health();
        setPublicSummary(await api.publicSummary());
        const user = await api.session();
        if (!active) return;
        setCurrentUser(user);
        await refreshForUser(user);
        // An admin who opens the site at the root lands on the dashboard.
        if (user.role === 'ADMIN' && window.location.pathname === PAGE_PATHS.home) navigateRef.current(landingPath(user), { replace: true });
      } catch (error) {
        if (!active) return;
        if (!(error instanceof ApiClientError && error.status === 401)) setAppError(errorMessage(error));
        await loadAnimals(false).catch((loadError) => setAppError(errorMessage(loadError)));
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void initialize();
    return () => { active = false; };
  }, [loadAnimals, refreshForUser]);

  const navigate = useCallback((page: Page, animalId?: string, applicationId?: string, appointmentId?: string) => {
    navigateRef.current(pathFor(page, { animalId, applicationId, appointmentId }));
  }, []);

  const runAndRefresh = useCallback(async (operation: () => Promise<unknown>) => {
    setAppError('');
    try {
      await operation();
      if (currentUser) await refreshForUser(currentUser);
      return true;
    } catch (error) {
      setAppError(errorMessage(error));
      return false;
    }
  }, [currentUser, refreshForUser]);

  const login = useCallback(async (email: string, password: string) => {
    setLoginError('');
    try {
      const user = await api.login(email, password);
      await refreshForUser(user); // load the data first so the page they land on is not empty
      setCurrentUser(user);
      return user;
    } catch (error) {
      setLoginError(errorMessage(error));
      return null;
    }
  }, [refreshForUser]);

  const logout = useCallback(async () => {
    // Leave the page first, so the page guard does not bounce a signed-out user to the login screen.
    navigateRef.current(PAGE_PATHS.home, { replace: true });
    try { await api.logout(); } catch { /* The local session is cleared even if already expired. */ }
    setCurrentUser(null);
    setApplications([]);
    setAppointments([]);
    setAdoptionHistory([]);
    setAdminSummary(null);
    await loadAnimals(false).catch((error) => setAppError(errorMessage(error)));
  }, [loadAnimals]);

  const register = useCallback(async (name: string, email: string, password: string, phone: string, address: string) => {
    setAppError('');
    try {
      const user = await api.register({ name, email, password, phone, address });
      setCurrentUser(user);
      await refreshForUser(user);
      return true;
    } catch (error) {
      setAppError(errorMessage(error));
      return false;
    }
  }, [refreshForUser]);

  const applyForAdoption = useCallback((animalId: string, data: ApplicationDraft) => runAndRefresh(() =>
    api.createApplication({ animalId: Number(animalId), ...data })
  ), [runAndRefresh]);

  const approveApplication = useCallback((id: string, decisionNote: string) => runAndRefresh(() => api.decideApplication(id, 'approved', decisionNote)), [runAndRefresh]);
  const rejectApplication = useCallback((id: string, decisionNote: string) => runAndRefresh(() => api.decideApplication(id, 'rejected', decisionNote)), [runAndRefresh]);
  const withdrawApplication = useCallback((id: string) => runAndRefresh(() => api.withdrawApplication(id)), [runAndRefresh]);

  const scheduleAppointment = useCallback((applicationId: string, _animalId: string, date: string, time: string, purpose: string, notes: string) =>
    runAndRefresh(() => api.createAppointment({ applicationId: Number(applicationId), startsAt: appointmentDateTime(date, time), purpose, notes })), [runAndRefresh]);

  const completeAppointment = useCallback((id: string) => runAndRefresh(() => api.setAppointmentStatus(id, 'completed')), [runAndRefresh]);
  const confirmAppointment = useCallback((id: string) => runAndRefresh(() => api.setAppointmentStatus(id, 'confirmed')), [runAndRefresh]);
  const cancelAdminAppointment = useCallback((id: string) => runAndRefresh(() => api.setAppointmentStatus(id, 'cancelled')), [runAndRefresh]);

  const completeAdoption = useCallback((appointmentId: string, adoptedOn: string, notes: string) => {
    const appointment = appointments.find((item) => item.id === appointmentId);
    if (!appointment) {
      setAppError('Appointment not found.');
      return Promise.resolve(false);
    }
    return runAndRefresh(() => api.completeAdoption(appointment.applicationId, { adoptedOn, notes }));
  }, [appointments, runAndRefresh]);

  const updateAnimalStatus = useCallback((animalId: string, nextStatus: AnimalStatus) => {
    if (!['AVAILABLE', 'FOSTERED'].includes(nextStatus)) {
      setAppError('Application and adoption statuses are changed through their workflows.');
      return Promise.resolve(false);
    }
    return runAndRefresh(() => api.setAnimalStatus(animalId, nextStatus.toLowerCase() as 'available' | 'fostered'));
  }, [runAndRefresh]);

  const addAnimal = useCallback((animal: Omit<Animal, 'id' | 'medicalRecords'>) => runAndRefresh(() => api.addAnimal({
    name: animal.name,
    type: animal.type.toLowerCase(),
    breed: animal.breed,
    ageMonths: ageToMonths(animal.age),
    gender: animal.gender.toLowerCase(),
    description: animal.description || 'No description provided.',
    photoUrl: animal.photo || null,
    weight: animal.weight || null,
    color: animal.color || null,
    vaccinated: animal.vaccinated,
    neutered: animal.neutered,
    microchipped: animal.microchipped,
    healthSummary: animal.healthSummary || null,
    arrivalDate: animal.arrivalDate || null,
    intakeReason: animal.intakeReason || null,
  })), [runAndRefresh]);

  const updateAnimal = useCallback((animalId: string, animal: Omit<Animal, 'id' | 'medicalRecords' | 'status'>) => runAndRefresh(() => api.updateAnimal(animalId, {
    name: animal.name,
    type: animal.type.toLowerCase(),
    breed: animal.breed,
    ageMonths: ageToMonths(animal.age),
    gender: animal.gender.toLowerCase(),
    description: animal.description || 'No description provided.',
    photoUrl: animal.photo || null,
    weight: animal.weight || null,
    color: animal.color || null,
    vaccinated: animal.vaccinated,
    neutered: animal.neutered,
    microchipped: animal.microchipped,
    healthSummary: animal.healthSummary || null,
    arrivalDate: animal.arrivalDate || null,
    intakeReason: animal.intakeReason || null,
  })), [runAndRefresh]);

  const addMedicalRecord = useCallback((animalId: string, record: Omit<MedicalRecord, 'id'>) => runAndRefresh(() => api.addMedicalRecord(animalId, {
    recordType: record.type,
    description: record.description,
    administeredOn: record.date,
    vetName: record.vet || null,
    vaccination: record.vaccination || null,
    healthStatus: record.healthStatus || null,
    treatment: record.treatment || null,
    notes: record.notes || null,
  })), [runAndRefresh]);

  const updateMedicalRecord = useCallback((record: MedicalRecord) => runAndRefresh(() => api.updateMedicalRecord(record.id, {
    recordType: record.type,
    description: record.description,
    administeredOn: record.date,
    vetName: record.vet || null,
    vaccination: record.vaccination || null,
    healthStatus: record.healthStatus || null,
    treatment: record.treatment || null,
    notes: record.notes || null,
  })), [runAndRefresh]);

  const getAdminAnimal = useCallback(async (animalId: string) => {
    try { return await api.adminAnimal(animalId); }
    catch (error) { setAppError(errorMessage(error)); return null; }
  }, []);

  const getMedicalRecords = useCallback(async (animalId: string) => {
    try { return await api.medicalRecords(animalId); }
    catch (error) { setAppError(errorMessage(error)); return []; }
  }, []);

  const getApplicationDetails = useCallback(async (applicationId: string) => {
    try { return await api.application(applicationId, currentUser?.role === 'ADMIN'); }
    catch (error) { setAppError(errorMessage(error)); return null; }
  }, [currentUser?.role]);

  const getAppointmentAvailability = useCallback(async (date: string, animalId: string) => {
    try { return await api.appointmentAvailability(date, animalId); }
    catch (error) { setAppError(errorMessage(error)); return []; }
  }, []);

  const cancelAppointment = useCallback((appointmentId: string) => runAndRefresh(() => api.cancelAppointment(appointmentId)), [runAndRefresh]);

  const getProfile = useCallback(async () => {
    try {
      const user = await api.profile();
      setCurrentUser(user);
      return user;
    } catch (error) {
      setAppError(errorMessage(error));
      return null;
    }
  }, []);

  const updateProfile = useCallback(async (profile: { firstName: string; lastName: string; phone: string; address: string }) => {
    setAppError('');
    try {
      const user = await api.updateProfile(profile);
      setCurrentUser(user);
      return true;
    } catch (error) {
      setAppError(errorMessage(error));
      return false;
    }
  }, []);

  const getAnimalAudit = useCallback(async (animalId: string) => {
    try {
      const [history, adoption] = await Promise.all([
        api.animalStatusHistory(animalId),
        api.animalAdoptionRecord(animalId).catch((error) => {
          if (error instanceof ApiClientError && error.status === 404) return null;
          throw error;
        }),
      ]);
      return { history, adoption };
    } catch (error) {
      setAppError(errorMessage(error));
      return { history: [], adoption: null };
    }
  }, []);

  const searchAnimals = useCallback(async (filters: AnimalSearchFilters) => {
    try { return await api.searchAnimals(filters); }
    catch (error) {
      setAppError(errorMessage(error));
      return { items: [], meta: { page: filters.page || 1, pageSize: filters.pageSize || 9, total: 0 } };
    }
  }, []);

  const searchAdminApplications = useCallback(async (statusFilter?: string) => {
    try { return (await api.adminApplications(statusFilter)).map(mapApplication); }
    catch (error) { setAppError(errorMessage(error)); return []; }
  }, []);

  const searchAdminAppointments = useCallback(async (filters: { status?: string; date?: string; animalId?: string }) => {
    try { return (await api.adminAppointments(filters)).map(mapAppointment); }
    catch (error) { setAppError(errorMessage(error)); return []; }
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser, currentPage, selectedAnimalId, selectedApplicationId, selectedAppointmentId,
      animals, applications, appointments, adoptionHistory, adminSummary, publicSummary,
      loginError, appError, isLoading,
      navigate, login, logout, register, applyForAdoption, approveApplication, rejectApplication,
      withdrawApplication, scheduleAppointment, completeAppointment, confirmAppointment, cancelAdminAppointment, completeAdoption,
      updateAnimalStatus, addAnimal, updateAnimal, getAdminAnimal, addMedicalRecord, updateMedicalRecord,
      getMedicalRecords, getApplicationDetails, getAppointmentAvailability, cancelAppointment,
      getProfile, updateProfile, getAnimalAudit, searchAnimals, searchAdminApplications, searchAdminAppointments, setLoginError,
      clearAppError: () => setAppError(''),
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
