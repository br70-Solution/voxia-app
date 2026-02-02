import React, { useState } from 'react';
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight, Search, Check, X as XIcon, AlertCircle, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Appointment } from '../types';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Modal, ModalInput, ModalSelect, ModalButtons } from '../components/ui/Modal';

const Agenda: React.FC = () => {
  const { appointments, patients, addAppointment } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [searchPatient, setSearchPatient] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    patientName: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    duration: 30,
    type: 'bilan' as Appointment['type'],
    notes: '',
  });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((apt) => isSameDay(new Date(apt.date), date));
  };

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
    setNewAppointment({
      ...newAppointment,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
    });
    setSearchPatient(`${patient.firstName} ${patient.lastName}`);
    setShowPatientDropdown(false);
  };

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!newAppointment.patientId) {
      setError('Veuillez sélectionner un patient');
      return;
    }
    setError('');

    const appointment: Appointment = {
      id: Date.now().toString(),
      patientId: newAppointment.patientId,
      date: new Date(`${newAppointment.date}T${newAppointment.time}`),
      duration: newAppointment.duration,
      type: newAppointment.type,
      status: 'planned',
      notes: newAppointment.notes,
    };
    addAppointment(appointment);
    setShowModal(false);
    setSearchPatient('');
    setNewAppointment({
      patientId: '',
      patientName: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      duration: 30,
      type: 'bilan',
      notes: '',
    });
  };

  const handleShowDetails = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setShowDetailModal(true);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      bilan: 'from-blue-500 to-indigo-500',
      essai: 'from-purple-500 to-pink-500',
      reglage: 'from-orange-500 to-amber-500',
      controle: 'from-green-500 to-emerald-500',
      suivi: 'from-teal-500 to-cyan-500',
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-3 h-3" />;
      case 'cancelled':
        return <XIcon className="w-3 h-3" />;
      case 'confirmed':
        return <Check className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Agenda
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gérez vos rendez-vous
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Nouveau rendez-vous
        </button>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentDate(addDays(currentDate, -7))}
            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all hover:scale-105"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {format(weekStart, 'MMMM yyyy', { locale: fr })}
          </h2>
          <button
            onClick={() => setCurrentDate(addDays(currentDate, 7))}
            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all hover:scale-105"
          >
            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[200px] rounded-2xl p-3 transition-all ${isToday
                    ? 'bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 ring-2 ring-indigo-500'
                    : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                <div className="text-center mb-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
                    {format(day, 'EEE', { locale: fr })}
                  </div>
                  <div
                    className={`text-xl font-bold mt-1 ${isToday
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-800 dark:text-white'
                      }`}
                  >
                    {format(day, 'd')}
                  </div>
                </div>

                <div className="space-y-2">
                  {dayAppointments.slice(0, 3).map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => handleShowDetails(apt)}
                      className={`p-2 rounded-xl bg-gradient-to-r ${getTypeColor(apt.type)} text-white text-xs shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer`}
                    >
                      <div className="font-semibold truncate">
                        {getPatientName(apt.patientId)}
                      </div>
                      <div className="flex items-center gap-1 mt-1 opacity-90">
                        <Clock className="w-3 h-3" />
                        {format(new Date(apt.date), 'HH:mm')}
                        <span className="ml-1 flex items-center gap-0.5">
                          {getStatusIcon(apt.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                      +{dayAppointments.length - 3} autres
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" />
          Rendez-vous du jour
        </h3>
        <div className="space-y-3">
          {getAppointmentsForDay(new Date()).length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mb-3">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">Aucun rendez-vous aujourd'hui</p>
            </div>
          ) : (
            getAppointmentsForDay(new Date()).map((apt) => (
              <div
                key={apt.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <div className={`w-1 h-12 rounded-full bg-gradient-to-b ${getTypeColor(apt.type)}`}></div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 dark:text-white">
                    {getPatientName(apt.patientId)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {format(new Date(apt.date), 'HH:mm')} - {apt.duration} min
                    <span className={`px-2 py-0.5 rounded-full text-xs capitalize bg-gradient-to-r ${getTypeColor(apt.type)} text-white`}>
                      {apt.type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleShowDetails(apt)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-all shadow-md hover:shadow-lg"
                >
                  Détails
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Nouveau RDV */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSearchPatient('');
          setShowPatientDropdown(false);
        }}
        title="Nouveau Rendez-vous"
        icon={<Calendar className="w-7 h-7" />}
        gradient="blue"
        size="lg"
      >
        <div className="space-y-5">
          {/* Patient Search */}
          <div className="relative">
            <label className="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
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
                    setNewAppointment({ ...newAppointment, patientId: '', patientName: '' });
                  }
                }}
                onFocus={() => setShowPatientDropdown(true)}
                placeholder="Tapez pour rechercher un patient..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-4 focus:ring-blue-400/30 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              />
            </div>
            {error && (
              <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
            {showPatientDropdown && filteredPatients.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 flex items-center gap-3 transition-all first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ModalInput
              label="Date"
              type="date"
              value={newAppointment.date}
              onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
              required
              gradient="blue"
            />
            <ModalInput
              label="Heure"
              type="time"
              value={newAppointment.time}
              onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
              required
              gradient="blue"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ModalSelect
              label="Type de rendez-vous"
              value={newAppointment.type}
              onChange={(e) => setNewAppointment({ ...newAppointment, type: e.target.value as Appointment['type'] })}
              options={[
                { value: 'bilan', label: '📋 Bilan auditif' },
                { value: 'essai', label: '🎧 Essai prothèse' },
                { value: 'reglage', label: '🔧 Réglage' },
                { value: 'controle', label: '✅ Contrôle' },
                { value: 'suivi', label: '📊 Suivi' },
              ]}
              required
              gradient="blue"
            />
            <ModalSelect
              label="Durée"
              value={newAppointment.duration.toString()}
              onChange={(e) => setNewAppointment({ ...newAppointment, duration: parseInt(e.target.value) })}
              options={[
                { value: '15', label: '15 minutes' },
                { value: '30', label: '30 minutes' },
                { value: '45', label: '45 minutes' },
                { value: '60', label: '1 heure' },
                { value: '90', label: '1h30' },
              ]}
              required
              gradient="blue"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
              Notes
            </label>
            <textarea
              value={newAppointment.notes}
              onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
              placeholder="Notes supplémentaires..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-4 focus:ring-blue-400/30 focus:border-transparent transition-all resize-none shadow-sm hover:shadow-md"
            />
          </div>

          <ModalButtons
            onCancel={() => {
              setShowModal(false);
              setSearchPatient('');
            }}
            onSubmit={handleSubmit}
            submitText="Créer le rendez-vous"
            gradient="blue"
          />
        </div>
      </Modal>

      {/* Modal Détails RDV */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails du Rendez-vous"
        icon={<Calendar className="w-7 h-7" />}
        gradient="purple"
        size="md"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {getPatientName(selectedAppointment.patientId).split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {getPatientName(selectedAppointment.patientId)}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">Patient</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Date</span>
                </div>
                <div className="text-lg font-bold text-gray-800 dark:text-white">
                  {format(new Date(selectedAppointment.date), 'dd MMMM yyyy', { locale: fr })}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Heure</span>
                </div>
                <div className="text-lg font-bold text-gray-800 dark:text-white">
                  {format(new Date(selectedAppointment.date), 'HH:mm')}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Type</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize bg-gradient-to-r ${getTypeColor(selectedAppointment.type)} text-white shadow-sm`}>
                  {selectedAppointment.type}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Durée</span>
                <span className="text-gray-800 dark:text-white font-bold">{selectedAppointment.duration} minutes</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Statut</span>
                <span className="flex items-center gap-2 font-bold text-gray-800 dark:text-white">
                  <span className="p-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                    {getStatusIcon(selectedAppointment.status)}
                  </span>
                  {selectedAppointment.status === 'planned' ? 'Planifié' :
                    selectedAppointment.status === 'completed' ? 'Terminé' :
                      selectedAppointment.status === 'cancelled' ? 'Annulé' : 'Confirmé'}
                </span>
              </div>
            </div>

            {selectedAppointment.notes && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Notes</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {selectedAppointment.notes}
                </p>
              </div>
            )}

            <button
              onClick={() => setShowDetailModal(false)}
              className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              Fermer
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Agenda;
