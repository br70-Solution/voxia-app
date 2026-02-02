import React, { useState } from 'react';
import { Plus, Search, Mail, Shield, Trash2, Edit } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';
import { Modal, ModalInput, ModalSelect, ModalButtons, ModalImageUpload } from '../components/ui/Modal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Users: React.FC = () => {
  const { users, addUser, updateUserById, deleteUser, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'audioprothesiste',
    password: '',
  });

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: UserRole) => {
    const badges = {
      admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      audioprothesiste: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      assistant: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    };
    return badges[role] || 'bg-gray-100 text-gray-700';
  };

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      admin: 'Administrateur',
      audioprothesiste: 'Audioprothésiste',
      assistant: 'Assistant(e)'
    };
    return labels[role] || role;
  };

  const getAvatarForRole = (role: UserRole) => {
    const avatars = {
      admin: '👑',
      audioprothesiste: '👨‍⚕️',
      assistant: '🧑‍💼'
    };
    return avatars[role] || '👤';
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.role) return;

    if (isEditing && formData.id) {
      updateUserById(formData.id, formData);
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role as UserRole,
        password: formData.password || '123456',
        createdAt: new Date(),
        avatar: getAvatarForRole(formData.role as UserRole)
      };
      addUser(newUser);
    }
    closeModal();
  };

  const handleEdit = (user: User) => {
    setFormData(user);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteUser(id);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setFormData({
      name: '',
      email: '',
      role: 'audioprothesiste',
      password: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {users.length} comptes actifs
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher un utilisateur par nom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-lg"
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all border border-gray-200/50 dark:border-gray-700/50 hover:scale-[1.02]"
          >
            {/* User Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-2xl shadow-inner overflow-hidden">
                {user.avatar?.startsWith('http') ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.avatar || '👤'
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadge(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>

            {/* User Info */}
            <div className="mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                {user.name}
                {user.id === currentUser?.id && (
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">Vous</span>
                )}
              </h3>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mt-1">
                <Mail className="w-3 h-3" />
                {user.email}
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-2 text-xs text-gray-400 dark:text-gray-500 mb-5">
              <div className="flex justify-between">
                <span>Créé le:</span>
                <span>{user.createdAt ? format(new Date(user.createdAt), 'dd MMM yyyy', { locale: fr }) : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Dernière connexion:</span>
                <span>{user.lastLogin ? format(new Date(user.lastLogin), 'dd MMM yyyy HH:mm', { locale: fr }) : 'Jamais'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700/50">
              <button
                onClick={() => handleEdit(user)}
                className="flex-1 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </button>
              {user.id !== currentUser?.id && (
                <button
                  onClick={() => handleDelete(user.id)}
                  className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={isEditing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
        icon={<Shield className="w-7 h-7" />}
        gradient="indigo"
        size="lg"
      >
        <div className="space-y-5">
          <ModalInput
            label="Nom complet"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Jean Dupont"
            required
            gradient="indigo"
          />

          <ModalInput
            label="Email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="jean.dupont@audiopro.fr"
            required
            gradient="indigo"
          />

          <ModalSelect
            label="Rôle"
            value={formData.role || 'audioprothesiste'}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            options={[
              { value: 'admin', label: '👑 Administrateur' },
              { value: 'audioprothesiste', label: '👨‍⚕️ Audioprothésiste' },
              { value: 'assistant', label: '🧑‍💼 Assistant(e)' },
            ]}
            required
            gradient="indigo"
          />

          {!isEditing && (
            <ModalInput
              label="Mot de passe temporaire"
              type="password"
              value={formData.password || ''}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Min. 6 caractères"
              gradient="indigo"
            />
          )}

          <ModalImageUpload
            label="Avatar / Photo de profil"
            value={formData.avatar || ''}
            onImageChange={(url) => setFormData({ ...formData, avatar: url })}
            gradient="indigo"
          />
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl flex gap-3 items-start">
            <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-bold">Droits d'accès :</p>
              <ul className="list-disc ml-4 mt-1 space-y-1">
                <li><strong>Admin :</strong> Accès total + gestion utilisateurs.</li>
                <li><strong>Audioprothésiste :</strong> Gestion patients, RDV, facturation.</li>
                <li><strong>Assistant :</strong> Accès lecture seule sur facturation.</li>
              </ul>
            </div>
          </div>

          <ModalButtons
            onCancel={closeModal}
            onSubmit={handleSubmit}
            submitText={isEditing ? "Enregistrer" : "Créer le compte"}
            gradient="indigo"
          />
        </div>
      </Modal>
    </div>
  );
};

export default Users;
