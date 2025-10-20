import React from 'react';
import { AppScreen, Role } from '../types';
import { ChartBarIcon, Cog6ToothIcon, Squares2X2Icon, CubeIcon, UserGroupIcon } from './icons';

interface SidebarProps {
  onNavigate: (view: AppScreen) => void;
  currentView: AppScreen;
  userRole: Role;
}

const NavButton: React.FC<{icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void}> = ({ icon, label, isActive, onClick}) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center space-y-1 w-full p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700'}`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
    </button>
)

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentView, userRole }) => {
  const isAdmin = userRole === 'ADMIN';
  const isManager = userRole === 'MANAGER';
  const isWaiter = userRole === 'WAITER';

  return (
    <aside className="w-24 bg-gray-900 p-3 flex flex-col items-center space-y-4">
      <NavButton
        icon={<Squares2X2Icon className="h-7 w-7" />}
        label="Mesas"
        isActive={currentView === 'table-selection'}
        onClick={() => onNavigate('table-selection')}
      />

      <NavButton
        icon={<UserGroupIcon className="h-7 w-7" />}
        label="Clientes"
        isActive={currentView === 'customers'}
        onClick={() => onNavigate('customers')}
      />

      {(isAdmin || isManager) && (
        <NavButton
            icon={<ChartBarIcon className="h-7 w-7" />}
            label="Gerente"
            isActive={currentView === 'manager'}
            onClick={() => onNavigate('manager')}
        />
      )}

      {isWaiter && (
        <NavButton
          icon={<CubeIcon className="h-7 w-7" />}
          label="Inventario"
          isActive={currentView === 'manager'}
          onClick={() => onNavigate('manager')}
        />
      )}
      
      {isAdmin && (
        <NavButton
            icon={<Cog6ToothIcon className="h-7 w-7" />}
            label="Admin"
            isActive={currentView === 'admin'}
            onClick={() => onNavigate('admin')}
        />
      )}
    </aside>
  );
};

export default Sidebar;