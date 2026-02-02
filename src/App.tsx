import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import Patients from './pages/Patients';
import Agenda from './pages/Agenda';
import Audiograms from './pages/Audiograms';
import Devices from './pages/Devices';
import { Statistics } from './pages/Statistics';
import Invoices from './pages/Invoices';
import Users from './pages/Users';
import { Settings } from './pages/Settings';
import Profile from './pages/Profile';
import Expenses from './pages/Expenses';
import Stock from './pages/Stock';
import Login from './pages/Login';

function AppContent() {
  const { currentUser } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!currentUser) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'patients':
        return <Patients />;
      case 'agenda':
        return <Agenda />;
      case 'audiograms':
        return <Audiograms />;
      case 'devices':
        return <Devices />;
      case 'statistics':
        return <Statistics />;
      case 'invoices':
        return <Invoices />;
      case 'expenses':
        return <Expenses />;
      case 'stock':
        return <Stock />;
      case 'users':
        return <Users />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
