import React, { useState, useEffect, useMemo } from 'react';
import { Order } from '../types';
import { XMarkIcon } from './icons';
import { formatCurrency } from '../utils/helpers';

interface DiscountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (value: number) => void;
    onRemove: () => void;
    order: Order;
}

const DiscountModal: React.FC<DiscountModalProps> = ({ isOpen, onClose, onApply, onRemove, order }) => {
    const [value, setValue] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (order.discount && order.discount.type === 'fixed') {
                setValue(order.discount.value.toString());
            } else {
                setValue('');
            }
        }
    }, [isOpen, order]);

    const calculatedDiscount = useMemo(() => {
        const numValue = parseFloat(value) || 0;
        return numValue > 0 ? numValue : 0;
    }, [value]);

    const originalTotal = useMemo(() => {
         // This is the total *before* any discount is applied
        return order.total + (order.discount?.amount || 0);
    }, [order]);


    if (!isOpen) return null;

    const handleApply = () => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue <= 0) {
            alert("Por favor, introduzca un valor válido.");
            return;
        }
        onApply(numValue);
    };

    const handleNumpad = (key: string) => {
        if (key === 'del') {
            setValue(v => v.slice(0, -1));
        } else if (key === '.') {
            if (!value.includes('.')) setValue(v => v + '.');
        } else {
            setValue(v => v + key);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Aplicar Descuento</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
                </div>

                <div className="p-6">
                    <div className="relative mb-4">
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl font-bold text-gray-400">€</span>
                        <input type="text" readOnly value={value} className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg py-4 pl-4 pr-14 text-5xl font-mono"/>
                    </div>

                     <div className="grid grid-cols-3 gap-2 mb-6">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'].map(key => (
                            <button key={key} onClick={() => handleNumpad(key)} className="text-2xl font-bold bg-gray-700 rounded-lg py-4 hover:bg-gray-600">
                                {key === 'del' ? '⌫' : key}
                            </button>
                        ))}
                    </div>

                    <div className="bg-gray-900 p-4 rounded-lg text-center">
                        <p className="text-gray-400">Total Original: {formatCurrency(originalTotal)}</p>
                        <p className="text-lg text-red-400">Descuento: -{formatCurrency(calculatedDiscount)}</p>
                        <p className="text-xl font-bold text-green-400">Nuevo Total: {formatCurrency(originalTotal - calculatedDiscount)}</p>
                    </div>
                </div>

                <div className="p-6 bg-gray-900 rounded-b-2xl flex justify-between gap-3">
                    <button onClick={onRemove} disabled={!order.discount} className="py-3 px-6 bg-red-800 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-600 disabled:opacity-50">Eliminar Descuento</button>
                    <div className="flex gap-3">
                         <button onClick={onClose} className="py-3 px-6 bg-gray-600 rounded-lg font-semibold hover:bg-gray-700">Cancelar</button>
                         <button onClick={handleApply} className="py-3 px-6 bg-green-600 rounded-lg font-semibold hover:bg-green-700">Aplicar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiscountModal;