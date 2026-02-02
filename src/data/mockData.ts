import { Patient, Appointment, Audiogram, User, HearingAid, PatientDevice, Invoice, Expense, StockItem } from '../types';
import { subDays, addDays, subMonths } from 'date-fns';

// Utilisateurs
export const users: User[] = [
  {
    id: '1',
    name: 'Dr. Admin',
    email: 'admin@audiocare.fr',
    password: 'password',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200',
    createdAt: new Date('2023-01-01'),
    lastLogin: new Date()
  },
  {
    id: '2',
    name: 'Dr. Martin',
    email: 'prothesiste@audiocare.fr',
    password: 'password',
    role: 'audioprothesiste',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200',
    createdAt: new Date('2023-02-15'),
    lastLogin: subDays(new Date(), 1)
  },
  {
    id: '3',
    name: 'Sophie Assistant',
    email: 'assistant@audiocare.fr',
    password: 'password',
    role: 'assistant',
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200',
    createdAt: new Date('2023-03-20'),
    lastLogin: subDays(new Date(), 2)
  }
];

export const currentUser: User = users[0];

// Patients Mock Data
export const patients: Patient[] = [
  {
    id: '1',
    firstName: 'Jean',
    lastName: 'Dupont',
    age: 72,
    dateOfBirth: '1952-05-15',
    gender: 'M',
    phone: '06 12 34 56 78',
    email: 'jean.dupont@email.com',
    address: '12 Rue des Fleurs, 75001 Paris',
    medicalHistory: 'Hypertension, Diabète type 2',
    audiologicalHistory: 'Presbyacousie bilatérale progressive depuis 5 ans',
    createdAt: subMonths(new Date(), 6),
    lastVisit: subDays(new Date(), 14)
  },
  {
    id: '2',
    firstName: 'Marie',
    lastName: 'Martin',
    age: 68,
    dateOfBirth: '1956-08-22',
    gender: 'F',
    phone: '06 98 76 54 32',
    email: 'marie.martin@email.com',
    address: '45 Avenue de la République, 69002 Lyon',
    medicalHistory: 'Aucun antécédent notable',
    audiologicalHistory: 'Acouphènes oreille gauche',
    createdAt: subMonths(new Date(), 3),
    lastVisit: subDays(new Date(), 2)
  },
  {
    id: '3',
    firstName: 'Robert',
    lastName: 'Dubois',
    age: 55,
    dateOfBirth: '1969-11-30',
    gender: 'M',
    phone: '06 11 22 33 44',
    email: 'robert.dubois@email.com',
    address: '8 Boulevard Victor Hugo, 13008 Marseille',
    medicalHistory: 'Traumatisme crânien en 1990',
    audiologicalHistory: 'Surdité brusque oreille droite',
    createdAt: subDays(new Date(), 10),
    lastVisit: subDays(new Date(), 10)
  },
  {
    id: '4',
    firstName: 'Sophie',
    lastName: 'Leroy',
    age: 80,
    dateOfBirth: '1944-03-12',
    gender: 'F',
    phone: '06 55 44 33 22',
    email: 'sophie.leroy@email.com',
    address: '22 Rue de la Paix, 33000 Bordeaux',
    medicalHistory: 'Arthrose cervicale',
    audiologicalHistory: 'Appareillée depuis 10 ans',
    createdAt: subMonths(new Date(), 24),
    lastVisit: subDays(new Date(), 30)
  },
  {
    id: '5',
    firstName: 'Pierre',
    lastName: 'Moreau',
    age: 62,
    dateOfBirth: '1962-07-08',
    gender: 'M',
    phone: '06 77 88 99 00',
    email: 'pierre.moreau@email.com',
    address: '5 Place du Commerce, 44000 Nantes',
    medicalHistory: 'Exposition au bruit professionnel',
    audiologicalHistory: 'Encoche sur 4000Hz',
    createdAt: subMonths(new Date(), 1),
    lastVisit: subDays(new Date(), 5)
  }
];

// Audiograms
export const audiograms: Audiogram[] = [
  {
    id: '1',
    patientId: '1',
    date: subMonths(new Date(), 6),
    type: 'initial',
    rightEar: {
      frequencies: [250, 500, 1000, 2000, 4000, 8000],
      airConduction: [20, 25, 30, 45, 60, 70],
      boneConduction: [10, 15, 20, 35, 50, 60]
    },
    leftEar: {
      frequencies: [250, 500, 1000, 2000, 4000, 8000],
      airConduction: [25, 30, 35, 50, 65, 75],
      boneConduction: [15, 20, 25, 40, 55, 65]
    },
    notes: 'Presbyacousie classique, pente descendante.'
  },
  {
    id: '2',
    patientId: '2',
    date: subMonths(new Date(), 3),
    type: 'initial',
    rightEar: {
      frequencies: [250, 500, 1000, 2000, 4000, 8000],
      airConduction: [10, 10, 15, 20, 25, 30],
      boneConduction: [5, 5, 10, 15, 20, 25]
    },
    leftEar: {
      frequencies: [250, 500, 1000, 2000, 4000, 8000],
      airConduction: [15, 20, 40, 50, 45, 35],
      boneConduction: [10, 15, 35, 45, 40, 30]
    },
    notes: 'Acouphènes OG, légère perte sur les médiums.'
  }
];

// Hearing Aids Catalog
export const hearingAids: HearingAid[] = [
  {
    id: '1',
    brand: 'Phonak',
    model: 'Audéo Lumity',
    technology: 'premium',
    type: 'RIC',
    price: 380000,
    features: ['Bluetooth', 'Rechargeable', 'IA Vocal', 'Étanche'],
    image: 'https://www.phonak.com/content/dam/phonak/en/hearing-aids/audeo-lumity/phonak-audeo-lumity-L90-R-champagne-hero.png'
  },
  {
    id: '2',
    brand: 'Oticon',
    model: 'Real 1',
    technology: 'premium',
    type: 'RIC',
    price: 395000,
    features: ['Réseau neuronal profond', 'Connectivité Smartphone', 'Réduction bruit vent'],
    image: 'https://wdh01.azureedge.net/-/media/oticon-us/main/products/real/oticon-real-minirite-r-olive-green.png?rev=6b6e4d4e6d4e4d4e&w=500&h=500&hash=6E6D4E4D4E4D4E4D'
  },
  {
    id: '3',
    brand: 'Starkey',
    model: 'Genesis AI',
    technology: 'ultra',
    type: 'CIC',
    price: 420000,
    features: ['Invisible', 'Suivi santé', 'Traduction instantanée', 'Détection chute'],
    image: 'https://www.starkey.com/-/media/starkey/product-images/genesis-ai/genesis-ai-cic-hero.png'
  },
  {
    id: '4',
    brand: 'Signia',
    model: 'Pure Charge&Go IX',
    technology: 'mid',
    type: 'BTE',
    price: 290000,
    features: ['Conversation en temps réel', 'Batterie 24h', 'Streaming direct'],
    image: 'https://www.signia.net/-/media/signia/global/products/hearing-aids/integrated-xperience/pure-charge-go-ix/pure-charge-go-ix-beige.png'
  },
  {
    id: '5',
    brand: 'Resound',
    model: 'Omnia',
    technology: 'basic',
    type: 'RIC',
    price: 180000,
    features: ['Son naturel', 'Application mobile', 'Design discret'],
    image: 'https://www.resound.com/-/media/resound/resound-products/omnia/resound-omnia-minirite-r-sparkling-silver.png'
  },
  {
    id: '6',
    brand: 'Widex',
    model: 'Moment Sheer',
    technology: 'premium',
    type: 'RIC',
    price: 365000,
    features: ['ZeroDelay', 'PureSound', 'Rechargeable'],
    image: 'https://www.widex.com/-/media/widex/global/hearing-aids/moment/widex-moment-sheer-sRIC-R-tech-black.png'
  }
];

// Patient Devices
export const patientDevices: PatientDevice[] = [
  {
    id: '1',
    patientId: '1',
    hearingAidId: '1',
    ear: 'both',
    dateInstalled: subMonths(new Date(), 5),
    warranty: addDays(subMonths(new Date(), 5), 365 * 4), // 4 ans garantie
    status: 'active',
    adjustments: [
      {
        id: '1',
        date: subMonths(new Date(), 5),
        notes: 'Premier réglage. Cible NAL-NL2. Gain 80%.',
        satisfaction: 4,
        issues: ['Son un peu métallique au début']
      },
      {
        id: '2',
        date: subMonths(new Date(), 4),
        notes: 'Ajustement des aigus. Activation réducteur de bruit.',
        satisfaction: 5,
        issues: []
      }
    ]
  }
];

// Appointments
export const appointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    date: addDays(new Date(), 2),
    duration: 30,
    type: 'reglage',
    status: 'planned',
    notes: 'Vérifier le confort dans le bruit'
  },
  {
    id: '2',
    patientId: '3',
    date: new Date(), // Aujourd'hui
    duration: 60,
    type: 'bilan',
    status: 'confirmed',
    notes: 'Nouveau patient, se plaint de l\'oreille droite'
  },
  {
    id: '3',
    patientId: '2',
    date: subDays(new Date(), 1),
    duration: 15,
    type: 'controle',
    status: 'completed',
    notes: 'Tout va bien'
  },
  {
    id: '4',
    patientId: '4',
    date: addDays(new Date(), 1),
    duration: 45,
    type: 'essai',
    status: 'planned',
    notes: 'Essai Oticon Real 1'
  }
];

// Invoices
export const invoices: Invoice[] = [
  {
    id: 'INV-2023-001',
    patientId: '1',
    date: subMonths(new Date(), 5),
    amount: 760000,
    status: 'paid',
    insurance: 'MGEN',
    items: [
      { description: 'Phonak Audéo Lumity (OD)', quantity: 1, unitPrice: 380000, total: 380000 },
      { description: 'Phonak Audéo Lumity (OG)', quantity: 1, unitPrice: 380000, total: 380000 }
    ]
  },
  {
    id: 'INV-2023-002',
    patientId: '1',
    date: subMonths(new Date(), 5),
    amount: 25000,
    status: 'paid',
    items: [
      { description: 'Chargeur Phonak', quantity: 1, unitPrice: 25000, total: 25000 }
    ]
  },
  {
    id: 'INV-2023-003',
    patientId: '5',
    date: subDays(new Date(), 5),
    amount: 5000,
    status: 'pending',
    items: [
      { description: 'Piles Rayovac 312 (Pack)', quantity: 5, unitPrice: 1000, total: 5000 }
    ]
  }
];

// Expenses (Dépenses)
export const expenses: Expense[] = [
  {
    id: 'EXP-2023-001',
    date: new Date(),
    category: 'loyer',
    description: 'Loyer local commercial - Janvier 2025',
    amount: 150000,
    supplier: 'Gérance Immobilière',
    status: 'payée',
    paymentMethod: 'virement',
    notes: 'Loyer mensuel du local situé au 15 Rue du Commerce'
  },
  {
    id: 'EXP-2023-002',
    date: subDays(new Date(), 5),
    category: 'salaires',
    description: 'Salaires employés - Janvier 2025',
    amount: 450000,
    status: 'payée',
    paymentMethod: 'virement',
    notes: 'Dr. Martin, Sophie Assistant'
  },
  {
    id: 'EXP-2023-003',
    date: subDays(new Date(), 7),
    category: 'fournitures',
    description: 'Commande fournitures médicales',
    amount: 45000,
    supplier: 'Medical Supply Algeria',
    status: 'payée',
    paymentMethod: 'virement',
    notes: 'Gants, compresses, désinfectant'
  },
  {
    id: 'EXP-2023-004',
    date: subDays(new Date(), 10),
    category: 'equipement',
    description: 'Maintenance audiomètre',
    amount: 35000,
    supplier: 'AudioTech Service',
    status: 'payée',
    paymentMethod: 'cheque',
    notes: 'Maintenance annuelle préventive'
  },
  {
    id: 'EXP-2023-005',
    date: subDays(new Date(), 12),
    category: 'services',
    description: 'Electricité et Internet',
    amount: 18000,
    supplier: 'Sonelgaz / Algérie Télécom',
    status: 'payée',
    paymentMethod: 'virement',
    notes: 'Facture mensuelle'
  },
  {
    id: 'EXP-2023-006',
    date: addDays(new Date(), 15),
    category: 'loyer',
    description: 'Loyer local commercial - Février 2025',
    amount: 150000,
    supplier: 'Gérance Immobilière',
    status: 'en_attente',
    paymentMethod: 'virement',
    notes: 'Loyer mensuel'
  },
  {
    id: 'EXP-2023-007',
    date: addDays(new Date(), 20),
    category: 'salaires',
    description: 'Salaires employés - Février 2025',
    amount: 450000,
    supplier: '',
    status: 'en_attente',
    paymentMethod: 'virement',
    notes: 'Prévision salaires'
  },
  {
    id: 'EXP-2023-008',
    date: subDays(new Date(), 15),
    category: 'equipement',
    description: 'Achat nouvel audiomètre',
    amount: 850000,
    supplier: 'GN Otometrics',
    status: 'annulée',
    paymentMethod: 'virement',
    notes: 'Reporté au mois prochain'
  }
];

// Stock Items (Articles en stock)
export const stockItems: StockItem[] = [
  {
    id: 'STK-001',
    name: 'Pile zinc-air 312',
    category: 'consommable',
    sku: 'PZ312-100',
    brand: 'Rayovac',
    unit: 'pack',
    quantity: 85,
    minQuantity: 20,
    maxQuantity: 100,
    purchasePrice: 800,
    salePrice: 1000,
    location: 'Étagère A1',
    supplier: 'Audio Supplies Algeria',
    lastRestock: subDays(new Date(), 5),
    notes: 'Piles taille 312, très demandées'
  },
  {
    id: 'STK-002',
    name: 'Pile zinc-air 13',
    category: 'consommable',
    sku: 'PZ13-100',
    brand: 'Rayovac',
    unit: 'pack',
    quantity: 120,
    minQuantity: 25,
    maxQuantity: 120,
    purchasePrice: 900,
    salePrice: 1200,
    location: 'Étagère A2',
    supplier: 'Audio Supplies Algeria',
    lastRestock: subDays(new Date(), 2),
    notes: 'Piles taille 13'
  },
  {
    id: 'STK-003',
    name: 'Pile zinc-air 10',
    category: 'consommable',
    sku: 'PZ10-100',
    brand: 'Rayovac',
    unit: 'pack',
    quantity: 15,
    minQuantity: 20,
    maxQuantity: 80,
    purchasePrice: 1000,
    salePrice: 1500,
    location: 'Étagère A3',
    supplier: 'Audio Supplies Algeria',
    lastRestock: subMonths(new Date(), 1),
    notes: 'Stock bas à commander'
  },
  {
    id: 'STK-004',
    name: 'Phonak Audéo Lumity',
    category: 'prothese',
    sku: 'PHN-LUM-RIC',
    brand: 'Phonak',
    unit: 'unite',
    quantity: 4,
    minQuantity: 2,
    maxQuantity: 10,
    purchasePrice: 280000,
    salePrice: 380000,
    location: 'Vitrine V1',
    supplier: 'Phonak Algeria',
    lastRestock: subDays(new Date(), 10),
    image: 'https://www.phonak.com/content/dam/phonak/en/hearing-aids/audeo-lumity/phonak-audeo-lumity-L90-R-champagne-hero.png',
    notes: 'Modèle premium, très populaire'
  },
  {
    id: 'STK-005',
    name: 'Oticon Real 1',
    category: 'prothese',
    sku: 'OTC-REAL-RIC',
    brand: 'Oticon',
    unit: 'unite',
    quantity: 3,
    minQuantity: 2,
    maxQuantity: 8,
    purchasePrice: 290000,
    salePrice: 395000,
    location: 'Vitrine V2',
    supplier: 'Oticon Algeria',
    lastRestock: subDays(new Date(), 15),
    image: 'https://wdh01.azureedge.net/-/media/oticon-us/main/products/real/oticon-real-minirite-r-olive-green.png',
    notes: 'Modèle premium'
  },
  {
    id: 'STK-006',
    name: 'Dôme ouvert (taille M)',
    category: 'accessoire',
    sku: 'DOM-M-50',
    brand: 'Universel',
    unit: 'pack',
    quantity: 45,
    minQuantity: 10,
    maxQuantity: 60,
    purchasePrice: 1500,
    salePrice: 3000,
    location: 'Tiroir T1',
    supplier: 'Audio Supplies Algeria',
    lastRestock: subDays(new Date(), 7),
    notes: 'Dômes RIC, taille moyenne'
  },
  {
    id: 'STK-007',
    name: 'Dôme fermé (taille S)',
    category: 'accessoire',
    sku: 'DOM-S-50',
    brand: 'Universel',
    unit: 'pack',
    quantity: 8,
    minQuantity: 15,
    maxQuantity: 60,
    purchasePrice: 1500,
    salePrice: 3000,
    location: 'Tiroir T1',
    supplier: 'Audio Supplies Algeria',
    lastRestock: subMonths(new Date(), 2),
    notes: 'Stock critique'
  },
  {
    id: 'STK-008',
    name: 'Télécommande RC-DEX',
    category: 'accessoire',
    sku: 'TEL-RC-DEX',
    brand: 'Phonak',
    unit: 'unite',
    quantity: 2,
    minQuantity: 1,
    maxQuantity: 5,
    purchasePrice: 35000,
    salePrice: 50000,
    location: 'Tiroir T2',
    supplier: 'Phonak Algeria',
    lastRestock: subMonths(new Date(), 3),
    notes: 'Télécommande Phonak'
  },
  {
    id: 'STK-009',
    name: 'Chargeur Com-Dry',
    category: 'equipement',
    sku: 'CHG-COM-DRY',
    brand: 'Phonak',
    unit: 'unite',
    quantity: 1,
    minQuantity: 1,
    maxQuantity: 3,
    purchasePrice: 80000,
    salePrice: 120000,
    location: 'Armoire AR1',
    supplier: 'Phonak Algeria',
    lastRestock: subMonths(new Date(), 6),
    notes: 'Chargeur et séchoir'
  },
  {
    id: 'STK-010',
    name: 'Kit de nettoyage',
    category: 'consommable',
    sku: 'NET-KIT',
    brand: 'Universel',
    unit: 'pack',
    quantity: 25,
    minQuantity: 10,
    maxQuantity: 40,
    purchasePrice: 2000,
    salePrice: 4000,
    location: 'Étagère B1',
    supplier: 'Audio Supplies Algeria',
    lastRestock: subDays(new Date(), 12),
    notes: 'Spray, chiffon, outil'
  }
];
