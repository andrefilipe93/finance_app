

import * as React from 'react';
import { HomeIcon, DashboardIcon, HistoryIcon, SettingsIcon, PlusIcon, TargetIcon, DocumentAddIcon, TrophyIcon } from './icons';
import type { View } from '../types';
import { useAppContext } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavItem: React.FC<{
  view: View;
  activeView: View;
  setActiveView: (view: View) => void;
  icon: React.ReactNode;
  label: string;
}> = ({ view, activeView, setActiveView, icon, label }) => {
  const isActive = activeView === view;
  const activeClasses = 'bg-blue-600 text-white';
  const inactiveClasses = 'text-gray-400 hover:bg-gray-700 hover:text-white';
  
  return (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center justify-center md:justify-start w-full p-3 my-1 rounded-lg transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span className="hidden md:inline md:ml-4">{label}</span>
    </button>
  );
};

const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView }) => {
  const { openAddTransactionModal } = useAppContext();
  
  const navItems = [
    { view: 'home' as View, icon: <HomeIcon />, label: 'Início' },
    { view: 'history' as View, icon: <HistoryIcon />, label: 'Histórico' },
    { view: 'charts' as View, icon: <DashboardIcon />, label: 'Gráficos' },
    { view: 'budgets' as View, icon: <TargetIcon />, label: 'Orçamentos' },
    { view: 'budget-planning' as View, icon: <DocumentAddIcon />, label: 'Planeamento' },
    { view: 'progress' as View, icon: <TrophyIcon />, label: 'Progresso' },
    { view: 'settings' as View, icon: <SettingsIcon />, label: 'Configurações' },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex md:flex-col w-64 bg-gray-100 dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-blue-500 mb-8">GestorApp</h1>
        <nav className="flex-grow">
          {navItems.map(item => <NavItem key={item.view} {...item} activeView={activeView} setActiveView={setActiveView} />)}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
        {children}
      </main>

      {/* Floating Action Button */}
      <div className="fixed md:hidden bottom-24 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={openAddTransactionModal}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-transform transform hover:scale-110"
          aria-label="Adicionar novo movimento"
        >
          <PlusIcon className="w-8 h-8" />
        </button>
      </div>
       <div className="hidden md:block fixed bottom-8 right-8 z-30">
        <button
          onClick={openAddTransactionModal}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-transform transform hover:scale-110"
          aria-label="Adicionar novo movimento"
        >
          <PlusIcon className="w-8 h-8" />
        </button>
      </div>
      
      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around p-2 z-40">
        {navItems.map(item => (
          <button
            key={item.view}
            onClick={() => setActiveView(item.view)}
            className={`flex flex-col items-center justify-center p-2 rounded-md w-full transition-colors ${activeView === item.view ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;