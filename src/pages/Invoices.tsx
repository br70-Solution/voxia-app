import React, { useState, useRef } from 'react';
import { FileText, Plus, Printer, Eye, Edit, Trash2, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Invoice, InvoiceItem } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Modal, ModalInput, ModalSelect, ModalButtons } from '../components/ui/Modal';

const Invoices: React.FC = () => {
  const { invoices, patients, addInvoice, updateInvoice, deleteInvoice } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [searchPatient, setSearchPatient] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [newInvoice, setNewInvoice] = useState({
    patientId: '',
    patientName: '',
    status: 'pending' as Invoice['status'],
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }] as InvoiceItem[],
    insurance: '',
  });

  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);

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

  const filteredInvoices = invoices.filter(
    (invoice) =>
      getPatientName(invoice.patientId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.includes(searchTerm)
  );

  const handleSelectPatient = (patient: typeof patients[0]) => {
    setNewInvoice({
      ...newInvoice,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
    });
    setSearchPatient(`${patient.firstName} ${patient.lastName}`);
    setShowPatientDropdown(false);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const items = [...newInvoice.items];
    items[index] = { ...items[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      items[index].total = items[index].quantity * items[index].unitPrice;
    }
    setNewInvoice({ ...newInvoice, items });
  };

  const addItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  const removeItem = (index: number) => {
    const items = newInvoice.items.filter((_, i) => i !== index);
    setNewInvoice({ ...newInvoice, items });
  };

  const handleSubmit = () => {
    if (!newInvoice.patientId || newInvoice.items.length === 0) return;

    const totalAmount = newInvoice.items.reduce((sum, item) => sum + item.total, 0);
    const invoice: Invoice = {
      id: `FAC-${Date.now()}`,
      patientId: newInvoice.patientId,
      date: new Date(),
      amount: totalAmount,
      status: newInvoice.status,
      items: newInvoice.items,
      insurance: newInvoice.insurance || undefined,
    };
    addInvoice(invoice);
    setShowModal(false);
    setSearchPatient('');
    setNewInvoice({
      patientId: '',
      patientName: '',
      status: 'pending',
      items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
      insurance: '',
    });
  };

  const handleUpdate = () => {
    if (!editInvoice) return;
    updateInvoice(editInvoice.id, editInvoice);
    setShowEditModal(false);
    setEditInvoice(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      deleteInvoice(id);
    }
  };

  const handlePrint = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPreviewModal(true);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return { icon: <CheckCircle className="w-4 h-4" />, text: 'Payée', class: 'from-green-500 to-emerald-500' };
      case 'pending':
        return { icon: <Clock className="w-4 h-4" />, text: 'En attente', class: 'from-amber-500 to-orange-500' };
      case 'overdue':
        return { icon: <AlertCircle className="w-4 h-4" />, text: 'En retard', class: 'from-red-500 to-rose-500' };
      default:
        return { icon: <Clock className="w-4 h-4" />, text: status, class: 'from-gray-500 to-gray-600' };
    }
  };

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Facturation
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {invoices.length} factures
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Nouvelle facture
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-emerald-100 text-sm">Total encaissé</p>
          <p className="text-3xl font-bold mt-1">{totalRevenue.toLocaleString()} DA</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-amber-100 text-sm">En attente</p>
          <p className="text-3xl font-bold mt-1">{pendingAmount.toLocaleString()} DA</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-blue-100 text-sm">Total factures</p>
          <p className="text-3xl font-bold mt-1">{invoices.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher une facture..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-lg"
        />
      </div>

      {/* Invoice List */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice) => {
          const status = getStatusBadge(invoice.status);
          return (
            <div
              key={invoice.id}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${status.class} flex items-center justify-center shadow-lg`}>
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-800 dark:text-white">{invoice.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${status.class} flex items-center gap-1`}>
                      {status.icon}
                      {status.text}
                    </span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {getPatientName(invoice.patientId)} • {format(new Date(invoice.date), 'dd MMM yyyy', { locale: fr })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {invoice.amount.toLocaleString()} DA
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {invoice.items.length} article(s)
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedInvoice(invoice); setShowPreviewModal(true); }}
                    className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900 transition-all hover:scale-105"
                    title="Voir"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => { setEditInvoice(invoice); setShowEditModal(true); }}
                    className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900 transition-all hover:scale-105"
                    title="Modifier"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handlePrint(invoice)}
                    className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-all hover:scale-105"
                    title="Imprimer"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(invoice.id)}
                    className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900 transition-all hover:scale-105"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredInvoices.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Aucune facture trouvée
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Créez votre première facture
            </p>
          </div>
        )}
      </div>

      {/* Modal Nouvelle Facture */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSearchPatient(''); }}
        title="Nouvelle Facture"
        icon={<FileText className="w-7 h-7" />}
        gradient="emerald"
        size="xl"
      >
        <div className="space-y-5">
          {/* Patient Search */}
          <div className="relative">
            <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
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
                    setNewInvoice({ ...newInvoice, patientId: '', patientName: '' });
                  }
                }}
                onFocus={() => setShowPatientDropdown(true)}
                placeholder="Tapez pour rechercher un patient..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-4 focus:ring-emerald-400/30 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              />
            </div>
            {showPatientDropdown && filteredPatients.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/30 dark:hover:to-teal-900/30 flex items-center gap-3 transition-all first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
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

          {/* Items */}
          <div>
            <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
              Articles
            </label>
            <div className="space-y-3">
              {newInvoice.items.map((item, index) => (
                <div key={index} className="flex gap-3 items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Description"
                    className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    placeholder="Qté"
                    className="w-20 px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-center"
                  />
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', parseInt(e.target.value) || 0)}
                    placeholder="Prix"
                    className="w-28 px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-right"
                  />
                  <span className="w-28 text-right font-bold text-emerald-600">{item.total.toLocaleString()} DA</span>
                  {newInvoice.items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addItem}
                className="w-full py-2 border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter un article
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ModalSelect
              label="Statut"
              value={newInvoice.status}
              onChange={(e) => setNewInvoice({ ...newInvoice, status: e.target.value as Invoice['status'] })}
              options={[
                { value: 'pending', label: '⏳ En attente' },
                { value: 'paid', label: '✅ Payée' },
                { value: 'overdue', label: '⚠️ En retard' },
              ]}
              gradient="emerald"
            />
            <ModalInput
              label="Assurance/Mutuelle"
              value={newInvoice.insurance}
              onChange={(e) => setNewInvoice({ ...newInvoice, insurance: e.target.value })}
              placeholder="CNAS, etc."
              gradient="emerald"
            />
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl p-4 flex justify-between items-center">
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">Total</span>
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {newInvoice.items.reduce((sum, item) => sum + item.total, 0).toLocaleString()} DA
            </span>
          </div>

          <ModalButtons
            onCancel={() => { setShowModal(false); setSearchPatient(''); }}
            onSubmit={handleSubmit}
            submitText="Créer la facture"
            gradient="emerald"
          />
        </div>
      </Modal>

      {/* Modal Modifier Facture */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditInvoice(null); }}
        title="Modifier la Facture"
        icon={<Edit className="w-7 h-7" />}
        gradient="blue"
        size="lg"
      >
        {editInvoice && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800">
              <p className="font-semibold text-blue-700 dark:text-blue-300">
                Facture: {editInvoice.id}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Patient: {getPatientName(editInvoice.patientId)}
              </p>
            </div>

            <ModalSelect
              label="Statut"
              value={editInvoice.status}
              onChange={(e) => setEditInvoice({ ...editInvoice, status: e.target.value as Invoice['status'] })}
              options={[
                { value: 'pending', label: '⏳ En attente' },
                { value: 'paid', label: '✅ Payée' },
                { value: 'overdue', label: '⚠️ En retard' },
              ]}
              gradient="blue"
            />

            <ModalInput
              label="Montant (DA)"
              type="number"
              value={editInvoice.amount}
              onChange={(e) => setEditInvoice({ ...editInvoice, amount: parseInt(e.target.value) || 0 })}
              gradient="blue"
            />

            <ModalButtons
              onCancel={() => { setShowEditModal(false); setEditInvoice(null); }}
              onSubmit={handleUpdate}
              submitText="Enregistrer"
              gradient="blue"
            />
          </div>
        )}
      </Modal>

      {/* Modal Preview / Print */}
      {showPreviewModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:p-0 print:bg-white">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto print:max-w-full print:max-h-full print:rounded-none print:shadow-none">
            <div className="p-8 print:p-4" ref={printRef}>
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8 print:mb-4">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent print:text-black">
                    Voxia Manager
                  </h1>
                  <p className="text-gray-500 text-sm">Cabinet d'Audioprothèse</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl">{selectedInvoice.id}</p>
                  <p className="text-gray-500 text-sm">
                    {format(new Date(selectedInvoice.date), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>

              {/* Patient Info */}
              <div className="mb-8 print:mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl print:bg-gray-100">
                <p className="text-sm text-gray-500">Facturé à:</p>
                <p className="font-bold text-lg">{getPatientName(selectedInvoice.patientId)}</p>
              </div>

              {/* Items Table */}
              <table className="w-full mb-8 print:mb-4">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 text-gray-600 dark:text-gray-400">Description</th>
                    <th className="text-center py-3 text-gray-600 dark:text-gray-400">Qté</th>
                    <th className="text-right py-3 text-gray-600 dark:text-gray-400">Prix Unit.</th>
                    <th className="text-right py-3 text-gray-600 dark:text-gray-400">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3">{item.description}</td>
                      <td className="text-center py-3">{item.quantity}</td>
                      <td className="text-right py-3">{item.unitPrice.toLocaleString()} DA</td>
                      <td className="text-right py-3 font-semibold">{item.total.toLocaleString()} DA</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div className="flex justify-end">
                <div className="w-64 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 text-white print:bg-gray-800">
                  <div className="flex justify-between items-center">
                    <span>Total</span>
                    <span className="text-2xl font-bold">{selectedInvoice.amount.toLocaleString()} DA</span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="mt-8 print:mt-4 text-center">
                <span className={`px-4 py-2 rounded-full text-white text-sm font-semibold bg-gradient-to-r ${getStatusBadge(selectedInvoice.status).class}`}>
                  {getStatusBadge(selectedInvoice.status).text}
                </span>
              </div>
            </div>

            {/* Actions (hidden on print) */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end print:hidden">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                Fermer
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:opacity-90 transition-all flex items-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Imprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:p-0, .print\\:p-0 * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  );
};

export default Invoices;
