import React, { useState } from 'react';
import { DollarSign, Plus, Search, TrendingDown, Calendar, Building, CreditCard, Edit, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Expense } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Modal, ModalInput, ModalSelect, ModalTextarea, ModalButtons } from '../components/ui/Modal';

const Expenses: React.FC = () => {
  const { expenses, addExpense, updateExpense, deleteExpense } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Partial<Expense>>({
    date: new Date(),
    category: 'autres',
    description: '',
    amount: undefined,
    supplier: '',
    status: 'en_attente',
    paymentMethod: 'virement',
    notes: '',
  });

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.supplier && expense.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryBadge = (category: Expense['category']) => {
    const badges: Record<string, string> = {
      loyer: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      salaires: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      fournitures: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      equipement: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      maintenance: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      services: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
      autres: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
    };
    return badges[category] || badges.autres;
  };

  const getCategoryLabel = (category: Expense['category']) => {
    const labels: Record<string, string> = {
      loyer: '🏢 Loyer',
      salaires: '💰 Salaires',
      fournitures: '📦 Fournitures',
      equipement: '🔧 Équipement',
      maintenance: '🔨 Maintenance',
      services: '⚡ Services',
      autres: '📄 Autres'
    };
    return labels[category] || category;
  };

  const getStatusBadge = (status: Expense['status']) => {
    const badges: Record<string, { bg: string; text: string; icon: any }> = {
      'payée': { bg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', text: 'Payée', icon: CheckCircle },
      'en_attente': { bg: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300', text: 'En attente', icon: Clock },
      'annulée': { bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', text: 'Annulée', icon: XCircle }
    };
    return badges[status] || badges['en_attente'];
  };

  const getPaymentMethodLabel = (method?: string) => {
    const labels: Record<string, string> = {
      especes: '💵 Espèces',
      cheque: '📋 Chèque',
      virement: '🏦 Virement',
      carte: '💳 Carte'
    };
    return labels[method || 'virement'] || method || '-';
  };

  const getTotalExpenses = () => {
    return expenses
      .filter(e => e.status === 'payée')
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getPendingExpenses = () => {
    return expenses
      .filter(e => e.status === 'en_attente')
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedExpense(null);
    setFormData({
      date: new Date(),
      category: 'autres',
      description: '',
      amount: undefined,
      supplier: '',
      status: 'en_attente',
      paymentMethod: 'virement',
      notes: '',
    });
    setError('');
    setShowModal(true);
  };

  const handleEdit = (expense: Expense) => {
    console.log("Editing expense:", expense);
    setSelectedExpense(expense);
    setIsEditing(true);
    setFormData({ ...expense });
    setError('');
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    console.log("Deleting expense ID:", id);
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      deleteExpense(id);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log("Submitting form, data:", formData);

    if (!formData.description || formData.amount === undefined || formData.amount <= 0) {
      setError('Veuillez remplir tous les champs obligatoires (description et montant positif)');
      return;
    }
    setError('');

    const expense: Expense = {
      id: isEditing ? (selectedExpense?.id || Date.now().toString()) : Date.now().toString(),
      date: formData.date || new Date(),
      category: formData.category || 'autres',
      description: formData.description,
      amount: formData.amount || 0,
      supplier: formData.supplier || '',
      status: formData.status || 'en_attente',
      paymentMethod: formData.paymentMethod || 'virement',
      notes: formData.notes || '',
    };

    if (isEditing) {
      updateExpense(expense.id, expense);
    } else {
      addExpense(expense);
    }

    setShowModal(false);
    setIsEditing(false);
    setFormData({
      date: new Date(),
      category: 'autres',
      description: '',
      amount: undefined,
      supplier: '',
      status: 'en_attente',
      paymentMethod: 'virement',
      notes: '',
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Gestion des Dépenses <span className="text-xs align-top opacity-50 font-normal ml-2">v2.0</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {expenses.length} dépenses enregistrées
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Nouvelle dépense
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Total des dépenses payées</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {getTotalExpenses().toLocaleString('fr-DZ')} DA
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl p-6 border-2 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">Dépenses en attente</p>
              <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                {getPendingExpenses().toLocaleString('fr-DZ')} DA
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg">
              <TrendingDown className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher une dépense (description, fournisseur, catégorie)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-lg"
        />
      </div>

      {/* Table */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Paiement</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredExpenses.map((expense) => {
                const status = getStatusBadge(expense.status);
                const StatusIcon = status.icon;
                return (
                  <tr key={expense.id} className="hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {format(new Date(expense.date), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryBadge(expense.category)}`}>
                        {getCategoryLabel(expense.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{expense.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {expense.amount.toLocaleString('fr-DZ')} DA
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-gray-600 dark:text-gray-400">{getPaymentMethodLabel(expense.paymentMethod)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.bg}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.text}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={isEditing ? "Modifier la dépense" : "Nouvelle dépense"}
        icon={<DollarSign className="w-7 h-7" />}
        gradient="orange"
        size="lg"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModalInput
              label="Date"
              type="date"
              value={formData.date ? format(new Date(formData.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
              required
              gradient="orange"
            />
            <ModalSelect
              label="Catégorie"
              value={formData.category || 'autres'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Expense['category'] })}
              options={[
                { value: 'loyer', label: '🏢 Loyer' },
                { value: 'salaires', label: '💰 Salaires' },
                { value: 'fournitures', label: '📦 Fournitures' },
                { value: 'equipement', label: '🔧 Équipement' },
                { value: 'maintenance', label: '🔨 Maintenance' },
                { value: 'services', label: '⚡ Services' },
                { value: 'autres', label: '📄 Autres' },
              ]}
              required
              gradient="orange"
            />
          </div>

          {error && (
            <p className="text-rose-500 text-sm font-medium animate-shake flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {error}
            </p>
          )}

          <ModalInput
            label="Description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ex: Loyer du local commercial"
            required
            gradient="orange"
          />

          <div className="grid grid-cols-1 gap-4">
            <ModalInput
              label="Montant (DA)"
              type="number"
              value={formData.amount || ''}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setFormData({ ...formData, amount: isNaN(val) ? undefined : val });
              }}
              placeholder="Entrez le montant"
              required
              gradient="orange"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModalSelect
              label="Statut"
              value={formData.status || 'en_attente'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Expense['status'] })}
              options={[
                { value: 'payée', label: '✅ Payée' },
                { value: 'en_attente', label: '⏳ En attente' },
                { value: 'annulée', label: '❌ Annulée' },
              ]}
              required
              gradient="orange"
            />
            <ModalSelect
              label="Mode de paiement"
              value={formData.paymentMethod || 'virement'}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as Expense['paymentMethod'] })}
              options={[
                { value: 'virement', label: '🏦 Virement' },
                { value: 'cheque', label: '📋 Chèque' },
                { value: 'especes', label: '💵 Espèces' },
                { value: 'carte', label: '💳 Carte' },
              ]}
              gradient="orange"
            />
          </div>

          <ModalButtons
            onCancel={closeModal}
            onSubmit={handleSubmit}
            submitText={isEditing ? "Mettre à jour" : "Enregistrer la dépense"}
            gradient="orange"
          />
        </div>
      </Modal>
    </div>
  );
};

export default Expenses;
