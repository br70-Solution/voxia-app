import fetch from 'node-fetch';
import {
    users, patients, audiograms, hearingAids,
    patientDevices, appointments, invoices, expenses, stockItems
} from './src/data/mockData.js';

const API_URL = 'http://localhost:3001/api';

const demoData = {
    users,
    patients,
    audiograms,
    hearingAids,
    patientDevices,
    appointments,
    invoices,
    expenses,
    stockItems
};

const seed = async () => {
    console.log('--- Démarrage du peuplement de la base de données (Seed) ---');
    try {
        const response = await fetch(`${API_URL}/seed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(demoData)
        });

        if (response.ok) {
            console.log('✅ Succès : Les données de démonstration ont été insérées.');
        } else {
            const err = await response.json();
            console.error('❌ Erreur lors du seed :', err);
        }
    } catch (error) {
        console.error('❌ Erreur de connexion au serveur :', error.message);
        console.log('Assurez-vous que le serveur tourne sur http://localhost:3001');
    }
};

seed();
