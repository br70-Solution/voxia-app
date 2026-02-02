import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Patient, Audiogram, HearingAid, PatientDevice, Appointment, Invoice, User, Expense, StockItem } from '../types';
import * as mockData from '../data/mockData';

const API_URL = (import.meta as any).env.PROD
  ? '/api'
  : 'http://localhost:3001/api';

interface AppContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: Partial<User>) => Promise<void>;
  users: User[];
  addUser: (user: User) => Promise<void>;
  updateUserById: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  darkMode: boolean;
  toggleDarkMode: () => void;
  patients: Patient[];
  expenses: Expense[];
  stockItems: StockItem[];
  audiograms: Audiogram[];
  hearingAids: HearingAid[];
  patientDevices: PatientDevice[];
  appointments: Appointment[];
  invoices: Invoice[];
  isLoading: boolean;
  addPatient: (patient: Patient) => Promise<void>;
  updatePatient: (id: string, patient: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  addAppointment: (appointment: Appointment) => Promise<void>;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => Promise<void>;
  addAudiogram: (audiogram: Audiogram) => Promise<void>;
  updateAudiogram: (id: string, audiogram: Partial<Audiogram>) => Promise<void>;
  deleteAudiogram: (id: string) => Promise<void>;
  addHearingAid: (hearingAid: HearingAid) => Promise<void>;
  updateHearingAid: (id: string, hearingAid: Partial<HearingAid>) => Promise<void>;
  deleteHearingAid: (id: string) => Promise<void>;
  addPatientDevice: (device: PatientDevice) => Promise<void>;
  updatePatientDevice: (id: string, device: Partial<PatientDevice>) => Promise<void>;
  deletePatientDevice: (id: string) => Promise<void>;
  addInvoice: (invoice: Invoice) => Promise<void>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addStockItem: (stockItem: StockItem) => Promise<void>;
  updateStockItem: (id: string, stockItem: Partial<StockItem>) => Promise<void>;
  deleteStockItem: (id: string) => Promise<void>;
  restockStockItem: (id: string, quantity: number) => Promise<void>;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState<boolean>(() => JSON.parse(localStorage.getItem('darkMode') || 'false'));
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [audiograms, setAudiograms] = useState<Audiogram[]>([]);
  const [hearingAids, setHearingAids] = useState<HearingAid[]>([]);
  const [patientDevices, setPatientDevices] = useState<PatientDevice[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  // Helper for faster failure
  const fetchWithTimeout = async (url: string, options: any = {}, timeout = 3000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  };

  const loadDemoData = () => {
    console.log('Mode Démo Activé');
    setIsDemoMode(true);
    setUsers(mockData.users);
    setPatients(mockData.patients);
    setAudiograms(mockData.audiograms);
    setHearingAids(mockData.hearingAids);
    setPatientDevices(mockData.patientDevices);
    setAppointments(mockData.appointments);
    setInvoices(mockData.invoices);
    setExpenses(mockData.expenses);
    setStockItems(mockData.stockItems);
    setIsLoading(false);
  };

  const fetchData = async () => {
    try {
      const endpoints = ['users', 'patients', 'audiograms', 'hearing-aids', 'patient-devices', 'appointments', 'invoices', 'expenses', 'stock-items'];
      const results = await Promise.all(
        endpoints.map(e =>
          fetchWithTimeout(`${API_URL}/${e}`).then(r => {
            if (!r.ok) throw new Error('API Error');
            return r.json();
          })
        )
      );

      setUsers(results[0]);
      setPatients(results[1]);
      setAudiograms(results[2]);
      setHearingAids(results[3]);
      setPatientDevices(results[4]);
      setAppointments(results[5]);
      setInvoices(results[6]);
      setExpenses(results[7]);
      setStockItems(results[8]);
      setIsLoading(false);
    } catch (err: any) {
      console.warn('Serveur non disponible, passage en mode démo:', err.message);
      loadDemoData();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    if (isDemoMode) {
      const user = mockData.users.find(u => u.email === email && u.password === pass);
      if (user) {
        setCurrentUser(user);
        return true;
      }
      return false;
    }

    try {
      const res = await fetchWithTimeout(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      }, 4000);

      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        return true;
      }
    } catch (err: any) {
      console.warn('Erreur login API, essai MockData:', err.message);
      const user = mockData.users.find(u => u.email === email && u.password === pass);
      if (user) {
        setCurrentUser(user);
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUser = async (updatedData: Partial<User>) => {
    if (currentUser) {
      if (!isDemoMode) {
        fetch(`${API_URL}/users/${currentUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...currentUser, ...updatedData })
        }).catch(() => { });
      }
      setCurrentUser({ ...currentUser, ...updatedData });
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updatedData } : u));
    }
  };

  const addUser = async (user: User) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      }).catch(() => { });
    }
    setUsers(prev => [...prev, user]);
  };

  const updateUserById = async (id: string, updatedData: Partial<User>) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      }).catch(() => { });
    }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatedData } : u));
  };

  const deleteUser = async (id: string) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/users/${id}`, { method: 'DELETE' }).catch(() => { });
    }
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const addPatient = async (patient: Patient) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient)
      }).catch(() => { });
    }
    setPatients(prev => [...prev, patient]);
  };

  const updatePatient = async (id: string, updatedData: Partial<Patient>) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      }).catch(() => { });
    }
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
  };

  const deletePatient = async (id: string) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/patients/${id}`, { method: 'DELETE' }).catch(() => { });
    }
    setPatients(prev => prev.filter(p => p.id !== id));
  };

  const addAppointment = async (appointment: Appointment) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment)
      }).catch(() => { });
    }
    setAppointments(prev => [...prev, appointment]);
  };

  const updateAppointment = async (id: string, updatedData: Partial<Appointment>) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      }).catch(() => { });
    }
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updatedData } : a));
  };

  const addAudiogram = async (audiogram: Audiogram) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/audiograms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(audiogram)
      }).catch(() => { });
    }
    setAudiograms(prev => [...prev, audiogram]);
  };

  const updateAudiogram = async (id: string, updatedData: Partial<Audiogram>) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/audiograms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      }).catch(() => { });
    }
    setAudiograms(prev => prev.map(a => a.id === id ? { ...a, ...updatedData } : a));
  };

  const deleteAudiogram = async (id: string) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/audiograms/${id}`, { method: 'DELETE' }).catch(() => { });
    }
    setAudiograms(prev => prev.filter(a => a.id !== id));
  };

  const addHearingAid = async (hearingAid: HearingAid) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/hearing-aids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hearingAid)
      }).catch(() => { });
    }
    setHearingAids(prev => [...prev, hearingAid]);
  };

  const updateHearingAid = async (id: string, updatedData: Partial<HearingAid>) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/hearing-aids/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      }).catch(() => { });
    }
    setHearingAids(prev => prev.map(h => h.id === id ? { ...h, ...updatedData } : h));
  };

  const deleteHearingAid = async (id: string) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/hearing-aids/${id}`, { method: 'DELETE' }).catch(() => { });
    }
    setHearingAids(prev => prev.filter(h => h.id !== id));
  };

  const addPatientDevice = async (device: PatientDevice) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/patient-devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(device)
      }).catch(() => { });
    }
    setPatientDevices(prev => [...prev, device]);
  };

  const updatePatientDevice = async (id: string, updatedData: Partial<PatientDevice>) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/patient-devices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      }).catch(() => { });
    }
    setPatientDevices(prev => prev.map(d => d.id === id ? { ...d, ...updatedData } : d));
  };

  const deletePatientDevice = async (id: string) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/patient-devices/${id}`, { method: 'DELETE' }).catch(() => { });
    }
    setPatientDevices(prev => prev.filter(d => d.id !== id));
  };

  const addInvoice = async (invoice: Invoice) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice)
      }).catch(() => { });
    }
    setInvoices(prev => [...prev, invoice]);
  };

  const updateInvoice = async (id: string, updatedData: Partial<Invoice>) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      }).catch(() => { });
    }
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updatedData } : i));
  };

  const deleteInvoice = async (id: string) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/invoices/${id}`, { method: 'DELETE' }).catch(() => { });
    }
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  const addExpense = async (expense: Expense) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      }).catch(() => { });
    }
    setExpenses(prev => [...prev, expense]);
  };

  const updateExpense = async (id: string, updatedData: Partial<Expense>) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      }).catch(() => { });
    }
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updatedData } : e));
  };

  const deleteExpense = async (id: string) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' }).catch(() => { });
    }
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addStockItem = async (stockItem: StockItem) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/stock-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockItem)
      }).catch(() => { });
    }
    setStockItems(prev => [...prev, stockItem]);
  };

  const updateStockItem = async (id: string, updatedData: Partial<StockItem>) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/stock-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      }).catch(() => { });
    }
    setStockItems(prev => prev.map(s => s.id === id ? { ...s, ...updatedData } : s));
  };

  const deleteStockItem = async (id: string) => {
    if (!isDemoMode) {
      fetch(`${API_URL}/stock-items/${id}`, { method: 'DELETE' }).catch(() => { });
    }
    setStockItems(prev => prev.filter(s => s.id !== id));
  };

  const restockStockItem = async (id: string, quantity: number) => {
    const item = stockItems.find(s => s.id === id);
    if (item) {
      const updated = { ...item, quantity: item.quantity + quantity, lastRestock: new Date() };
      await updateStockItem(id, updated);
    }
  };

  const clearAllData = () => {
    if (window.confirm("Réinitialiser ?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser, login, logout, updateUser,
        users, addUser, updateUserById, deleteUser,
        darkMode, toggleDarkMode,
        patients, expenses, stockItems, audiograms, hearingAids,
        patientDevices, appointments, invoices, isLoading,
        addPatient, updatePatient, deletePatient,
        addAppointment, updateAppointment,
        addAudiogram, updateAudiogram, deleteAudiogram,
        addHearingAid, updateHearingAid, deleteHearingAid,
        addPatientDevice, updatePatientDevice, deletePatientDevice,
        addInvoice, updateInvoice, deleteInvoice,
        addExpense, updateExpense, deleteExpense,
        addStockItem, updateStockItem, deleteStockItem,
        restockStockItem, clearAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export const useAppContext = useApp;
