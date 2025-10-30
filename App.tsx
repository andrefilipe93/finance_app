
import React, { useState, useMemo } from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import DashboardView from './components/views/DashboardView';
import HistoryView from './components/views/HistoryView';
import SettingsView from './components/views/SettingsView';
import TransactionModal from './components/TransactionModal';
import type { View } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');

  const CurrentView = useMemo(() => {
    switch (activeView) {
      case 'history':
        return HistoryView;
      case 'settings':
        return SettingsView;
      case 'dashboard':
      default:
        return DashboardView;
    }
  }, [activeView]);

  return (
    <AppProvider>
      <Layout activeView={activeView} setActiveView={setActiveView}>
        <CurrentView />
      </Layout>
      <TransactionModal />
    </AppProvider>
  );
};

export default App;
