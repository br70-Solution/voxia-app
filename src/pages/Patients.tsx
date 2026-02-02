import React, { useState } from 'react';
import { Search, Plus, Phone, Mail, Calendar, User, MapPin, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Patient } from '../types';
import { Card } from '../components/Card';
import { Modal, ModalInput, ModalSelect, ModalTextarea, ModalButtons } from '../components/ui/Modal';

const Patients: React.FC = () => {
  const { patients, addPatient } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'M' as 'M' | 'F',
    phone: '',
    email: '',
    address: '',
    medicalHistory: '',
  });

  const filteredPatients = patients.filter(
    (patient) =>
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    if (!newPatient.firstName || !newPatient.lastName) return;

    const patient: Patient = {
      id: Date.now().toString(),
      ...newPatient,
      age: calculateAge(newPatient.dateOfBirth),
      audiologicalHistory: '',
      createdAt: new Date(),
    };
    addPatient(patient);
    setShowModal(false);
    setNewPatient({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'M',
      phone: '',
      email: '',
      address: '',
      medicalHistory: '',
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Gestion des Patients
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {patients.length} patients enregistrés
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Nouveau patient
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher un patient..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-lg"
        />
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card
            key={patient.id}
            className="group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-md group-hover:scale-105 transition-transform">
                {patient.firstName[0]}{patient.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white truncate">
                  {patient.firstName} {patient.lastName}
                </h3>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>{patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : patient.age} ans</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    patient.gender === 'M' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                  }`}>
                    {patient.gender === 'M' ? 'Homme' : 'Femme'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="truncate">{patient.email}</span>
              </div>
              {patient.address && (
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  </div>
                  <span className="truncate">{patient.address}</span>
                </div>
              )}
            </div>

            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700/50 flex gap-3">
              <button className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 dark:shadow-none">
                Voir dossier
              </button>
              <button className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                <FileText className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Aucun patient trouvé
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Essayez avec d'autres termes de recherche
          </p>
        </div>
      )}

      {/* Modal Nouveau Patient */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nouveau Patient"
        icon={<User className="w-7 h-7" />}
        gradient="indigo"
        size="lg"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ModalInput
              label="Prénom"
              value={newPatient.firstName}
              onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
              placeholder="Entrez le prénom"
              required
              gradient="indigo"
            />
            <ModalInput
              label="Nom"
              value={newPatient.lastName}
              onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
              placeholder="Entrez le nom"
              required
              gradient="indigo"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ModalInput
              label="Date de naissance"
              type="date"
              value={newPatient.dateOfBirth}
              onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
              required
              gradient="indigo"
            />
            <ModalSelect
              label="Sexe"
              value={newPatient.gender}
              onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as 'M' | 'F' })}
              options={[
                { value: 'M', label: 'Homme' },
                { value: 'F', label: 'Femme' },
              ]}
              required
              gradient="indigo"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ModalInput
              label="Téléphone"
              type="tel"
              value={newPatient.phone}
              onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
              placeholder="0XX XX XX XX XX"
              required
              gradient="indigo"
              icon={<Phone className="w-4 h-4" />}
            />
            <ModalInput
              label="Email"
              type="email"
              value={newPatient.email}
              onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
              placeholder="email@exemple.com"
              gradient="indigo"
              icon={<Mail className="w-4 h-4" />}
            />
          </div>

          <ModalInput
            label="Adresse"
            value={newPatient.address}
            onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
            placeholder="Adresse complète"
            gradient="indigo"
            icon={<MapPin className="w-4 h-4" />}
          />

          <ModalTextarea
            label="Antécédents médicaux"
            value={newPatient.medicalHistory}
            onChange={(e) => setNewPatient({ ...newPatient, medicalHistory: e.target.value })}
            placeholder="Historique médical, allergies, traitements en cours..."
            gradient="indigo"
          />

          <ModalButtons
            onCancel={() => setShowModal(false)}
            onSubmit={handleSubmit}
            submitText="Créer le patient"
            gradient="indigo"
          />
        </div>
      </Modal>
    </div>
  );
};

export default Patients;
