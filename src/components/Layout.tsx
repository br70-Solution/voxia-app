import { ReactNode, useState } from 'react';
import {
  Home, Users, Calendar, Headphones, BarChart3,
  FileText, Settings, Menu, X, Ear, Moon, Sun, Bell, ChevronDown, LogOut, Shield, User as UserIcon, DollarSign, Package
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { isSameDay, format, isAfter, isBefore, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { currentUser, darkMode, toggleDarkMode, logout, appointments, stockItems, invoices, patients } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Generate notifications
  const notifications = [
    ...appointments
      .filter(a => isSameDay(new Date(a.date), new Date()) && a.status !== 'cancelled')
      .map(a => ({
        id: `apt-${a.id}`,
        title: 'Rendez-vous aujourd\'hui',
        description: `${patients.find(p => p.id === a.patientId)?.firstName || 'Patient'} - ${format(new Date(a.date), 'HH:mm')}`,
        icon: Calendar,
        color: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        time: a.date,
        targetPage: 'agenda'
      })),
    ...stockItems
      .filter(s => s.quantity <= s.minQuantity)
      .map(s => ({
        id: `stock-${s.id}`,
        title: 'Stock critique',
        description: `${s.name} (${s.quantity} restants)`,
        icon: Package,
        color: 'text-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        time: new Date(),
        targetPage: 'stock'
      })),
    ...invoices
      .filter(i => i.status === 'overdue')
      .map(i => ({
        id: `inv-${i.id}`,
        title: 'Facture en retard',
        description: `${patients.find(p => p.id === i.patientId)?.firstName || 'Patient'} - ${i.amount.toLocaleString()} DA`,
        icon: FileText,
        color: 'text-rose-500',
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        time: i.date,
        targetPage: 'invoices'
      }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const navigation = [
    { name: 'Tableau de bord', icon: Home, id: 'dashboard' },
    { name: 'Patients', icon: Users, id: 'patients' },
    { name: 'Agenda', icon: Calendar, id: 'agenda' },
    { name: 'Audiogrammes', icon: Ear, id: 'audiograms' },
    { name: 'Prothèses', icon: Headphones, id: 'devices' },
    { name: 'Facturation', icon: FileText, id: 'invoices' },
    { name: 'Dépenses', icon: DollarSign, id: 'expenses' },
    { name: 'Stock', icon: Package, id: 'stock' },
    { name: 'Statistiques', icon: BarChart3, id: 'statistics' },
  ];

  if (currentUser?.role === 'admin') {
    navigation.push({ name: 'Utilisateurs', icon: Shield, id: 'users' });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex">

      {/* Sidebar - Dark Professional Theme */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 lg:static flex flex-col`}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-indigo-500/20 rounded-lg">
              <Logo size={32} className="text-indigo-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Voxia
              </h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Manager Voxia</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Menu Principal
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={`group w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                <span className="font-medium text-sm">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                  {currentUser?.name?.charAt(0) || 'A'}
                </div>
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                  {currentUser?.name}
                </p>
                <p className="text-xs text-slate-500 truncate">{currentUser?.role}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden animate-scale-in origin-bottom z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setUserMenuOpen(false);
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    Mon Profil
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('settings');
                      setUserMenuOpen(false);
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </button>
                  <div className="border-t border-slate-700 my-1"></div>
                  <button
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-40">
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors group"
              title={darkMode ? "Mode clair" : "Mode sombre"}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
              ) : (
                <Moon className="w-5 h-5 group-hover:text-indigo-600 transition-colors" />
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative p-2.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors ${notificationsOpen ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-in origin-top-right z-50">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
                    <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full">
                      {notifications.length} nouvelles
                    </span>
                  </div>
                  <div className="max-h-[70vh] overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.map((notif) => {
                          const NotifIcon = notif.icon;
                          return (
                            <div
                              key={notif.id}
                              onClick={() => {
                                if (notif.targetPage) {
                                  onNavigate(notif.targetPage);
                                  setNotificationsOpen(false);
                                }
                              }}
                              className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                            >
                              <div className="flex gap-4">
                                <div className={`w-10 h-10 rounded-xl ${notif.bg} flex items-center justify-center shrink-0`}>
                                  <NotifIcon className={`w-5 h-5 ${notif.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {notif.title}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                    {notif.description}
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                                    {format(new Date(notif.time), 'HH:mm')} • {format(new Date(notif.time), 'dd MMM', { locale: fr })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Aucune nouvelle notification</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="w-full py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-t border-slate-100 dark:border-slate-800"
                    >
                      Tout marquer comme lu
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

