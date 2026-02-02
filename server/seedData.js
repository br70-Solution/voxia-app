export const users = [
    {
        id: '1',
        name: 'Dr. Admin',
        email: 'admin@audiocare.fr',
        password: 'password',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200',
        createdAt: '2023-01-01',
        lastLogin: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Dr. Martin',
        email: 'prothesiste@audiocare.fr',
        password: 'password',
        role: 'audioprothesiste',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200',
        createdAt: '2023-02-15',
        lastLogin: new Date().toISOString()
    }
];

export const patients = [
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
        createdAt: '2024-01-15'
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
        createdAt: '2024-05-10'
    }
];

export const hearingAids = [
    {
        id: '1',
        brand: 'Phonak',
        model: 'Audéo Lumity',
        technology: 'premium',
        type: 'RIC',
        price: 380000,
        features: ['Bluetooth', 'Rechargeable', 'IA Vocal', 'Étanche'],
        image: 'https://images.unsplash.com/photo-1590611380053-da6447011f0a?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: '2',
        brand: 'Oticon',
        model: 'Real 1',
        technology: 'premium',
        type: 'RIC',
        price: 395000,
        features: ['Réseau neuronal profond', 'Connectivité Smartphone', 'Réduction bruit vent'],
        image: 'https://images.unsplash.com/photo-1590611380053-da6447011f0a?auto=format&fit=crop&q=80&w=400'
    }
];

export const stockItems = [
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
        supplier: 'Audio Supplies Algeria'
    }
];

export const expenses = [
    {
        id: 'EXP-1',
        date: '2024-01-10',
        category: 'loyer',
        description: 'Loyer local',
        amount: 150000,
        status: 'payée'
    },
    {
        id: 'EXP-2',
        date: '2024-01-15',
        category: 'salaires',
        description: 'Salaire Sophie',
        amount: 80000,
        status: 'payée'
    }
];
