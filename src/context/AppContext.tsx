import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Patient, Audiogram, HearingAid, PatientDevice, Appointment, Invoice, User, Expense, StockItem } from '../types';

const API_URL = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:3001/api';

interface AppContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: Partial<User>) => Promise<void>;

  // User Management (Admin)
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

  // Auth state
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  // Data state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [audiograms, setAudiograms] = useState<Audiogram[]>([]);
  const [hearingAids, setHearingAids] = useState<HearingAid[]>([]);
  const [patientDevices, setPatientDevices] = useState<PatientDevice[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  // Function to fetch all data
  const fetchData = async () => {
    try {
      const endpoints = ['users', 'patients', 'audiograms', 'hearing-aids', 'patient-devices', 'appointments', 'invoices', 'expenses', 'stock-items'];
      const results = await Promise.all(endpoints.map(e => fetch(`${API_URL}/${e}`).then(r => r.json())));

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
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
    }
  };

  // Migration logic: move localStorage to SQLite if first time
  const migrateFromLocalStorage = async () => {
    const hasData = localStorage.getItem('patients') || localStorage.getItem('users');
    if (hasData) {
      console.log('Migration des données en cours...');
      const payload = {
        users: JSON.parse(localStorage.getItem('users') || 'null'),
        patients: JSON.parse(localStorage.getItem('patients') || 'null'),
        audiograms: JSON.parse(localStorage.getItem('audiograms') || 'null'),
        hearingAids: JSON.parse(localStorage.getItem('hearingAids') || 'null'),
        patientDevices: JSON.parse(localStorage.getItem('patientDevices') || 'null'),
        appointments: JSON.parse(localStorage.getItem('appointments') || 'null'),
        invoices: JSON.parse(localStorage.getItem('invoices') || 'null'),
        expenses: JSON.parse(localStorage.getItem('expenses') || 'null'),
        stockItems: JSON.parse(localStorage.getItem('stockItems') || 'null'),
      };

      try {
        await fetch(`${API_URL}/seed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        // Clear migration flags
        localStorage.removeItem('patients');
        localStorage.removeItem('audiograms');
        localStorage.removeItem('hearingAids');
        localStorage.removeItem('patientDevices');
        localStorage.removeItem('appointments');
        localStorage.removeItem('invoices');
        localStorage.removeItem('expenses');
        localStorage.removeItem('stockItems');
        localStorage.removeItem('users');
        console.log('Migration terminée avec succès');
      } catch (err) {
        console.error('Migration échouée:', err);
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      await migrateFromLocalStorage();
      await fetchData();
    };
    init();
  }, []);

  // Sync DarkMode and CurrentUser (minimal localStorage for session)
  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUser = async (updatedData: Partial<User>) => {
    if (currentUser) {
      await fetch(`${API_URL}/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentUser, ...updatedData })
      });
      setCurrentUser({ ...currentUser, ...updatedData });
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updatedData } : u));
    }
  };

  const addUser = async (user: User) => {
    await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    setUsers(prev => [...prev, user]);
  };

  const updateUserById = async (id: string, updatedData: Partial<User>) => {
    await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatedData } : u));
  };

  const deleteUser = async (id: string) => {
    await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const addPatient = async (patient: Patient) => {
    await fetch(`${API_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient)
    });
    setPatients(prev => [...prev, patient]);
  };

  const updatePatient = async (id: string, updatedData: Partial<Patient>) => {
    await fetch(`${API_URL}/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
  };

  const deletePatient = async (id: string) => {
    await fetch(`${API_URL}/patients/${id}`, { method: 'DELETE' });
    setPatients(prev => prev.filter(p => p.id !== id));
  };

  const addAppointment = async (appointment: Appointment) => {
    await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment)
    });
    setAppointments(prev => [...prev, appointment]);
  };

  const updateAppointment = async (id: string, updatedData: Partial<Appointment>) => {
    await fetch(`${API_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updatedData } : a));
  };

  const addAudiogram = async (audiogram: Audiogram) => {
    await fetch(`${API_URL}/audiograms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(audiogram)
    });
    setAudiograms(prev => [...prev, audiogram]);
  };

  const updateAudiogram = async (id: string, updatedData: Partial<Audiogram>) => {
    await fetch(`${API_URL}/audiograms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    setAudiograms(prev => prev.map(a => a.id === id ? { ...a, ...updatedData } : a));
  };

  const deleteAudiogram = async (id: string) => {
    await fetch(`${API_URL}/audiograms/${id}`, { method: 'DELETE' });
    setAudiograms(prev => prev.filter(a => a.id !== id));
  };

  const addHearingAid = async (hearingAid: HearingAid) => {
    await fetch(`${API_URL}/hearing-aids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hearingAid)
    });
    setHearingAids(prev => [...prev, hearingAid]);
  };

  const updateHearingAid = async (id: string, updatedData: Partial<HearingAid>) => {
    await fetch(`${API_URL}/hearing-aids/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    setHearingAids(prev => prev.map(h => h.id === id ? { ...h, ...updatedData } : h));
  };

  const deleteHearingAid = async (id: string) => {
    await fetch(`${API_URL}/hearing-aids/${id}`, { method: 'DELETE' });
    setHearingAids(prev => prev.filter(h => h.id !== id));
  };

  const addPatientDevice = async (device: PatientDevice) => {
    await fetch(`${API_URL}/patient-devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(device)
    });
    setPatientDevices(prev => [...prev, device]);
  };

  const updatePatientDevice = async (id: string, updatedData: Partial<PatientDevice>) => {
    await fetch(`${API_URL}/patient-devices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    setPatientDevices(prev => prev.map(d => d.id === id ? { ...d, ...updatedData } : d));
  };

  const deletePatientDevice = async (id: string) => {
    await fetch(`${API_URL}/patient-devices/${id}`, { method: 'DELETE' });
    setPatientDevices(prev => prev.filter(d => d.id !== id));
  };

  const addInvoice = async (invoice: Invoice) => {
    await fetch(`${API_URL}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice)
    });
    setInvoices(prev => [...prev, invoice]);
  };

  const updateInvoice = async (id: string, updatedData: Partial<Invoice>) => {
    await fetch(`${API_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updatedData } : i));
  };

  const deleteInvoice = async (id: string) => {
    await fetch(`${API_URL}/invoices/${id}`, { method: 'DELETE' });
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  const addExpense = async (expense: Expense) => {
    await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    });
    setExpenses(prev => [...prev, expense]);
  };

  const updateExpense = async (id: string, updatedData: Partial<Expense>) => {
    await fetch(`${API_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updatedData } : e));
  };

  const deleteExpense = async (id: string) => {
    await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addStockItem = async (stockItem: StockItem) => {
    await fetch(`${API_URL}/stock-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stockItem)
    });
    setStockItems(prev => [...prev, stockItem]);
  };

  const updateStockItem = async (id: string, updatedData: Partial<StockItem>) => {
    await fetch(`${API_URL}/stock-items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    setStockItems(prev => prev.map(s => s.id === id ? { ...s, ...updatedData } : s));
  };

  const deleteStockItem = async (id: string) => {
    await fetch(`${API_URL}/stock-items/${id}`, { method: 'DELETE' });
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
    if (window.confirm("Voulez-vous vraiment réinitialiser toutes les données ?")) {
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
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export const useAppContext = useApp;
