import React, { useState, useRef } from 'react';
import { Activity, Plus, Calendar, Search, Ear, TrendingDown, Edit, Trash2, Printer } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Audiogram } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Modal, ModalSelect, ModalTextarea, ModalButtons } from '../components/ui/Modal';

const Audiograms: React.FC = () => {
  const { audiograms, patients, addAudiogram, updateAudiogram, deleteAudiogram } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchPatient, setSearchPatient] = useState('');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedAudiogram, setSelectedAudiogram] = useState<Audiogram | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [newAudiogram, setNewAudiogram] = useState({
    patientId: '',
    patientName: '',
    type: 'initial' as Audiogram['type'],
    notes: '',
    rightEar: {
      frequencies: [250, 500, 1000, 2000, 4000, 8000],
      airConduction: [20, 25, 30, 35, 45, 55],
      boneConduction: [15, 20, 25, 30, 40, 50],
    },
    leftEar: {
      frequencies: [250, 500, 1000, 2000, 4000, 8000],
      airConduction: [25, 30, 35, 40, 50, 60],
      boneConduction: [20, 25, 30, 35, 45, 55],
    },
  });

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu';
  };

  const filteredPatients = patients.filter(
    (patient) =>
      searchPatient.length > 0 &&
      (`${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchPatient.toLowerCase()) ||
        patient.firstName.toLowerCase().includes(searchPatient.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchPatient.toLowerCase()))
  );

  const handleSelectPatient = (patient: typeof patients[0]) => {
    setNewAudiogram({
      ...newAudiogram,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
    });
    setSearchPatient(`${patient.firstName} ${patient.lastName}`);
    setShowPatientDropdown(false);
  };

  const handleSubmit = () => {
    if (!newAudiogram.patientId) return;

    const audiogram: Audiogram = {
      id: isEditing ? (selectedAudiogram?.id || Date.now().toString()) : Date.now().toString(),
      patientId: newAudiogram.patientId,
      date: selectedAudiogram?.date || new Date(),
      type: newAudiogram.type,
      rightEar: newAudiogram.rightEar,
      leftEar: newAudiogram.leftEar,
      notes: newAudiogram.notes,
    };

    if (isEditing) {
      updateAudiogram(audiogram.id, audiogram);
    } else {
      addAudiogram(audiogram);
    }
    setShowModal(false);
    setSearchPatient('');
    setIsEditing(false);
    setNewAudiogram({
      patientId: '',
      patientName: '',
      type: 'initial',
      notes: '',
      rightEar: {
        frequencies: [250, 500, 1000, 2000, 4000, 8000],
        airConduction: [20, 25, 30, 35, 45, 55],
        boneConduction: [15, 20, 25, 30, 40, 50],
      },
      leftEar: {
        frequencies: [250, 500, 1000, 2000, 4000, 8000],
        airConduction: [25, 30, 35, 40, 50, 60],
        boneConduction: [20, 25, 30, 35, 45, 55],
      },
    });
  };

  const handleEdit = (audiogram: Audiogram) => {
    setSelectedAudiogram(audiogram);
    setIsEditing(true);
    const patient = patients.find(p => p.id === audiogram.patientId);
    setNewAudiogram({
      patientId: audiogram.patientId,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : '',
      type: audiogram.type,
      notes: audiogram.notes || '',
      rightEar: audiogram.rightEar,
      leftEar: audiogram.leftEar,
    });
    setSearchPatient(patient ? `${patient.firstName} ${patient.lastName}` : '');
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet audiogramme ?')) {
      deleteAudiogram(id);
      if (selectedAudiogram?.id === id) {
        setSelectedAudiogram(null);
      }
    }
  };

  const handlePrintPDF = () => {
    if (!selectedAudiogram) return;
    const printContent = chartRef.current?.innerHTML;
    if (!printContent) return;

    const patient = patients.find(p => p.id === selectedAudiogram.patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu';

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Audiogramme - ${patientName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          h1 {
            color: #0d9488;
            margin-bottom: 5px;
          }
          .patient-info {
            background: #f0fdfa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #14b8a6;
          }
          .patient-info strong {
            color: #0f766e;
          }
          .chart-container {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 10px;
            margin: 20px 0;
          }
          .notes {
            background: #fef3c7;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            border: 1px solid #f59e0b;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <h1>👂 Audiogramme</h1>
        <div class="patient-info">
          <p><strong>Patient:</strong> ${patientName}</p>
          <p><strong>Date:</strong> ${format(new Date(selectedAudiogram.date), 'dd MMMM yyyy', { locale: fr })}</p>
          <p><strong>Type:</strong> ${getTypeLabel(selectedAudiogram.type)}</p>
        </div>
        <div class="chart-container">
          ${printContent}
        </div>
        ${selectedAudiogram.notes ? `
          <div class="notes">
            <strong>Notes et observations:</strong>
            <p>${selectedAudiogram.notes}</p>
          </div>
        ` : ''}
        <div class="footer">
          <p>Voxia Manager - Gestion Cabinet d'Audioprothèse</p>
          <p>Document généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const closeModal = () => {
    setShowModal(false);
    setSearchPatient('');
    setShowPatientDropdown(false);
    setIsEditing(false);
    setNewAudiogram({
      patientId: '',
      patientName: '',
      type: 'initial',
      notes: '',
      rightEar: {
        frequencies: [250, 500, 1000, 2000, 4000, 8000],
        airConduction: [20, 25, 30, 35, 45, 55],
        boneConduction: [15, 20, 25, 30, 40, 50],
      },
      leftEar: {
        frequencies: [250, 500, 1000, 2000, 4000, 8000],
        airConduction: [25, 30, 35, 40, 50, 60],
        boneConduction: [20, 25, 30, 35, 45, 55],
      },
    });
  };

  const prepareChartData = (audiogram: Audiogram) => {
    return audiogram.rightEar.frequencies.map((freq, index) => ({
      frequency: `${freq}`,
      'OD Air': audiogram.rightEar.airConduction[index],
      'OD Bone': audiogram.rightEar.boneConduction[index],
      'OG Air': audiogram.leftEar.airConduction[index],
      'OG Bone': audiogram.leftEar.boneConduction[index],
    }));
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      initial: 'Bilan Initial',
      controle: 'Contrôle',
      'post-appareillage': 'Post-Appareillage',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      initial: 'from-blue-500 to-indigo-500',
      controle: 'from-green-500 to-emerald-500',
      'post-appareillage': 'from-purple-500 to-pink-500',
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const updateEarValue = (ear: 'rightEar' | 'leftEar', type: 'airConduction' | 'boneConduction', index: number, value: number) => {
    setNewAudiogram({
      ...newAudiogram,
      [ear]: {
        ...newAudiogram[ear],
        [type]: newAudiogram[ear][type].map((v, i) => (i === index ? value : v)),
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Audiogrammes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {audiograms.length} bilans enregistrés
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Nouvel audiogramme
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audiograms List */}
        <div className="space-y-4">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom de patient..."
              value={globalSearchTerm}
              onChange={(e) => setGlobalSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-lg"
            />
          </div>

          <div className="space-y-4">
            {audiograms
              .filter(a => getPatientName(a.patientId).toLowerCase().includes(globalSearchTerm.toLowerCase()))
              .map((audiogram) => (
                <div
                  key={audiogram.id}
                  onClick={() => setSelectedAudiogram(audiogram)}
                  className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 ${selectedAudiogram?.id === audiogram.id
                    ? 'border-teal-500 ring-4 ring-teal-500/20'
                    : 'border-transparent hover:border-teal-300 dark:hover:border-teal-600'
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getTypeColor(audiogram.type)} flex items-center justify-center shadow-lg`}>
                      <Ear className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 dark:text-white">
                        {getPatientName(audiogram.patientId)}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getTypeColor(audiogram.type)}`}>
                          {getTypeLabel(audiogram.type)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(audiogram.date), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(audiogram);
                        }}
                        className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(audiogram.id);
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <TrendingDown className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            {audiograms.filter(a => getPatientName(a.patientId).toLowerCase().includes(globalSearchTerm.toLowerCase())).length === 0 && (
              <div className="text-center py-10 text-gray-500">
                Aucun audiogramme trouvé pour "{globalSearchTerm}"
              </div>
            )}
          </div>
        </div>

        {/* Audiogram Chart */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-500" />
              Visualisation
            </h2>
            {selectedAudiogram && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(selectedAudiogram)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-sm font-medium"
                  title="Modifier"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePrintPDF}
                  className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors text-sm font-medium"
                  title="Imprimer PDF"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(selectedAudiogram.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors text-sm font-medium"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          {selectedAudiogram ? (
            <div ref={chartRef} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prepareChartData(selectedAudiogram)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="frequency"
                    label={{ value: 'Fréquence (Hz)', position: 'insideBottom', offset: 0 }}
                    tick={{ fontSize: 12 }}
                    height={80}
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis
                    reversed
                    domain={[0, 120]}
                    label={{ value: 'dB HL', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    height={50}
                    iconType="line"
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <Line type="monotone" dataKey="OD Air" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 5 }} />
                  <Line type="monotone" dataKey="OD Bone" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#f97316', r: 4 }} />
                  <Line type="monotone" dataKey="OG Air" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
                  <Line type="monotone" dataKey="OG Bone" stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#06b6d4', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center mb-4">
                  <Activity className="w-10 h-10 text-white" />
                </div>
                <p>Sélectionnez un audiogramme pour voir le graphique</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nouvel Audiogramme */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={isEditing ? "Modifier l'Audiogramme" : "Nouvel Audiogramme"}
        icon={<Ear className="w-7 h-7" />}
        gradient="teal"
        size="2xl"
      >
        <div className="space-y-6">
          {/* Patient Search */}
          <div className="relative">
            <label className="block text-sm font-semibold text-teal-700 dark:text-teal-300 mb-2">
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
                    setNewAudiogram({ ...newAudiogram, patientId: '', patientName: '' });
                  }
                }}
                onFocus={() => setShowPatientDropdown(true)}
                placeholder="Tapez pour rechercher un patient..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-4 focus:ring-teal-400/30 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              />
            </div>
            {showPatientDropdown && filteredPatients.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:hover:from-teal-900/30 dark:hover:to-cyan-900/30 flex items-center gap-3 transition-all first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold">
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
            label="Type de bilan"
            value={newAudiogram.type}
            onChange={(e) => setNewAudiogram({ ...newAudiogram, type: e.target.value as Audiogram['type'] })}
            options={[
              { value: 'initial', label: '📋 Bilan initial' },
              { value: 'controle', label: '✅ Contrôle' },
              { value: 'post-appareillage', label: '🎧 Post-appareillage' },
            ]}
            required
            gradient="teal"
          />

          {/* Audiometric Data Entry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Right Ear */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-4 border-2 border-red-200 dark:border-red-800">
              <h4 className="font-bold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                <Ear className="w-5 h-5" />
                Oreille Droite (OD)
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-medium text-red-600 dark:text-red-400 mb-2 block">Voie Aérienne (dB)</span>
                  <div className="grid grid-cols-6 gap-1">
                    {newAudiogram.rightEar.frequencies.map((freq, index) => (
                      <div key={freq} className="text-center">
                        <label className="text-xs text-gray-500 block mb-1">{freq}</label>
                        <input
                          type="number"
                          min="0"
                          max="120"
                          value={newAudiogram.rightEar.airConduction[index]}
                          onChange={(e) => updateEarValue('rightEar', 'airConduction', index, parseInt(e.target.value) || 0)}
                          className="w-full px-1 py-2 text-center text-sm rounded-lg border-2 border-red-200 dark:border-red-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-red-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-2 block">Voie Osseuse (dB)</span>
                  <div className="grid grid-cols-6 gap-1">
                    {newAudiogram.rightEar.frequencies.map((freq, index) => (
                      <div key={freq} className="text-center">
                        <label className="text-xs text-gray-500 block mb-1">{freq}</label>
                        <input
                          type="number"
                          min="0"
                          max="120"
                          value={newAudiogram.rightEar.boneConduction[index]}
                          onChange={(e) => updateEarValue('rightEar', 'boneConduction', index, parseInt(e.target.value) || 0)}
                          className="w-full px-1 py-2 text-center text-sm rounded-lg border-2 border-orange-200 dark:border-orange-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Left Ear */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
              <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                <Ear className="w-5 h-5 transform scale-x-[-1]" />
                Oreille Gauche (OG)
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2 block">Voie Aérienne (dB)</span>
                  <div className="grid grid-cols-6 gap-1">
                    {newAudiogram.leftEar.frequencies.map((freq, index) => (
                      <div key={freq} className="text-center">
                        <label className="text-xs text-gray-500 block mb-1">{freq}</label>
                        <input
                          type="number"
                          min="0"
                          max="120"
                          value={newAudiogram.leftEar.airConduction[index]}
                          onChange={(e) => updateEarValue('leftEar', 'airConduction', index, parseInt(e.target.value) || 0)}
                          className="w-full px-1 py-2 text-center text-sm rounded-lg border-2 border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400 mb-2 block">Voie Osseuse (dB)</span>
                  <div className="grid grid-cols-6 gap-1">
                    {newAudiogram.leftEar.frequencies.map((freq, index) => (
                      <div key={freq} className="text-center">
                        <label className="text-xs text-gray-500 block mb-1">{freq}</label>
                        <input
                          type="number"
                          min="0"
                          max="120"
                          value={newAudiogram.leftEar.boneConduction[index]}
                          onChange={(e) => updateEarValue('leftEar', 'boneConduction', index, parseInt(e.target.value) || 0)}
                          className="w-full px-1 py-2 text-center text-sm rounded-lg border-2 border-cyan-200 dark:border-cyan-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-cyan-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ModalTextarea
            label="Notes et observations"
            value={newAudiogram.notes}
            onChange={(e) => setNewAudiogram({ ...newAudiogram, notes: e.target.value })}
            placeholder="Observations cliniques, remarques..."
            gradient="teal"
          />

          <ModalButtons
            onCancel={closeModal}
            onSubmit={handleSubmit}
            submitText={isEditing ? "Mettre à jour" : "Enregistrer l'audiogramme"}
            gradient="teal"
          />
        </div>
      </Modal>
    </div>
  );
};

export default Audiograms;
