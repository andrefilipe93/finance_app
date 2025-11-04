

import * as React from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import HomeView from './components/views/HomeView';
import DashboardView from './components/views/DashboardView'; // Alterado de ChartsView para DashboardView
import HistoryView from './components/views/HistoryView';
import SettingsView from './components/views/SettingsView';
import BudgetsView from './components/views/BudgetsView';
import TransactionModal from './components/TransactionModal';
import AddTransactionFlowModal from './components/AddTransactionFlowModal';
import BudgetModal from './components/BudgetModal';
import BudgetPlanningView from './components/views/BudgetPlanningView';
import ProgressView from './components/views/ProgressView';
import AchievementNotification from './components/AchievementNotification';
import type { View } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = React.useState<View>('home');

  return (
    <AppProvider>
      <Layout activeView={activeView} setActiveView={setActiveView}>
        {activeView === 'home' && <HomeView setActiveView={setActiveView} />}
        {activeView === 'charts' && <DashboardView />} 
        {activeView === 'history' && <HistoryView />}
        {activeView === 'budgets' && <BudgetsView />}
        {activeView === 'budget-planning' && <BudgetPlanningView />}
        {activeView === 'progress' && <ProgressView />}
        {activeView === 'settings' && <SettingsView />}
      </Layout>
      <TransactionModal />
      <AddTransactionFlowModal />
      <BudgetModal />
      <AchievementNotification />
    </AppProvider>
  );
};

export default App;