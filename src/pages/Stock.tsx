import React, { useState } from 'react';
import { Package, Plus, Search, AlertTriangle, ShoppingCart, Edit, Trash2, RefreshCw, Box, TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StockItem } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Modal, ModalInput, ModalSelect, ModalTextarea, ModalButtons, ModalImageUpload } from '../components/ui/Modal';

const Stock: React.FC = () => {
  const { stockItems, addStockItem, updateStockItem, deleteStockItem, restockStockItem } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  const [formData, setFormData] = useState<Partial<StockItem>>({
    name: '',
    category: 'consommable',
    sku: '',
    brand: '',
    unit: 'unite',
    quantity: 0,
    minQuantity: 5,
    maxQuantity: 50,
    purchasePrice: 0,
    salePrice: 0,
    location: '',
    supplier: '',
    image: '',
    notes: '',
  });

  const [restockFormData, setRestockFormData] = useState({
    quantity: 0,
  });

  const filteredStockItems = stockItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryBadge = (category: StockItem['category']) => {
    const badges: Record<string, string> = {
      prothese: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      accessoire: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      consommable: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      equipement: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return badges[category] || badges.consommable;
  };

  const getCategoryLabel = (category: StockItem['category']) => {
    const labels: Record<string, string> = {
      prothese: '🎧 Prothèse',
      accessoire: '🔌 Accessoire',
      consommable: '📦 Consommable',
      equipement: '⚙️ Équipement'
    };
    return labels[category] || category;
  };

  const getUnitLabel = (unit: StockItem['unit']) => {
    const labels: Record<string, string> = {
      unite: 'Unité',
      paires: 'Paires',
      pack: 'Pack'
    };
    return labels[unit] || unit;
  };

  const getLowStockItems = () => {
    return stockItems.filter(item => item.quantity <= item.minQuantity);
  };

  const getTotalStockValue = () => {
    return stockItems.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
  };

  const getStockStatus = (item: StockItem) => {
    if (item.quantity <= item.minQuantity) {
      return { label: 'Critique', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: AlertTriangle };
    } else if (item.quantity <= item.maxQuantity * 0.5) {
      return { label: 'Bas', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300', icon: TrendingDown };
    } else {
      return { label: 'Normal', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: TrendingUp };
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.category || !formData.purchasePrice || !formData.salePrice) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const stockItem: StockItem = {
      id: isEditing ? (selectedItem?.id || Date.now().toString()) : Date.now().toString(),
      name: formData.name || '',
      category: formData.category || 'consommable',
      sku: formData.sku,
      brand: formData.brand,
      unit: formData.unit || 'unite',
      quantity: formData.quantity || 0,
      minQuantity: formData.minQuantity || 5,
      maxQuantity: formData.maxQuantity || 50,
      purchasePrice: formData.purchasePrice || 0,
      salePrice: formData.salePrice || 0,
      location: formData.location,
      supplier: formData.supplier,
      image: formData.image,
      notes: formData.notes,
      lastRestock: isEditing ? selectedItem?.lastRestock : new Date(),
    };

    if (isEditing) {
      updateStockItem(stockItem.id, stockItem);
    } else {
      addStockItem(stockItem);
    }

    setShowModal(false);
    setIsEditing(false);
    setFormData({
      name: '',
      category: 'consommable',
      sku: '',
      brand: '',
      unit: 'unite',
      quantity: 0,
      minQuantity: 5,
      maxQuantity: 50,
      purchasePrice: 0,
      salePrice: 0,
      location: '',
      supplier: '',
      image: '',
      notes: '',
    });
  };

  const handleEdit = (item: StockItem) => {
    setSelectedItem(item);
    setIsEditing(true);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article du stock ?')) {
      deleteStockItem(id);
    }
  };

  const handleRestock = (item: StockItem) => {
    setSelectedItem(item);
    setRestockFormData({ quantity: 0 });
    setShowRestockModal(true);
  };

  const handleRestockSubmit = () => {
    if (!selectedItem) return;

    if (restockFormData.quantity <= 0) {
      alert('Veuillez entrer une quantité valide');
      return;
    }

    restockStockItem(selectedItem.id, restockFormData.quantity);
    setShowRestockModal(false);
    setRestockFormData({ quantity: 0 });
    setSelectedItem(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setFormData({
      name: '',
      category: 'consommable',
      sku: '',
      brand: '',
      unit: 'unite',
      quantity: 0,
      minQuantity: 5,
      maxQuantity: 50,
      purchasePrice: 0,
      salePrice: 0,
      location: '',
      supplier: '',
      image: '',
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Gestion du Stock
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {stockItems.length} articles enregistrés
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Nouvel article
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Valeur totale du stock</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {getTotalStockValue().toLocaleString('fr-DZ')} DA
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-6 border-2 border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">Stock bas</p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {getLowStockItems().length} articles
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
              <TrendingDown className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl p-6 border-2 border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Stock critique</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {getLowStockItems().filter(item => item.quantity <= item.minQuantity).length} articles
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher un article (nom, SKU, marque, catégorie)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-lg"
        />
      </div>

      {/* Stock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStockItems.map((item) => {
          const status = getStockStatus(item);
          const StatusIcon = status.icon;
          return (
            <div
              key={item.id}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all border border-gray-200/50 dark:border-gray-700/50 hover:scale-[1.02]"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center shadow-inner overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover p-1" />
                  ) : (
                    <Package className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestock(item)}
                    className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                    title="Réapprovisionner"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="mb-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  {item.sku && (
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                      {item.sku}
                    </span>
                  )}
                  {item.brand && (
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {item.brand}
                    </span>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryBadge(item.category)}`}>
                  {getCategoryLabel(item.category)}
                </span>
              </div>

              {/* Quantity */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Quantité</span>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">{getUnitLabel(item.unit)}</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${item.quantity <= item.minQuantity ? 'bg-red-500' : item.quantity <= item.maxQuantity * 0.5 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min((item.quantity / item.maxQuantity) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>Min: {item.minQuantity}</span>
                  <span>Max: {item.maxQuantity}</span>
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Prix achat</p>
                  <p className="font-bold text-blue-700 dark:text-blue-300">
                    {item.purchasePrice.toLocaleString('fr-DZ')} DA
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                  <p className="text-xs text-green-600 dark:text-green-400 mb-1">Prix vente</p>
                  <p className="font-bold text-green-700 dark:text-green-300">
                    {item.salePrice.toLocaleString('fr-DZ')} DA
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Box className="w-3 h-3" />
                    <span>{item.location || 'Non défini'}</span>
                  </div>
                  <div>
                    {item.lastRestock ? (
                      <span>Dernier réapprovisionnement: {format(new Date(item.lastRestock), 'dd MMM', { locale: fr })}</span>
                    ) : (
                      <span>Pas de réapprovisionnement</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredStockItems.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-4">
            <Package className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Aucun article trouvé
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Essayez une autre recherche' : 'Commencez par ajouter des articles au stock'}
          </p>
        </div>
      )}

      {/* Modal Nouvel Article */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={isEditing ? "Modifier l'article" : "Nouvel article"}
        icon={<Package className="w-7 h-7" />}
        gradient="emerald"
        size="2xl"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <ModalInput
                label="Nom de l'article *"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Pile zinc-air 312"
                required
                gradient="emerald"
              />
            </div>

            <ModalSelect
              label="Catégorie *"
              value={formData.category || 'consommable'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as StockItem['category'] })}
              options={[
                { value: 'prothese', label: '🎧 Prothèse' },
                { value: 'accessoire', label: '🔌 Accessoire' },
                { value: 'consommable', label: '📦 Consommable' },
                { value: 'equipement', label: '⚙️ Équipement' },
              ]}
              required
              gradient="emerald"
            />

            <ModalInput
              label="SKU / Code-barres"
              value={formData.sku || ''}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="Ex: PZ312-100"
              gradient="emerald"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModalInput
              label="Marque"
              value={formData.brand || ''}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Ex: Rayovac"
              gradient="emerald"
            />

            <ModalSelect
              label="Unité *"
              value={formData.unit || 'unite'}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value as StockItem['unit'] })}
              options={[
                { value: 'unite', label: 'Unité' },
                { value: 'paires', label: 'Paires' },
                { value: 'pack', label: 'Pack' },
              ]}
              required
              gradient="emerald"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ModalInput
              label="Quantité actuelle *"
              type="number"
              value={formData.quantity || 0}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              required
              gradient="emerald"
            />

            <ModalInput
              label="Quantité min. *"
              type="number"
              value={formData.minQuantity || 5}
              onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 5 })}
              required
              gradient="emerald"
            />

            <ModalInput
              label="Quantité max. *"
              type="number"
              value={formData.maxQuantity || 50}
              onChange={(e) => setFormData({ ...formData, maxQuantity: parseInt(e.target.value) || 50 })}
              required
              gradient="emerald"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModalInput
              label="Prix achat (DA) *"
              type="number"
              value={formData.purchasePrice || 0}
              onChange={(e) => setFormData({ ...formData, purchasePrice: parseInt(e.target.value) || 0 })}
              required
              gradient="emerald"
            />

            <ModalInput
              label="Prix vente (DA) *"
              type="number"
              value={formData.salePrice || 0}
              onChange={(e) => setFormData({ ...formData, salePrice: parseInt(e.target.value) || 0 })}
              required
              gradient="emerald"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModalInput
              label="Emplacement"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex: Étagère A1"
              gradient="emerald"
            />

            <ModalInput
              label="Fournisseur"
              value={formData.supplier || ''}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              placeholder="Ex: Audio Supplies Algeria"
              gradient="emerald"
            />
          </div>

          <ModalImageUpload
            label="Image de l'article"
            value={formData.image || ''}
            onImageChange={(url) => setFormData({ ...formData, image: url })}
            gradient="emerald"
          />

          <ModalTextarea
            label="Notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notes supplémentaires..."
            gradient="emerald"
          />

          <ModalButtons
            onCancel={closeModal}
            onSubmit={handleSubmit}
            submitText={isEditing ? "Mettre à jour" : "Enregistrer l'article"}
            gradient="emerald"
          />
        </div>
      </Modal>

      {/* Modal Réapprovisionnement */}
      <Modal
        isOpen={showRestockModal}
        onClose={() => setShowRestockModal(false)}
        title="Réapprovisionner"
        icon={<RefreshCw className="w-7 h-7" />}
        gradient="emerald"
        size="md"
      >
        <div className="space-y-5">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
            <p className="font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
              {selectedItem?.name}
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Stock actuel: {selectedItem?.quantity} {getUnitLabel(selectedItem?.unit || 'unite')}
            </p>
          </div>

          <ModalInput
            label="Quantité à ajouter *"
            type="number"
            value={restockFormData.quantity}
            onChange={(e) => setRestockFormData({ ...restockFormData, quantity: parseInt(e.target.value) || 0 })}
            placeholder="0"
            required
            gradient="emerald"
          />

          <ModalButtons
            onCancel={() => setShowRestockModal(false)}
            onSubmit={handleRestockSubmit}
            submitText="Réapprovisionner"
            gradient="emerald"
          />
        </div>
      </Modal>
    </div>
  );
};

export default Stock;
