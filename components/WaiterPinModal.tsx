import React, { useState, useEffect } from 'react';
import { Waiter } from '../types';
import { KeyIcon, XMarkIcon } from './icons';

interface WaiterPinModalProps {
  waiter: Waiter | null;
  onClose: () => void;
  onLogin: (waiter: Waiter) => void;
}

const WaiterPinModal: React.FC<WaiterPinModalProps> = ({ waiter, onClose, onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Reset pin when waiter changes
    setPin('');
    setError('');
  }, [waiter]);

  if (!waiter) return null;

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(pin + digit);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleLoginAttempt = () => {
    if (pin === waiter.pin) {
      onLogin(waiter);
    } else {
      setError('PIN incorrecto. Inténtalo de nuevo.');
      setPin('');
    }
  };

  // Handle enter key press
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && pin.length === 4) {
        handleLoginAttempt();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [pin, waiter, onLogin]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Introducir PIN para {waiter.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex justify-center items-center space-x-4 my-6">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-12 h-16 flex items-center justify-center text-4xl font-bold rounded-lg ${pin.length > i ? 'bg-indigo-500 text-white' : 'bg-gray-700'}`}>
              {pin.length > i ? '•' : ''}
            </div>
          ))}
        </div>

        {error && <p className="text-red-500 text-center mb-4 animate-shake">{error}</p>}
        
        <div className="grid grid-cols-3 gap-4">
          {[...Array(9).keys()].map(i => (
            <button key={i + 1} onClick={() => handlePinInput((i + 1).toString())} className="text-3xl font-bold bg-gray-700 rounded-lg p-5 hover:bg-gray-600 transition-colors">
              {i + 1}
            </button>
          ))}
          <button onClick={handleDelete} className="text-3xl font-bold bg-gray-700 rounded-lg p-5 hover:bg-gray-600">
            {'<'}
          </button>
          <button onClick={() => handlePinInput('0')} className="text-3xl font-bold bg-gray-700 rounded-lg p-5 hover:bg-gray-600">
            0
          </button>
          <button onClick={handleLoginAttempt} disabled={pin.length !== 4} className="text-3xl font-bold bg-green-600 rounded-lg p-5 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed">
            <KeyIcon className="h-8 w-8 mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaiterPinModal;
