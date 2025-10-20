import React, { useState } from 'react';
import { Customer, Payment } from '../../types';
import { XMarkIcon, CurrencyEuroIcon, CreditCardIcon } from '../icons';
import { formatCurrency } from '../../utils/helpers';

interface CreditPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (customerId: string, payment: Payment) => void;
    customer: Customer;
}

const CreditPaymentModal: React.FC<CreditPaymentModalProps> = ({ isOpen, onClose, onConfirm, customer }) => {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<'cash' | 'card'>('cash');

    if (!isOpen) return null;

    const handleConfirm = () => {
        const value = parseFloat(amount);
        if (isNaN(value) || value <= 0) {
            alert("Por favor, introduzca un importe válido.");
            return;
        }
        if (value > customer.creditBalance) {
            if (!window.confirm(`El importe introducido (${formatCurrency(value)}) es mayor que la deuda (${formatCurrency(customer.creditBalance)}). ¿Desea continuar?`)) {
                return;
            }
        }
        onConfirm(customer.id, { method, amount: value });
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Registrar Pago para {customer.name}</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="p-6">
                    <p className="text-center text-lg mb-4">
                        Deuda actual: <span className="font-bold text-red-400">{formatCurrency(customer.creditBalance)}</span>
                    </p>
                    
                    <div className="flex space-x-2 mb-4">
                        <button onClick={() => setMethod('cash')} className={`flex-1 py-3 font-semibold rounded-lg flex items-center justify-center gap-2 ${method === 'cash' ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                            <CurrencyEuroIcon className="h-6 w-6"/> Efectivo
                        </button>
                        <button onClick={() => setMethod('card')} className={`flex-1 py-3 font-semibold rounded-lg flex items-center justify-center gap-2 ${method === 'card' ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                            <CreditCardIcon className="h-6 w-6"/> Tarjeta
                        </button>
                    </div>

                    <div className="relative mb-4">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-gray-400">€</span>
                        <input type="text" readOnly value={amount} className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg py-3 pl-12 pr-4 text-4xl text-right font-mono"/>
                    </div>
                     <div className="grid grid-cols-3 gap-2 mb-4">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'].map(key => (
                            <button key={key} onClick={() => handleNumpad(key)} className="text-xl font-bold bg-gray-700 rounded-lg py-3 hover:bg-gray-600">
                                {key === 'del' ? '⌫' : key}
                            </button>
                        ))}
                    </div>
                     <button onClick={() => setAmount(customer.creditBalance.toFixed(2))} className="w-full py-2 bg-gray-600 rounded-lg font-semibold hover:bg-gray-700">Pagar Deuda Completa</button>
                </div>
                <div className="p-6 bg-gray-900 rounded-b-2xl flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 rounded-lg font-semibold hover:bg-gray-700">Cancelar</button>
                    <button type="button" onClick={handleConfirm} className="py-2 px-4 bg-green-600 rounded-lg font-semibold hover:bg-green-700">Confirmar Pago</button>
                </div>
            </div>
        </div>
    );
};

export default CreditPaymentModal;