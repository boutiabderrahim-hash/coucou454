import React, { useState } from 'react';
import { InventoryItem } from '../../types';
import { XMarkIcon, PlusIcon, MinusIcon } from '../icons';

interface StockAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number, reason: string) => void;
    item: InventoryItem;
    type: 'add' | 'subtract';
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ isOpen, onClose, onConfirm, item, type }) => {
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            alert('Por favor, introduce una cantidad válida.');
            return;
        }
        onConfirm(numAmount, reason);
    };

    const title = type === 'add' ? `Añadir Stock: ${item.name}` : `Restar Stock: ${item.name}`;
    const Icon = type === 'add' ? PlusIcon : MinusIcon;
    const colorClass = type === 'add' ? 'text-green-400' : 'text-red-400';
    const buttonClass = type === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                        <div className="flex items-center">
                            <Icon className={`h-6 w-6 mr-3 ${colorClass}`} />
                            <h2 className="text-xl font-bold text-white">{title}</h2>
                        </div>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-gray-400">
                            Cantidad Actual: <span className="font-bold text-white">{item.quantity} {item.unit}</span>
                        </p>
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-300">
                                Cantidad a {type === 'add' ? 'Añadir' : 'Restar'}
                            </label>
                            <input
                                type="number"
                                name="amount"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3"
                                required
                                autoFocus
                                step="any"
                            />
                        </div>
                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-300">Motivo (Opcional)</label>
                            <input
                                type="text"
                                name="reason"
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Ej: Entrega, Rotura, Recuento..."
                                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3"
                            />
                        </div>
                    </div>
                    <div className="p-6 bg-gray-900 rounded-b-2xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 rounded-lg font-semibold hover:bg-gray-700">Cancelar</button>
                        <button type="submit" className={`py-2 px-4 rounded-lg font-semibold ${buttonClass}`}>Confirmar Ajuste</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockAdjustmentModal;