import React, { useState } from 'react';
import { CurrencyEuroIcon } from './icons';

interface OpeningBalanceModalProps {
    onClose: () => void;
    onConfirm: (startingBalance: number) => void;
}

const OpeningBalanceModal: React.FC<OpeningBalanceModalProps> = ({ onClose, onConfirm }) => {
  const [balance, setBalance] = useState('');

  const handleConfirm = () => {
    const balanceValue = parseFloat(balance);
    if (!isNaN(balanceValue) && balanceValue >= 0) {
      onConfirm(balanceValue);
    } else {
      alert("Por favor, introduzca un valor válido.");
    }
  };

  const handleNumpad = (value: string) => {
    if (value === 'del') {
      setBalance(b => b.slice(0, -1));
    } else if (value === '.') {
      if (!balance.includes('.')) {
        setBalance(b => b + '.');
      }
    } else {
      setBalance(b => b + value);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg">
        <h2 className="text-3xl font-bold text-white mb-4 text-center">Iniciar Turno</h2>
        <p className="text-gray-400 mb-6 text-center">Introduce el saldo inicial de la caja para empezar tu turno.</p>
        
        <div className="relative mb-6">
          <CurrencyEuroIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400" />
          <input
            type="text"
            value={balance}
            onChange={(e) => setBalance(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="0.00"
            className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg py-4 pl-16 pr-4 text-4xl text-right font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'].map(key => (
                 <button key={key} onClick={() => handleNumpad(key)} className="text-2xl font-bold bg-gray-700 rounded-lg py-4 hover:bg-gray-600 transition-colors">
                    {key === 'del' ? '⌫' : key}
                </button>
            ))}
        </div>

        <div className="flex justify-between space-x-4">
          <button onClick={onClose} className="w-full py-3 bg-gray-600 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
            Cerrar Sesión
          </button>
          <button onClick={handleConfirm} className="w-full py-3 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition-colors">
            Confirmar e Iniciar
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpeningBalanceModal;
