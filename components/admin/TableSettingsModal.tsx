import React, { useState, useEffect } from 'react';
import { Table, TableShape } from '../../types';
import { XMarkIcon, TrashIcon } from '../icons';

interface TableSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    table: Table;
    onSave: (table: Table) => void;
    onDelete: (tableId: number) => void;
}

const TableSettingsModal: React.FC<TableSettingsModalProps> = ({ isOpen, onClose, table, onSave, onDelete }) => {
    const [formData, setFormData] = useState<Table>(table);

    useEffect(() => {
        setFormData(table);
    }, [table, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numValue = ['capacity', 'width', 'height'].includes(name) ? parseInt(value, 10) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: numValue }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleDelete = () => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar "${formData.name}"?`)) {
            onDelete(formData.id);
        }
    }

    const shapes: TableShape[] = ['square', 'rectangle', 'circle', 'fixture'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">Ajustes de: {table.name}</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nombre / Etiqueta</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="capacity" className="block text-sm font-medium text-gray-300">Capacidad (0 para objetos)</label>
                            <input
                                type="number"
                                name="capacity"
                                id="capacity"
                                value={formData.capacity}
                                onChange={handleChange}
                                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500"
                                required
                                min="0"
                            />
                        </div>
                        <div>
                            <label htmlFor="shape" className="block text-sm font-medium text-gray-300">Forma</label>
                            <select
                                name="shape"
                                id="shape"
                                value={formData.shape}
                                onChange={handleChange}
                                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500"
                            >
                                {shapes.map(s => (
                                    <option key={s} value={s} className="capitalize">{s === 'fixture' ? 'Objeto (Decoración)' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label htmlFor="width" className="block text-sm font-medium text-gray-300">Ancho (px)</label>
                                <input type="number" name="width" id="width" value={formData.width} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3"/>
                            </div>
                             <div className="flex-1">
                                <label htmlFor="height" className="block text-sm font-medium text-gray-300">Alto (px)</label>
                                <input type="number" name="height" id="height" value={formData.height} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3"/>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-900 rounded-b-2xl flex justify-between items-center">
                        <button type="button" onClick={handleDelete} className="py-2 px-4 bg-red-800 rounded-lg font-semibold hover:bg-red-700 flex items-center gap-2">
                            <TrashIcon className="h-5 w-5"/> Eliminar
                        </button>
                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 rounded-lg font-semibold hover:bg-gray-700">Cancelar</button>
                            <button type="submit" className="py-2 px-4 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-700">Guardar Cambios</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TableSettingsModal;
