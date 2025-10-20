import React, { useState } from 'react';
import { Waiter, RestaurantSettings } from '../types';
import WaiterPinModal from './WaiterPinModal';
import { UserCircleIcon } from './icons';

interface WaiterSelectionScreenProps {
  waiters: Waiter[];
  onSelect: (waiter: Waiter) => void;
  settings: RestaurantSettings;
}

const WaiterSelectionScreen: React.FC<WaiterSelectionScreenProps> = ({ waiters, onSelect, settings }) => {
  const [selectedWaiter, setSelectedWaiter] = useState<Waiter | null>(null);

  return (
    <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center p-8">
       {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="h-32 mb-8" />}
       <h1 className="text-5xl font-bold text-white mb-12">Bienvenido a {settings.name}</h1>
      <h2 className="text-3xl text-gray-300 mb-10">Seleccione su usuario</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {waiters.map(waiter => (
          <button 
            key={waiter.id} 
            onClick={() => setSelectedWaiter(waiter)}
            className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-2xl shadow-lg hover:bg-indigo-600 hover:scale-105 transform transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500"
          >
            <UserCircleIcon className="w-24 h-24 text-gray-400 mb-4" />
            <span className="text-2xl font-semibold text-white">{waiter.name}</span>
          </button>
        ))}
      </div>

      {selectedWaiter && (
        <WaiterPinModal
          waiter={selectedWaiter}
          onClose={() => setSelectedWaiter(null)}
          onLogin={(waiter) => {
            onSelect(waiter);
            setSelectedWaiter(null);
          }}
        />
      )}
    </div>
  );
};

export default WaiterSelectionScreen;
