export type UserRole = 'admin' | 'audioprothesiste' | 'assistant';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Pour la simulation
  role: UserRole;
  avatar?: string;
  createdAt?: Date;
  lastLogin?: Date;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  dateOfBirth?: string;
  gender: 'M' | 'F';
  phone: string;
  email: string;
  address: string;
  medicalHistory: string;
  audiologicalHistory: string;
  createdAt: Date;
  lastVisit?: Date;
}

export interface Audiogram {
  id: string;
  patientId: string;
  date: Date;
  type: 'initial' | 'controle' | 'post-appareillage';
  rightEar: AudiometricData;
  leftEar: AudiometricData;
  notes: string;
}

export interface AudiometricData {
  frequencies: number[]; // 125, 250, 500, 1000, 2000, 4000, 8000 Hz
  airConduction: number[];
  boneConduction: number[];
}

export interface HearingAid {
  id: string;
  brand: string;
  model: string;
  technology: 'basic' | 'mid' | 'premium' | 'ultra';
  type: 'RIC' | 'BTE' | 'CIC' | 'ITC' | 'ITE' | 'BAHA';
  price: number;
  features: string[];
  image?: string;
}

export interface PatientDevice {
  id: string;
  patientId: string;
  hearingAidId: string;
  ear: 'left' | 'right' | 'both';
  dateInstalled: Date;
  warranty: Date;
  status: 'active' | 'maintenance' | 'replaced';
  adjustments: Adjustment[];
}

export interface Adjustment {
  id: string;
  date: Date;
  notes: string;
  satisfaction: number; // 1-5
  issues: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  date: Date;
  duration: number; // minutes
  type: 'bilan' | 'essai' | 'reglage' | 'controle' | 'suivi';
  status: 'planned' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  date: Date;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  items: InvoiceItem[];
  insurance?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Statistics {
  totalPatients: number;
  newPatientsThisMonth: number;
  appointmentsThisWeek: number;
  revenue: number;
  satisfactionRate: number;
  mostUsedDevices: { brand: string; count: number }[];
}

export interface Expense {
  id: string;
  date: Date;
  category: 'loyer' | 'salaires' | 'fournitures' | 'equipement' | 'maintenance' | 'services' | 'autres';
  description: string;
  amount: number;
  supplier?: string;
  status: 'payée' | 'en_attente' | 'annulée';
  paymentMethod?: 'especes' | 'cheque' | 'virement' | 'carte';
  notes?: string;
}

export interface StockItem {
  id: string;
  name: string;
  category: 'prothese' | 'accessoire' | 'consommable' | 'equipement';
  sku?: string;
  brand?: string;
  unit: 'unite' | 'paires' | 'pack';
  quantity: number;
  minQuantity: number; // Seuil d'alerte
  maxQuantity: number;
  purchasePrice: number; // Prix d'achat unitaire
  salePrice: number; // Prix de vente unitaire
  location?: string; // Emplacement dans le stock
  supplier?: string;
  image?: string;
  notes?: string;
  lastRestock?: Date;
}
