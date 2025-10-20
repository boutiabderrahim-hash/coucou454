import React, { useState, useEffect, useRef } from 'react';
import { Waiter, AppScreen, InventoryItem } from '../types';
import { ArrowRightOnRectangleIcon, HomeIcon, UserCircleIcon, BellIcon, ExclamationTriangleIcon } from './icons';

interface HeaderProps {
  waiter: Waiter;
  tableNumber?: number;
  onLogout: () => void;
  onKickDrawer: () => void;
  onNavigate: (view: AppScreen) => void;
  currentView: AppScreen;
  onEndShift: () => void;
  lowStockItems: InventoryItem[];
}

const Header: React.FC<HeaderProps> = ({ waiter, tableNumber, onLogout, onKickDrawer, onNavigate, currentView, onEndShift, lowStockItems }) => {
  const [isLowStockPopoverOpen, setLowStockPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && bellRef.current && !bellRef.current.contains(event.target as Node)) {
            setLowStockPopoverOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getTitle = () => {
    if (currentView === 'order' && tableNumber) return `Mesa ${tableNumber}`;
    if (currentView === 'table-selection') return 'Selección de Mesa';
    if (currentView === 'admin') return 'Panel de Administrador';
    if (currentView === 'manager') return 'Panel de Gerente';
    return 'TPV';
  };

  const hasLowStock = lowStockItems.length > 0;

  return (
    <header className="bg-gray-900 shadow-md p-2 flex items-center justify-between z-10">
      <div className="flex items-center">
        <button onClick={() => onNavigate('table-selection')} className="p-2 rounded-md hover:bg-gray-700">
            <HomeIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold ml-4">{getTitle()}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={onKickDrawer} className="hidden md:block px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600">
          Abrir Caja
        </button>
        {(waiter.role === 'ADMIN' || waiter.role === 'MANAGER') && (
          <button onClick={onEndShift} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700">
            Cerrar Turno
          </button>
        )}

        <div className="relative">
            <button 
                ref={bellRef}
                onClick={() => setLowStockPopoverOpen(!isLowStockPopoverOpen)} 
                className="p-2 rounded-md hover:bg-gray-700 relative"
                aria-label="Notificaciones de inventario bajo"
            >
                <BellIcon className={`h-6 w-6 ${hasLowStock ? 'text-yellow-400' : 'text-gray-400'}`} />
                {hasLowStock && (
                    <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-600 border-2 border-gray-900"></span>
                )}
            </button>
            {isLowStockPopoverOpen && hasLowStock && (
                <div ref={popoverRef} className="absolute right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 animate-fade-in-up">
                    <div className="p-4 border-b border-gray-700">
                        <h3 className="text-md font-bold text-white flex items-center">
                            <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-400" />
                            Alerta de Stock Bajo
                        </h3>
                    </div>
                    <ul className="py-2 max-h-64 overflow-y-auto">
                        {lowStockItems.map(item => (
                            <li key={item.id} className="px-4 py-2 flex justify-between items-center">
                                <span className="font-semibold">{item.name}</span>
                                <span className="text-sm font-bold text-red-500">{item.quantity} {item.unit}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

        <div className="flex items-center">
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
            <span className="ml-2 font-semibold">{waiter.name}</span>
        </div>
        <button onClick={onLogout} className="p-2 rounded-md hover:bg-gray-700">
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;