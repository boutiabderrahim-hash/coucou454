import React, { useState } from 'react';
import { InventoryItem, MenuItem } from '../../types';
import { XMarkIcon } from '../icons';

interface InitialStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (initialData: Omit<InventoryItem, 'id' | 'name'>) => void;
    menuItem: MenuItem;
}

const InitialStockModal: React.FC<InitialStockModalProps> = ({ isOpen, onClose, onConfirm, menuItem }) => {
    const [formData, setFormData] = useState<Omit<InventoryItem, 'id' | 'name'>>({
        quantity: 0,
        unit: 'units',
        lowStockThreshold: 10,
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numValue = ['quantity', 'lowStockThreshold'].includes(name) ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: numValue as any }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Activar Seguimiento para: <span className="text-indigo-400">{menuItem.name}</span></h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">Cantidad Inicial</label>
                            <input
                                type="number"
                                name="quantity"
                                id="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3"
                                required
                                autoFocus
                                step="any"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label htmlFor="unit" className="block text-sm font-medium text-gray-300">Unidad</label>
                                <select name="unit" id="unit" value={formData.unit} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3">
                                    <option value="units">unidades</option>
                                    <option value="kg">kg</option>
                                    <option value="liters">litros</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-300">Alerta de Stock Bajo</label>
                                <input
                                    type="number"
                                    name="lowStockThreshold"
                                    id="lowStockThreshold"
                                    value={formData.lowStockThreshold}
                                    onChange={handleChange}
                                    className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3"
                                    required
                                    step="any"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-900 rounded-b-2xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 rounded-lg font-semibold hover:bg-gray-700">Cancelar</button>
                        <button type="submit" className="py-2 px-4 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-700">Guardar y Activar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InitialStockModal;