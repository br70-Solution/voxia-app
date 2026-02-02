import React, { useState } from 'react';
import { User, Mail, Lock, Camera, Save, Shield, MapPin, Calendar, Sparkles } from 'lucide-react';
import { ModalImageUpload } from '../components/ui/Modal';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Profile: React.FC = () => {
  const { currentUser, updateUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatar: currentUser?.avatar || ''
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Pour l'instant, on utilise un objet URL local
      // En production, vous devriez uploader vers un serveur et récupérer l'URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUrlChange = (url: string) => {
    setFormData({ ...formData, avatar: url });
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.name || !formData.email) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Veuillez entrer une adresse email valide');
      return;
    }

    // Si modification du mot de passe
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        alert('Veuillez entrer votre mot de passe actuel');
        return;
      }
      if (formData.currentPassword !== currentUser?.password) {
        alert('Mot de passe actuel incorrect');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        alert('Les nouveaux mots de passe ne correspondent pas');
        return;
      }
      if (formData.newPassword.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }
    }

    // Mise à jour des données
    const updatedData: any = {
      name: formData.name,
      email: formData.email,
      avatar: formData.avatar
    };

    // Mettre à jour le mot de passe si fourni
    if (formData.newPassword) {
      updatedData.password = formData.newPassword;
    }

    updateUser(updatedData);

    setSuccessMessage('Profil mis à jour avec succès !');
    setIsEditing(false);

    // Masquer le message de succès après 3 secondes
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      avatar: currentUser?.avatar || ''
    });
    setIsEditing(false);
  };

  const getRoleBadge = (role?: string) => {
    const badges: any = {
      admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      audioprothesiste: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      assistant: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    };
    return badges[role || ''] || 'bg-gray-100 text-gray-700';
  };

  const getRoleLabel = (role?: string) => {
    const labels: any = {
      admin: 'Administrateur 👑',
      audioprothesiste: 'Audioprothésiste 👨‍⚕️',
      assistant: 'Assistant(e) 🧑‍💼'
    };
    return labels[role || ''] || role;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          Mon Profil
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Gérez vos informations personnelles
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in">
          {successMessage}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-500 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-sm p-1 shadow-2xl">
                <div className="w-full h-full rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                  {formData.avatar?.startsWith('http') || formData.avatar?.startsWith('data:') ? (
                    <img
                      src={formData.avatar}
                      alt={formData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">{currentUser?.avatar || '👤'}</span>
                  )}
                </div>
              </div>
              {isEditing && (
                <>
                  <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform group">
                    <Camera className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>

            {/* Profile Info */}
            <div className="text-center md:text-left text-white">
              <h2 className="text-2xl md:text-3xl font-bold">{currentUser?.name}</h2>
              <p className="text-white/80 mt-1">{currentUser?.email}</p>
              <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm`}>
                  {getRoleLabel(currentUser?.role)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Membre depuis</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {currentUser?.createdAt ? format(new Date(currentUser.createdAt), 'dd MMM yyyy', { locale: fr }) : '-'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Rôle</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {getRoleLabel(currentUser?.role)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">ID Utilisateur</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {currentUser?.id}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-6">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-medium"
              >
                <User className="w-4 h-4" />
                Modifier mon profil
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form Modal-like Card */}
      {isEditing && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8 animate-fade-in">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Informations personnelles
          </h3>

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="Ex: Jean Dupont"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Adresse email
                </div>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="jean.dupont@audiopro.fr"
              />
            </div>

            <ModalImageUpload
              label="Photo de profil"
              value={formData.avatar || ''}
              onImageChange={(url) => setFormData({ ...formData, avatar: url })}
              gradient="indigo"
            />
          </div>

          {/* Password Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Changer le mot de passe
            </h3>

            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Laissez les champs mot de passe vides si vous ne souhaitez pas le modifier.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
