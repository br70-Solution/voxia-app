import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'database.sqlite'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export const initializeDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      lastLogin TEXT
    );

    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      age INTEGER,
      dateOfBirth TEXT,
      gender TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      medicalHistory TEXT,
      audiologicalHistory TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      lastVisit TEXT
    );

    CREATE TABLE IF NOT EXISTS audiograms (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      rightEar TEXT NOT NULL, -- JSON string
      leftEar TEXT NOT NULL,  -- JSON string
      notes TEXT,
      FOREIGN KEY (patientId) REFERENCES patients (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS hearing_aids (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      technology TEXT,
      type TEXT,
      price REAL,
      features TEXT, -- JSON stringify array
      image TEXT
    );

    CREATE TABLE IF NOT EXISTS patient_devices (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      hearingAidId TEXT NOT NULL,
      ear TEXT,
      dateInstalled TEXT,
      warranty TEXT,
      status TEXT,
      adjustments TEXT, -- JSON stringify array
      FOREIGN KEY (patientId) REFERENCES patients (id) ON DELETE CASCADE,
      FOREIGN KEY (hearingAidId) REFERENCES hearing_aids (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      date TEXT NOT NULL,
      duration INTEGER,
      type TEXT,
      status TEXT,
      notes TEXT,
      FOREIGN KEY (patientId) REFERENCES patients (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      date TEXT NOT NULL,
      amount REAL,
      status TEXT,
      items TEXT, -- JSON stringify array
      insurance TEXT,
      FOREIGN KEY (patientId) REFERENCES patients (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      amount REAL,
      supplier TEXT,
      status TEXT,
      paymentMethod TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS stock_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      sku TEXT,
      brand TEXT,
      unit TEXT DEFAULT 'unite',
      quantity INTEGER DEFAULT 0,
      minQuantity INTEGER DEFAULT 0,
      maxQuantity INTEGER DEFAULT 0,
      purchasePrice REAL,
      salePrice REAL,
      location TEXT,
      supplier TEXT,
      image TEXT,
      notes TEXT,
      lastRestock TEXT
    );
  `);
};

export { db };
