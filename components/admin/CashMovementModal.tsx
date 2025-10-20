import React, { useState } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '../icons';

interface CashMovementModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'in' | 'out';
    onConfirm: (amount: number, reason: string) => void;
}

const CashMovementModal: React.FC<CashMovementModalProps> = ({ isOpen, onClose, type, onConfirm }) => {
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        const value = parseFloat(amount);
        if (isNaN(value) || value <= 0) {
            alert("Por favor, introduzca un importe válido.");
            return;
        }
        if (!reason.trim()) {
            alert("Por favor, introduzca un motivo.");
            return;
        }
        onConfirm(value, reason.trim());
    };

    const handleNumpad = (value: string) => {
        if (value === 'del') {
            setAmount(b => b.slice(0, -1));
        } else if (value === '.') {
            if (!amount.includes('.')) setAmount(b => b + '.');
        } else {
            setAmount(b => b + value);
        }
    };
    
    // Fix: Avoid dynamic class name concatenation for Tailwind CSS
    const title = type === 'in' ? 'Entrada de Caja' : 'Salida de Caja';
    const Icon = type === 'in' ? ArrowUpTrayIcon : ArrowDownTrayIcon;
    const iconColorClass = type === 'in' ? 'text-green-500' : 'text-red-500';
    const buttonClass = type === 'in' 
        ? 'bg-green-600 hover:bg-green-700' 
        : 'bg-red-600 hover:bg-red-700';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg">
                <div className="flex items-center mb-6">
                    <Icon className={`h-8 w-8 mr-4 ${iconColorClass}`} />
                    <h2 className="text-3xl font-bold text-white">{title}</h2>
                </div>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Motivo</label>
                    <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ej: Cambio, Pago a proveedor..."
                        className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Importe</label>
                    <input
                        type="text"
                        readOnly
                        value={amount}
                        placeholder="0.00"
                        className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg py-3 text-4xl text-right font-mono"
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
                        Cancelar
                    </button>
                    <button onClick={handleConfirm} className={`w-full py-3 rounded-lg font-semibold transition-colors ${buttonClass}`}>
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CashMovementModal;