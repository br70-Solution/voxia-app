import React, { useState } from 'react';
import { Headphones, Plus, Settings, Trash2, Edit, Search, Package, Star, Zap, ImageIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HearingAid, PatientDevice } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Modal, ModalInput, ModalSelect, ModalButtons, ModalImageUpload } from '../components/ui/Modal';

const defaultImages: Record<string, string> = {
  RIC: 'https://images.unsplash.com/photo-1590935217281-8f102120d683?w=300&h=200&fit=crop',
  BTE: 'https://images.unsplash.com/photo-1559963629-38ed0fbd4c86?w=300&h=200&fit=crop',
  ITC: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=300&h=200&fit=crop',
  CIC: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=200&fit=crop',
  ITE: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=300&h=200&fit=crop',
};

const Devices: React.FC = () => {
  const { hearingAids, patientDevices, patients, addHearingAid, updateHearingAid, deleteHearingAid, addPatientDevice, updatePatientDevice, deletePatientDevice } = useApp();
  const [activeTab, setActiveTab] = useState<'catalog' | 'fittings'>('catalog');

  // Modal states
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showEditCatalogModal, setShowEditCatalogModal] = useState(false);
  const [showFittingModal, setShowFittingModal] = useState(false);
  const [showEditFittingModal, setShowEditFittingModal] = useState(false);

  // Search states
  const [searchPatient, setSearchPatient] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [catalogSearchTerm, setCatalogSearchTerm] = useState('');
  const [fittingSearchTerm, setFittingSearchTerm] = useState('');

  // Form states
  const [newDevice, setNewDevice] = useState<Partial<HearingAid>>({
    brand: '',
    model: '',
    type: 'RIC',
    technology: 'mid',
    price: 0,
    features: [],
    image: '',
  });

  const [editDevice, setEditDevice] = useState<HearingAid | null>(null);

  const [newFitting, setNewFitting] = useState({
    patientId: '',
    patientName: '',
    hearingAidId: '',
    ear: 'both' as PatientDevice['ear'],
    notes: '',
  });

  const [editFitting, setEditFitting] = useState<PatientDevice | null>(null);

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu';
  };

  const getDeviceName = (deviceId: string) => {
    const device = hearingAids.find((d) => d.id === deviceId);
    return device ? `${device.brand} ${device.model}` : 'Appareil inconnu';
  };

  const filteredPatients = patients.filter(
    (patient) =>
      searchPatient.length > 0 &&
      (`${patient.firstName} ${patient.lastName}`.toLowerCase().startsWith(searchPatient.toLowerCase()) ||
        patient.firstName.toLowerCase().startsWith(searchPatient.toLowerCase()) ||
        patient.lastName.toLowerCase().startsWith(searchPatient.toLowerCase()))
  );

  const handleSelectPatient = (patient: typeof patients[0]) => {
    setNewFitting({
      ...newFitting,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
    });
    setSearchPatient(`${patient.firstName} ${patient.lastName}`);
    setShowPatientDropdown(false);
  };

  // Catalog handlers
  const handleAddCatalog = () => {
    if (!newDevice.brand || !newDevice.model) return;
    const device: HearingAid = {
      id: Date.now().toString(),
      brand: newDevice.brand || '',
      model: newDevice.model || '',
      type: newDevice.type as HearingAid['type'] || 'RIC',
      technology: newDevice.technology as HearingAid['technology'] || 'mid',
      price: newDevice.price || 0,
      features: newDevice.features || [],
      image: newDevice.image || defaultImages[newDevice.type || 'RIC'],
    };
    addHearingAid(device);
    setShowCatalogModal(false);
    setNewDevice({ brand: '', model: '', type: 'RIC', technology: 'mid', price: 0, features: [], image: '' });
  };

  const handleUpdateCatalog = () => {
    if (!editDevice) return;
    updateHearingAid(editDevice.id, editDevice);
    setShowEditCatalogModal(false);
    setEditDevice(null);
  };

  const handleDeleteCatalog = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet appareil du catalogue ?')) {
      deleteHearingAid(id);
    }
  };

  // Fitting handlers
  const handleAddFitting = () => {
    if (!newFitting.patientId || !newFitting.hearingAidId) return;
    const fitting: PatientDevice = {
      id: Date.now().toString(),
      patientId: newFitting.patientId,
      hearingAidId: newFitting.hearingAidId,
      ear: newFitting.ear,
      dateInstalled: new Date(),
      warranty: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
      status: 'active',
      adjustments: [],
    };
    addPatientDevice(fitting);
    setShowFittingModal(false);
    setSearchPatient('');
    setNewFitting({ patientId: '', patientName: '', hearingAidId: '', ear: 'both', notes: '' });
  };

  const handleUpdateFitting = () => {
    if (!editFitting) return;
    updatePatientDevice(editFitting.id, editFitting);
    setShowEditFittingModal(false);
    setEditFitting(null);
  };

  const handleDeleteFitting = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet appareillage ?')) {
      deletePatientDevice(id);
    }
  };

  const getTechBadge = (tech: string) => {
    const colors: Record<string, string> = {
      basic: 'from-gray-400 to-gray-500',
      mid: 'from-blue-400 to-blue-500',
      premium: 'from-purple-400 to-purple-500',
      ultra: 'from-amber-400 to-amber-500',
    };
    return colors[tech] || colors.basic;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Prothèses Auditives
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Catalogue et appareillages
          </p>
        </div>
        <button
          onClick={() => activeTab === 'catalog' ? setShowCatalogModal(true) : setShowFittingModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          {activeTab === 'catalog' ? 'Ajouter au catalogue' : 'Nouvel appareillage'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-2xl">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'catalog'
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
        >
          <Package className="w-5 h-5" />
          Catalogue
        </button>
        <button
          onClick={() => setActiveTab('fittings')}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'fittings'
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
        >
          <Headphones className="w-5 h-5" />
          Appareillages
        </button>
      </div>

      {/* Search Bar for current tab */}
      <div className="relative mb-2">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={activeTab === 'catalog' ? "Rechercher un modèle ou une marque..." : "Rechercher par nom de patient..."}
          value={activeTab === 'catalog' ? catalogSearchTerm : fittingSearchTerm}
          onChange={(e) => activeTab === 'catalog' ? setCatalogSearchTerm(e.target.value) : setFittingSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-lg"
        />
      </div>

      {/* Catalog Tab */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hearingAids
            .filter(d =>
              d.brand.toLowerCase().includes(catalogSearchTerm.toLowerCase()) ||
              d.model.toLowerCase().includes(catalogSearchTerm.toLowerCase())
            )
            .map((device) => (
              <div
                key={device.id}
                className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 hover:scale-[1.02]"
              >
                <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                  <img
                    src={device.image || defaultImages[device.type] || defaultImages.RIC}
                    alt={`${device.brand} ${device.model}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultImages[device.type] || defaultImages.RIC;
                    }}
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => { setEditDevice(device); setShowEditCatalogModal(true); }}
                      className="p-2 rounded-xl bg-white/90 dark:bg-gray-800/90 text-purple-600 hover:text-purple-700 shadow-lg hover:scale-110 transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCatalog(device.id)}
                      className="p-2 rounded-xl bg-white/90 dark:bg-gray-800/90 text-rose-600 hover:text-rose-700 shadow-lg hover:scale-110 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getTechBadge(device.technology)} shadow-lg`}>
                    {device.technology.toUpperCase()}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white text-lg">{device.brand}</h3>
                      <p className="text-gray-500 dark:text-gray-400">{device.model}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-bold">
                      {device.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {device.price.toLocaleString()} DA
                    </span>
                    <Zap className="w-5 h-5 text-amber-500" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Fittings Tab */}
      {activeTab === 'fittings' && (
        <div className="space-y-4">
          {patientDevices
            .filter(f => getPatientName(f.patientId).toLowerCase().includes(fittingSearchTerm.toLowerCase()))
            .map((fitting) => (
              <div
                key={fitting.id}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <Headphones className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 dark:text-white">
                      {getPatientName(fitting.patientId)}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {getDeviceName(fitting.hearingAidId)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${fitting.ear === 'both'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                        : fitting.ear === 'left'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                        }`}>
                        {fitting.ear === 'both' ? 'Bilatéral' : fitting.ear === 'left' ? 'Gauche' : 'Droit'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${fitting.status === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                        : fitting.status === 'maintenance'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                        {fitting.status === 'active' ? 'Actif' : fitting.status === 'maintenance' ? 'Maintenance' : 'Remplacé'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Posé le {format(new Date(fitting.dateInstalled), 'dd/MM/yyyy', { locale: fr })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditFitting(fitting); setShowEditFittingModal(true); }}
                      className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900 transition-all hover:scale-105"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFitting(fitting.id)}
                      className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900 transition-all hover:scale-105"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

          {patientDevices.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <Headphones className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Aucun appareillage
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Créez votre premier appareillage patient
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal Ajouter au Catalogue */}
      <Modal
        isOpen={showCatalogModal}
        onClose={() => setShowCatalogModal(false)}
        title="Ajouter au Catalogue"
        icon={<Package className="w-7 h-7" />}
        gradient="purple"
        size="lg"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ModalInput
              label="Marque"
              value={newDevice.brand || ''}
              onChange={(e) => setNewDevice({ ...newDevice, brand: e.target.value })}
              placeholder="Ex: Phonak, Oticon..."
              required
              gradient="purple"
            />
            <ModalInput
              label="Modèle"
              value={newDevice.model || ''}
              onChange={(e) => setNewDevice({ ...newDevice, model: e.target.value })}
              placeholder="Ex: Audéo Paradise..."
              required
              gradient="purple"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ModalSelect
              label="Type"
              value={newDevice.type || 'RIC'}
              onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value as HearingAid['type'] })}
              options={[
                { value: 'RIC', label: 'RIC - Receiver in Canal' },
                { value: 'BTE', label: 'BTE - Behind the Ear' },
                { value: 'ITC', label: 'ITC - In the Canal' },
                { value: 'CIC', label: 'CIC - Completely in Canal' },
                { value: 'ITE', label: 'ITE - In the Ear' },
              ]}
              gradient="purple"
            />
            <ModalSelect
              label="Technologie"
              value={newDevice.technology || 'mid'}
              onChange={(e) => setNewDevice({ ...newDevice, technology: e.target.value as HearingAid['technology'] })}
              options={[
                { value: 'basic', label: '⭐ Basic' },
                { value: 'mid', label: '⭐⭐ Mid-range' },
                { value: 'premium', label: '⭐⭐⭐ Premium' },
                { value: 'ultra', label: '⭐⭐⭐⭐ Ultra' },
              ]}
              gradient="purple"
            />
          </div>

          <ModalInput
            label="Prix (DA)"
            type="number"
            value={newDevice.price || 0}
            onChange={(e) => setNewDevice({ ...newDevice, price: parseInt(e.target.value) || 0 })}
            placeholder="Prix en Dinar Algérien"
            required
            gradient="purple"
          />

          <ModalImageUpload
            label="Image de l'appareil"
            value={newDevice.image || ''}
            onImageChange={(url) => setNewDevice({ ...newDevice, image: url })}
            gradient="purple"
          />

          <ModalButtons
            onCancel={() => setShowCatalogModal(false)}
            onSubmit={handleAddCatalog}
            submitText="Ajouter au catalogue"
            gradient="purple"
          />
        </div>
      </Modal>

      {/* Modal Modifier Catalogue */}
      <Modal
        isOpen={showEditCatalogModal}
        onClose={() => { setShowEditCatalogModal(false); setEditDevice(null); }}
        title="Modifier l'appareil"
        icon={<Edit className="w-7 h-7" />}
        gradient="purple"
        size="lg"
      >
        {editDevice && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ModalInput
                label="Marque"
                value={editDevice.brand}
                onChange={(e) => setEditDevice({ ...editDevice, brand: e.target.value })}
                placeholder="Ex: Phonak, Oticon..."
                required
                gradient="purple"
              />
              <ModalInput
                label="Modèle"
                value={editDevice.model}
                onChange={(e) => setEditDevice({ ...editDevice, model: e.target.value })}
                placeholder="Ex: Audéo Paradise..."
                required
                gradient="purple"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ModalSelect
                label="Type"
                value={editDevice.type}
                onChange={(e) => setEditDevice({ ...editDevice, type: e.target.value as HearingAid['type'] })}
                options={[
                  { value: 'RIC', label: 'RIC - Receiver in Canal' },
                  { value: 'BTE', label: 'BTE - Behind the Ear' },
                  { value: 'ITC', label: 'ITC - In the Canal' },
                  { value: 'CIC', label: 'CIC - Completely in Canal' },
                  { value: 'ITE', label: 'ITE - In the Ear' },
                ]}
                gradient="purple"
              />
              <ModalSelect
                label="Technologie"
                value={editDevice.technology}
                onChange={(e) => setEditDevice({ ...editDevice, technology: e.target.value as HearingAid['technology'] })}
                options={[
                  { value: 'basic', label: '⭐ Basic' },
                  { value: 'mid', label: '⭐⭐ Mid-range' },
                  { value: 'premium', label: '⭐⭐⭐ Premium' },
                  { value: 'ultra', label: '⭐⭐⭐⭐ Ultra' },
                ]}
                gradient="purple"
              />
            </div>

            <ModalInput
              label="Prix (DA)"
              type="number"
              value={editDevice.price}
              onChange={(e) => setEditDevice({ ...editDevice, price: parseInt(e.target.value) || 0 })}
              placeholder="Prix en Dinar Algérien"
              required
              gradient="purple"
            />

            <ModalImageUpload
              label="Image de l'appareil"
              value={editDevice.image || ''}
              onImageChange={(url) => setEditDevice({ ...editDevice, image: url })}
              gradient="purple"
            />

            <ModalButtons
              onCancel={() => { setShowEditCatalogModal(false); setEditDevice(null); }}
              onSubmit={handleUpdateCatalog}
              submitText="Enregistrer les modifications"
              gradient="purple"
            />
          </div>
        )}
      </Modal>

      {/* Modal Nouvel Appareillage */}
      <Modal
        isOpen={showFittingModal}
        onClose={() => { setShowFittingModal(false); setSearchPatient(''); }}
        title="Nouvel Appareillage"
        icon={<Headphones className="w-7 h-7" />}
        gradient="rose"
        size="lg"
      >
        <div className="space-y-5">
          {/* Patient Search */}
          <div className="relative">
            <label className="block text-sm font-semibold text-rose-700 dark:text-rose-300 mb-2">
              Patient <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchPatient}
                onChange={(e) => {
                  setSearchPatient(e.target.value);
                  setShowPatientDropdown(true);
                  if (e.target.value === '') {
                    setNewFitting({ ...newFitting, patientId: '', patientName: '' });
                  }
                }}
                onFocus={() => setShowPatientDropdown(true)}
                placeholder="Tapez pour rechercher un patient..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-4 focus:ring-rose-400/30 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              />
            </div>
            {showPatientDropdown && filteredPatients.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 dark:hover:from-rose-900/30 dark:hover:to-pink-900/30 flex items-center gap-3 transition-all first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {patient.firstName[0]}{patient.lastName[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-white">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {patient.age} ans
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <ModalSelect
            label="Appareil auditif"
            value={newFitting.hearingAidId}
            onChange={(e) => setNewFitting({ ...newFitting, hearingAidId: e.target.value })}
            options={[
              { value: '', label: 'Sélectionner un appareil...' },
              ...hearingAids.map((device) => ({
                value: device.id,
                label: `${device.brand} ${device.model} (${device.type})`,
              })),
            ]}
            required
            gradient="rose"
          />

          <ModalSelect
            label="Oreille"
            value={newFitting.ear}
            onChange={(e) => setNewFitting({ ...newFitting, ear: e.target.value as PatientDevice['ear'] })}
            options={[
              { value: 'both', label: '👂👂 Bilatéral (les deux oreilles)' },
              { value: 'left', label: '👂 Oreille gauche' },
              { value: 'right', label: '👂 Oreille droite' },
            ]}
            gradient="rose"
          />

          <ModalButtons
            onCancel={() => { setShowFittingModal(false); setSearchPatient(''); }}
            onSubmit={handleAddFitting}
            submitText="Créer l'appareillage"
            gradient="rose"
          />
        </div>
      </Modal>

      {/* Modal Modifier Appareillage */}
      <Modal
        isOpen={showEditFittingModal}
        onClose={() => { setShowEditFittingModal(false); setEditFitting(null); }}
        title="Modifier l'appareillage"
        icon={<Settings className="w-7 h-7" />}
        gradient="rose"
        size="lg"
      >
        {editFitting && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border-2 border-rose-200 dark:border-rose-800">
              <p className="font-semibold text-rose-700 dark:text-rose-300">
                Patient: {getPatientName(editFitting.patientId)}
              </p>
              <p className="text-sm text-rose-600 dark:text-rose-400">
                Appareil: {getDeviceName(editFitting.hearingAidId)}
              </p>
            </div>

            <ModalSelect
              label="Oreille"
              value={editFitting.ear}
              onChange={(e) => setEditFitting({ ...editFitting, ear: e.target.value as PatientDevice['ear'] })}
              options={[
                { value: 'both', label: '👂👂 Bilatéral (les deux oreilles)' },
                { value: 'left', label: '👂 Oreille gauche' },
                { value: 'right', label: '👂 Oreille droite' },
              ]}
              gradient="rose"
            />

            <ModalSelect
              label="Statut"
              value={editFitting.status}
              onChange={(e) => setEditFitting({ ...editFitting, status: e.target.value as PatientDevice['status'] })}
              options={[
                { value: 'active', label: '✅ Actif' },
                { value: 'maintenance', label: '🔧 En maintenance' },
                { value: 'replaced', label: '🔄 Remplacé' },
              ]}
              gradient="rose"
            />

            <ModalButtons
              onCancel={() => { setShowEditFittingModal(false); setEditFitting(null); }}
              onSubmit={handleUpdateFitting}
              submitText="Enregistrer les modifications"
              gradient="rose"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Devices;
